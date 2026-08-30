const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const templateController =
  require("../controllers/template.controller");


// =====================================================
// IMAGE UPLOAD CONFIGURATION
// =====================================================

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {

    cb(
      null,
      path.join(
        __dirname,
        "../../uploads"
      )
    );

  },


  filename: function (
    req,
    file,
    cb
  ) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1E9
      );

    const extension =
      path.extname(
        file.originalname
      );

    cb(
      null,
      uniqueName + extension
    );

  }

});


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({

  storage: storage,

  limits: {

    // Maximum image size = 10 MB
    fileSize:
      10 * 1024 * 1024

  },


  fileFilter: function (
    req,
    file,
    cb
  ) {

    if (
      file.mimetype.startsWith(
        "image/"
      )
    ) {

      cb(
        null,
        true
      );

    }

    else {

      cb(
        new Error(
          "Only image files are allowed."
        )
      );

    }

  }

});


// =====================================================
// UPLOAD IMAGE
// =====================================================

router.post(
  "/upload-image",

  upload.single(
    "image"
  ),

  templateController.uploadImage
);


// =====================================================
// CREATE TEMPLATE
// =====================================================

router.post(
  "/",
  templateController.createTemplate
);


// =====================================================
// GET ALL TEMPLATES
// =====================================================

router.get(
  "/",
  templateController.getAllTemplates
);


// =====================================================
// PUBLISH TEMPLATE
// =====================================================

router.put(
  "/publish/:id",
  templateController.publishTemplate
);


// =====================================================
// UPDATE TEMPLATE
// IMPORTANT FOR SAVE DRAFT
// =====================================================

router.put(
  "/:id",
  templateController.updateTemplate
);


// =====================================================
// SAVE TEMPLATE VERSION
// =====================================================

router.post(
  "/:id/version",
  templateController.saveTemplateVersion
);


// =====================================================
// GET LATEST VERSION
// =====================================================

router.get(
  "/:id/version/latest",
  templateController.getLatestVersion
);


// =====================================================
// GET ALL VERSIONS
// =====================================================

router.get(
  "/:id/versions",
  templateController.getVersions
);


// =====================================================
// GET TEMPLATE BY ID
// =====================================================

router.get(
  "/:id",
  templateController.getTemplateById
);


// =====================================================
// DELETE TEMPLATE
// =====================================================

router.delete(
  "/:id",
  templateController.deleteTemplate
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;