const mongoose = require("mongoose");

const masterConfigSchema = new mongoose.Schema(
    {
        id: { type: Number, index: true, sparse: true },
        name: { type: String, required: true, trim: true },
        reportTitle: { type: String },
        companyName: { type: String },
        companySubtitle: { type: String },
        configType: { type: String, default: "Both" },
        mcType: { type: String, default: "PDC" },
        documentCode: { type: String },
        partName: { type: String },
        partType: { type: String },
        partNumber: { type: String },
        machineType: { type: String },
        machine: { type: String },
        sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
        groups: { type: [mongoose.Schema.Types.Mixed], default: [] },
        parameters: { type: [mongoose.Schema.Types.Mixed], default: [] },
        layoutConfig: { type: mongoose.Schema.Types.Mixed },
        publishedTemplateId: { type: Number },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true }
    },
    { versionKey: false, strict: false }
);

module.exports = mongoose.model("MasterConfig", masterConfigSchema);

