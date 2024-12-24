const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const placesController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");
const checkToken = require("../middleware/check-auth");

// Ordering of routes matter here too for mapping
router.get("/:placeId", placesController.getPlaceById);

router.get("/user/:userId", placesController.getUserPlacesByUserId);

// The place where we define middleware is also important as below which all
// routes listed will go through that middleware ex. auth
router.use(checkToken);

router.post(
    "/",
    fileUpload.single("imageUrl"),
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").not().isEmpty(),
    ],
    placesController.createPlace
);

router.patch(
    "/:placeId",
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    placesController.patchPlaceById
);

router.delete("/:placeId", placesController.deletePlaceById);

module.exports = router;
