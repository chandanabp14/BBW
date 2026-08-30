const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
      trim: true
    },

    checklist_type: {
      type: String,
      enum: ["Inspection", "Setup"],
      required: true
    },

    status: {
      type: String,
      default: "Draft"
    },

    created_by: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

module.exports =
  mongoose.model(
    "Template",
    templateSchema
  );