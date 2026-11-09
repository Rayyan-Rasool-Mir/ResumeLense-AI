const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_BYTES =5*1024*1024; //5mb

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: MAX_BYTES, files: 1},
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(ApiError.badRequest('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

const uploadPdf = (field = "file") => (req, res, next) => {
    upload.single(field)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(ApiError.badRequest("PDF size exceeds 5MB limit"));
            }
            return next(ApiError.badRequest(err.message));
        }
        if (err) {
            return next(err);
        }
        if(!req.file) {
            return next(ApiError.badRequest("No file uploaded"));
        }
        next();
    });
}

module.exports = {uploadPdf};