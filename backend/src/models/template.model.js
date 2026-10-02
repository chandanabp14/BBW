const mongoose = require("mongoose");

// Builder structures are stored as flexible JSON so each checklist can be
// restored exactly as it was designed.
const templateSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        checklistType: { type: String, default: "Inspection" },
        generalDetailsRows: { type: [mongoose.Schema.Types.Mixed], default: [] },
        tables: { type: [mongoose.Schema.Types.Mixed], default: [] },
        status: { type: String, enum: ["draft", "published"], required: true },
        items: { type: [mongoose.Schema.Types.Mixed], default: [] },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true },
        inspectionSubmittedAt: { type: String }
    },
    { versionKey: false }
);

module.exports = mongoose.model("Template", templateSchema);
