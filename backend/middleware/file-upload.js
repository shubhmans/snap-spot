const multer = require("multer");
const { v4: uuid } = require("uuid");

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
};
const fileUpload = multer({
    limits: 500000, //500 kb
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/images");
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuid() + "." + ext);
        },
    }),
    fileFilter: (req, file, cb) => {
        //if undefined this will be converted to false or else true
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        const error = isValid ? null : new Error("Invalid mime type");
        cb(error, isValid);
    },
});

module.exports = fileUpload;
