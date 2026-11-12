const express = require('express');
const {z} = require("zod")
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const {requireAuth} = require("../middleware/auth");
const {validate} = require("../middleware/validate");
const {uploadPdf} = require("../middleware/upload");

const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");

const {extractText} = require("../services/pdfService");
const {parseResume: parseStructured} = require("../services/structuredParser");

const router = express.Router();
router.use(requireAuth);

const objectIdSchema = z.string().refine((v) => mongoose.isValidObjectId(v), {message: "Invalid ID"});

const idParam = z.object({id: objectIdSchema});

async function loadOwnedResume(req) {
    const resume = await Resume.findOne({_id: req.params.id, userId: req.user._id});

    if(!resume) {
        throw ApiError.notFound("Resume not found");
    }
    
    return resume;
}

async function loadVersion(resumeId, loadVersion) {
    const version = await ResumeVersion.findOne({_id: loadVersion, resumeId});

    if(!version) {
        throw ApiError.notFound("Version not found");
    }

    return version;
}

router.post(
    "/",
    uploadPdf("file"),
    asyncHandler(async (req, res) => {
        const {text, meta} = await extractText(req.file.buffer);
        const parsedSections = await parseStructured(text);

        const title = 
            (req.body.title || "").trim() || 
            req.file.originalname.replace(/\.pdf$/i, "") ||
            "Untitled Resume";

        const resume = await Resume.create({
            userId: req.user._id,
            title,
            latestVersionNumber: 1,
        });

        const version = await ResumeVersion.create({
            resumeId: resume._id,
            versionNumber: 1,
            label: "V1",
            rawText: text,
            parsedSections,
            sourceType: "pdf",
            parentVersionId: null,
        });

        resume.currentVersionId = version._id;
        await resume.save();

        res.status(201).json({resume, version, meta});
    })
)

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const resumes = await Resume.find({userId: req.user._id}).sort({createdAt: -1}).lean();
        res.json(resumes);
    })
);

router.get(
    "/:id",
    validate(idParam, "params"),
    asyncHandler(async (req, res) => {
        const resume = await loadOwnedResume(req);
        const versions = await ResumeVersion.find({resumeId: resume._id}).sort({versionNumber: 1}).select("-rawText").lean();
        res.json({resume, versions});
    })
);

router.get(
    "/:id/versions/:versionId",
    validate(z.object({id: objectIdSchema, versionId: objectIdSchema}), "params"),
    asyncHandler(async (req, res) => {
        const resume = await loadOwnedResume(req);
        const version = await loadVersion(resume._id, req.params.versionId);
        res.json({version});
    })
);

router.delete(
    "/:id",
    validate(idParam, "params"),
    asyncHandler(async (req, res) => {
        const resume = await loadOwnedResume(req);
        await ResumeVersion.deleteMany({resumeId: resume._id});
        await resume.deleteOne();
        res.json({ok: true});
    })
);

module.exports = router;