const mongoose = require("mongoose");

const templateVersionSchema =
  new mongoose.Schema(
    {
      template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
        required: true
      },

      version_number: {
        type: Number,
        required: true
      },

      template_json: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    {
      timestamps: {
        createdAt: "created_at",
        updatedAt: false
      }
    }
  );

module.exports =
  mongoose.model(
    "TemplateVersion",
    templateVersionSchema
  );