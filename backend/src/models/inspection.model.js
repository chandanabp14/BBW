const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
    {
        id: { type: Number, index: true, sparse: true },
        masterConfigId: { type: Number, required: true },
        templateId: { type: Number },
        templateName: { type: String },
        mcType: { type: String },
        partName: { type: String },
        partNumber: { type: String },
        machine: { type: String },
        operator: { type: String },
        supervisor: { type: String },
        qcName: { type: String },
        date: { type: String },
        shift: { type: String },
        inspectionType: { type: String },
        parameterEntries: { type: mongoose.Schema.Types.Mixed, default: {} },
        generalDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
        startupIssues: { type: [mongoose.Schema.Types.Mixed], default: [] },
        approval: { type: mongoose.Schema.Types.Mixed, default: {} },
        overallResult: { type: String, default: "PENDING" },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true },
        submittedAt: { type: String }
    },
    { versionKey: false }
);

module.exports = mongoose.model("Inspection", inspectionSchema);
