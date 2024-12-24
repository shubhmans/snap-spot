const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const userController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

router.get("/", userController.getAllUsers);

router.post(
    "/signup",
    fileUpload.single("imageUrl"),
    [
        check("username").not().isEmpty(),
        check("password").isLength({ min: 6 }),
        check("email").normalizeEmail().isEmail(),
    ],
    userController.signup
);

router.post("/login", userController.login);

module.exports = router;
