const jwt = require("jsonwebtoken");

const HttpError = require("../modals/http-errors");

module.exports = (req, res, next) => {
    // Default behavior of browser will send options request to server to check the url
    //this will be without token, so we are allowing all options request
    if (req.method == "OPTIONS") {
        return next();
    }
    try {
        // Authorization: 'Bearer Token...'
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return next(
                new HttpError("Please pass the token in the header", 401)
            );
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = {
            userId: decodedToken.userId,
        };
        next();
    } catch (err) {
        return next(new HttpError("Authentication failed", 403));
    }
};
