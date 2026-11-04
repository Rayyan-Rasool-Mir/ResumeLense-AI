const env = require('../config/env');
const ApiError = require('../utils/ApiError');;

function notFound(req, res, next) {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}

function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const details = err.details || null;

    if (err.name === "ValidationError" && err.errors) {
        status = 400;
        details = Object.fromEntries(
            Object.entries(err.errors).map(([k, v]) => [k, v.message])
        );

        message = "Validation Error";
    } else if (err.name === "CastError") {
        status = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
        status = 409;
        message = "Duplicate Key";
        details = err.keyValue;
    } else if(err.name === "ZodError") {
        status = 400;
        message = "Validation Error";
        details = err.issues;
    }

    if(status >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    res.status(status).json({
        error:{
            message,
            ...(details ? { details } : {}),
            ...(env.isProd ? {} : { stack: err.stack }),
        },
    });
}

module.exports = { notFound, errorHandler };