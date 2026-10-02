const MasterConfig = require("../models/master-config.model");

const sendError = (res, error) => {
    const status = error.code === 11000 ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
};

exports.createMasterConfig = async (req, res) => {
    try {
        const config = await MasterConfig.create(req.body);
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getAllMasterConfigs = async (_req, res) => {
    try {
        const configs = await MasterConfig.find().sort({ updatedAt: -1 }).lean();
        res.json({ success: true, data: configs });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getMasterConfigById = async (req, res) => {
    try {
        const config = await MasterConfig.findOne({ id: Number(req.params.id) }).lean();
        if (!config) {
            return res.status(404).json({ success: false, message: "Master Configuration not found." });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateMasterConfig = async (req, res) => {
    try {
        const config = await MasterConfig.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );
        res.json({ success: true, data: config });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteMasterConfig = async (req, res) => {
    try {
        await MasterConfig.findOneAndDelete({ id: Number(req.params.id) });
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};
