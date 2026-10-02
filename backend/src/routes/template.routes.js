const express = require("express");
const templateController = require("../controllers/template.controller");

const router = express.Router();

router.route("/")
    .get(templateController.getAllTemplates)
    .post(templateController.createTemplate);

router.route("/:id")
    .get(templateController.getTemplateById)
    .put(templateController.updateTemplate)
    .delete(templateController.deleteTemplate);

module.exports = router;
