const templateModel =
    require("../models/template.model");


// =====================================================
// CREATE TEMPLATE
// =====================================================

exports.createTemplate = async (req, res) => {

    try {

        const template =
            await templateModel.createTemplate(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Template created successfully.",
            data: template
        });

    } catch (error) {

        console.error(
            "Create Template Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// GET ALL TEMPLATES
// =====================================================

exports.getAllTemplates = async (req, res) => {

    try {

        const templates =
            await templateModel.getAllTemplates();

        return res.json({
            success: true,
            data: templates
        });

    } catch (error) {

        console.error(
            "Get Templates Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// GET TEMPLATE BY ID
// =====================================================

exports.getTemplateById = async (req, res) => {

    try {

        const template =
            await templateModel.getTemplateById(
                req.params.id
            );

        if (!template) {

            return res.status(404).json({
                success: false,
                message:
                    "Template not found."
            });

        }

        return res.json({
            success: true,
            data: template
        });

    } catch (error) {

        console.error(
            "Get Template Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// UPDATE TEMPLATE
// =====================================================

exports.updateTemplate = async (req, res) => {

    try {

        const template =
            await templateModel.updateTemplate(
                req.params.id,
                req.body
            );

        if (!template) {

            return res.status(404).json({
                success: false,
                message:
                    "Template not found."
            });

        }

        return res.json({
            success: true,
            message:
                "Template updated successfully.",
            data: template
        });

    } catch (error) {

        console.error(
            "Update Template Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// PUBLISH TEMPLATE
// =====================================================

exports.publishTemplate = async (req, res) => {

    try {

        const template =
            await templateModel.publishTemplate(
                req.params.id
            );

        if (!template) {

            return res.status(404).json({
                success: false,
                message:
                    "Template not found."
            });

        }

        return res.json({
            success: true,
            message:
                "Template Published",
            data: template
        });

    } catch (error) {

        console.error(
            "Publish Template Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// SAVE TEMPLATE VERSION
// =====================================================

exports.saveTemplateVersion = async (req, res) => {

    try {

        const version =
            await templateModel.saveTemplateVersion(
                req.params.id,
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Version saved.",
            data: version
        });

    } catch (error) {

        console.error(
            "Save Version Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// GET LATEST VERSION
// =====================================================

exports.getLatestVersion = async (req, res) => {

    try {

        const version =
            await templateModel.getLatestVersion(
                req.params.id
            );

        return res.json({
            success: true,
            data: version
        });

    } catch (error) {

        console.error(
            "Get Latest Version Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// GET ALL VERSIONS
// =====================================================

exports.getVersions = async (req, res) => {

    try {

        const versions =
            await templateModel.getVersions(
                req.params.id
            );

        return res.json({
            success: true,
            data: versions
        });

    } catch (error) {

        console.error(
            "Get Versions Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// DELETE TEMPLATE
// =====================================================

exports.deleteTemplate = async (req, res) => {

    try {

        const template =
            await templateModel.deleteTemplate(
                req.params.id
            );

        if (!template) {

            return res.status(404).json({
                success: false,
                message:
                    "Template not found."
            });

        }

        return res.json({
            success: true,
            message:
                "Template deleted successfully.",
            data: template
        });

    } catch (error) {

        console.error(
            "Delete Template Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// UPLOAD IMAGE
// =====================================================

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "No image was uploaded."
            });

        }


        // =================================================
        // CREATE PUBLIC IMAGE URL
        // =================================================

        const imageUrl =
            `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;


        console.log(
            "Image uploaded:",
            imageUrl
        );


        return res.status(201).json({

            success: true,

            message:
                "Image uploaded successfully.",

            data: {

                filename:
                    req.file.filename,

                imageUrl:
                    imageUrl

            }

        });

    } catch (error) {

        console.error(
            "Image Upload Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to upload image."

        });

    }

};