const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const HttpError = require("./modals/http-errors");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/user-rotues");
const app = express();

// We need to define middleware here before the request is executed since the node
// executes code sequentially and expected all the middleware to be defined earlier

// any request with body will try to parse in json
app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

// This is only used for browser, for postman everything works fine
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});
app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

// This is only reached if no response is sent from routes definded before
app.use((req, res, next) => {
    throw new HttpError("Invalid path", 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        //if header is set than error is taken care so pass as it is
        return next(error);
    }
    res.status(error.code || 500).json({
        message: error.message || "Something went wrong",
    });
});

const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ozlsp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
    .connect(dbUrl)
    .then(() => {
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err);
    });
