const mongoose = require("mongoose");

const masterConfigSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        configType: { type: String, default: "Both" },
        mcType: { type: String, default: "PDC" },
        partName: { type: String },
        partType: { type: String },
        partNumber: { type: String },
        machineType: { type: String },
        machine: { type: String },
        sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
        parameters: { type: [mongoose.Schema.Types.Mixed], default: [] },
        publishedTemplateId: { type: Number },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model("MasterConfig", masterConfigSchema);
