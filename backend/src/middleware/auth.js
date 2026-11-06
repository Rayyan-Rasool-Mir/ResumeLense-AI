const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const {verifyToken} = require('../utils/jwt');
const User = require('../models/User');

async function requireAuth(req, res, next) {
    try{
        const token = req.cookies?.[env.cookieName];
        if(!token){
            throw ApiError.unauthorized("Authentication token missing");
        }

        const payload = verifyToken(token);
        const user = await User.findById(payload.sub);
        if(!user){
            throw ApiError.unauthorized("Session no longer valid");
        }

        req.user = user;
        next();
    } catch(err){
        if(err.name === "TokenExpiredError" || err.name === "JsonWebTokenError"){
            next(ApiError.unauthorized("Authentication token expired or invalid"));
        }

        next(err);
    }
}

module.exports = {requireAuth};