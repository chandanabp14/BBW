const Template = require("../models/template.model");

const sendError = (res, error) => {
    const status = error.code === 11000 ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
};

exports.createTemplate = async (req, res) => {
    try {
        const template = await Template.create(req.body);
        res.status(201).json({ success: true, data: template });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getAllTemplates = async (_req, res) => {
    try {
        const templates = await Template.find().sort({ updatedAt: -1 }).lean();
        res.json({ success: true, data: templates });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findOne({ id: Number(req.params.id) }).lean();
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found." });
        }
        res.json({ success: true, data: template });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const template = await Template.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found." });
        }
        res.json({ success: true, data: template });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findOneAndDelete({ id: Number(req.params.id) });
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found." });
        }
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};
