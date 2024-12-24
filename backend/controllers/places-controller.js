const fs = require("fs");
const { validationResult } = require("express-validator");
const HttpError = require("../modals/http-errors");
const Place = require("../modals/place");
const User = require("../modals/user");
const { default: mongoose } = require("mongoose");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError("Failed to find place", 500));
    }

    if (!place) {
        // either we can throw error or use next to trigger error middleware defined in app.js
        return next(
            new HttpError("Could not find place with provided place id.", 404)
        );
    }
    // To get rid of _id, to id we use getters
    res.json({ place: place.toObject({ getters: true }) }); // place:place => place
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);

        return next(
            new HttpError("Invalid inputs, please check the form", 422)
        );
    }

    // Shortcut to req.body,title ...
    const { title, description, location, address } = req.body;
    const newPlace = new Place({
        title,
        description,
        address,
        location,
        imageUrl: req.file.path,
        creatorId: req.userData.userId,
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError("Failed to fetch user", 500));
    }

    if (!user) {
        return next(new HttpError("Failed to fetch user for provided id", 404));
    }

    // Here we want to perform multiple operations so transactions or sessions are involved if
    // one fails we need to rollback
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await newPlace.save({ session });
        user.places.push(newPlace);
        await user.save({ session });
        await session.commitTransaction();
    } catch (err) {
        console.log(err);

        return next(new HttpError("Failed to create place", 500));
    }

    res.status(201).json({ place: newPlace });
};

const patchPlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);

        throw new HttpError("Invalid inputs, please check the form", 422);
    }

    const placeId = req.params.placeId;
    const { title, description } = req.body;
    let updatedPlace;
    try {
        updatedPlace = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError("Failed to find place", 500));
    }

    if (updatedPlace.creatorId.toString() !== req.userData.userId) {
        return next(
            new HttpError("Unauthorized to perform this operation", 401)
        );
    }
    updatedPlace.title = title;
    updatedPlace.description = description;
    try {
        await updatedPlace.save();
    } catch (err) {
        return next(new HttpError("Failed to save place", 500));
    }

    res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;
    try {
        // populate works for 2 way connection for collections
        place = await Place.findById(placeId).populate("creatorId");
    } catch (err) {
        return next(new HttpError("Failed to find place by given id", 500));
    }
    if (!place) {
        return next(new HttpError("Failed to find place by given id", 404));
    }

    //here creatorId will be user object
    if (place.creatorId.id !== req.userData.userId) {
        return next(
            new HttpError("Unauthorized to perform this operation", 401)
        );
    }

    const imagePath = place.imageUrl;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.deleteOne({ session });
        place.creatorId.places.pull(place);
        await place.creatorId.save({ session });
        await session.commitTransaction();
    } catch (err) {
        console.log(err);

        return next(
            new HttpError(
                "Something went wrong while removing place for given id",
                500
            )
        );
    }

    fs.unlink(imagePath, (err) => {
        console.log(err);
    });
    res.status(200).json({
        message: "Deleted place",
    });
};

const getUserPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let places;
    try {
        // Optional: we can also use populate here, USer.fndById().populate(places)
        places = await Place.find({ creatorId: userId });
    } catch (err) {
        console.log(err);

        return next(new HttpError("Failed to find place", 500));
    }

    if (!places) {
        return next(
            new HttpError("Cannot find place for the provided user id.", 404)
        );
        //return is just used to stop further execution and not return multiple responses
    }
    res.json({
        places: places.map((place) => place.toObject({ getters: true })),
    }); // place:place => place
};

exports.getPlaceById = getPlaceById;
exports.getUserPlacesByUserId = getUserPlacesByUserId;
exports.createPlace = createPlace;
exports.patchPlaceById = patchPlaceById;
exports.deletePlaceById = deletePlaceById;
