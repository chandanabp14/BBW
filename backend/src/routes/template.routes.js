const express = require("express");

const router = express.Router();

const templateController =
require("../controllers/template.controller");

// Create Template
router.post(
    "/",
    templateController.createTemplate
);

// Get All Templates
router.get(
    "/",
    templateController.getAllTemplates
);

// Get Template By ID
router.get(
    "/:id",
    templateController.getTemplateById
);

// Publish Template
router.put(
    "/publish/:id",
    templateController.publishTemplate
);
// Save Version
router.post(
    "/:id/version",
    templateController.saveTemplateVersion
);

// Latest Version
router.get(
    "/:id/version/latest",
    templateController.getLatestVersion
);

// All Versions
router.get(
    "/:id/versions",
    templateController.getVersions
);

module.exports = router;