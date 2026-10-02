const express = require("express");
const router = express.Router();
const masterConfigController = require("../controllers/master-config.controller");

router.post("/", masterConfigController.createMasterConfig);
router.get("/", masterConfigController.getAllMasterConfigs);
router.get("/:id", masterConfigController.getMasterConfigById);
router.put("/:id", masterConfigController.updateMasterConfig);
router.delete("/:id", masterConfigController.deleteMasterConfig);

module.exports = router;
