const HttpError = require("../modals/http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../modals/user");

const getAllUsers = async (req, res, next) => {
    let users;
    try {
        // This will return only email and name of user
        //or we can use -password and return rest of the fields
        // users = await User.find({}, "email username");
        users = await User.find({}, "-password");
    } catch (err) {
        return next(new HttpError("Login failed, something went wront", 500));
    }

    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs, please check the form", 422)
        );
    }

    const { username, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        console.log(err);
        return next(new HttpError("Signup failed, something went wront", 500));
    }
    if (existingUser) {
        return next(
            new HttpError(
                "Cannot create user with provided email, user exists",
                422
            )
        );
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError("Signup failed, something went wront", 500));
    }

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        imageUrl: req.file.path,
        places: [],
    });

    try {
        await newUser.save();
    } catch (err) {
        return next(new HttpError("Failed to create user", 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    } catch (err) {
        return next(new HttpError("Failed to create user", 500));
    }
    res.status(201).json({
        userId: newUser.id,
        email: newUser.email,
        token: token,
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        console.log(err);
        return next(new HttpError("Login failed, something went wront", 500));
    }
    if (!existingUser) {
        return next(new HttpError("Invalid credentials", 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(
            new HttpError("Something went wrong, please try again", 500)
        );
    }

    if (!isValidPassword) {
        return next(new HttpError("Invalid credentials", 403));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    } catch (err) {
        return next(new HttpError("Failed to create user", 500));
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
    });
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
