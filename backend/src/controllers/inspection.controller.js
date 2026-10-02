const Inspection = require("../models/inspection.model");

const sendError = (res, error) => {
    res.status(500).json({ success: false, message: error.message });
};

exports.createInspection = async (req, res) => {
    try {
        const inspection = await Inspection.create(req.body);
        res.status(201).json({ success: true, data: inspection });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getAllInspections = async (_req, res) => {
    try {
        const inspections = await Inspection.find().sort({ updatedAt: -1 }).lean();
        res.json({ success: true, data: inspections });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getInspectionById = async (req, res) => {
    try {
        const inspection = await Inspection.findOne({ id: Number(req.params.id) }).lean();
        if (!inspection) {
            return res.status(404).json({ success: false, message: "Inspection record not found." });
        }
        res.json({ success: true, data: inspection });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateInspection = async (req, res) => {
    try {
        const inspection = await Inspection.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );
        res.json({ success: true, data: inspection });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteInspection = async (req, res) => {
    try {
        await Inspection.findOneAndDelete({ id: Number(req.params.id) });
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};
