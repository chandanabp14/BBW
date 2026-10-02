const express = require("express");
const router = express.Router();
const inspectionController = require("../controllers/inspection.controller");

router.post("/", inspectionController.createInspection);
router.get("/", inspectionController.getAllInspections);
router.get("/:id", inspectionController.getInspectionById);
router.put("/:id", inspectionController.updateInspection);
router.delete("/:id", inspectionController.deleteInspection);

module.exports = router;
