const templateModel = require("../models/template.model");

// Create Template
exports.createTemplate = async (req, res) => {

    try {

        const template = await templateModel.createTemplate(req.body);

        res.status(201).json({
            success: true,
            message: "Template created successfully.",
            data: template
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Templates
exports.getAllTemplates = async (req, res) => {

    try {

        const templates = await templateModel.getAllTemplates();

        res.json({
            success: true,
            data: templates
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Template By ID
exports.getTemplateById = async (req, res) => {

    try {

        const template =
            await templateModel.getTemplateById(req.params.id);

        if (!template) {

            return res.status(404).json({

                success: false,

                message: "Template not found."

            });

        }

        res.json({

            success: true,

            data: template

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Publish Template
exports.publishTemplate = async (req, res) => {

    try {

        const template =
            await templateModel.publishTemplate(req.params.id);

        res.json({

            success: true,

            message: "Template Published",

            data: template

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
// Save Template Version
exports.saveTemplateVersion = async (req,res)=>{

    try{

        const version =
        await templateModel.saveTemplateVersion(

            req.params.id,

            req.body

        );

        res.status(201).json({

            success:true,

            message:"Version saved.",

            data:version

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// Latest Version
exports.getLatestVersion=async(req,res)=>{

    try{

        const version=
        await templateModel.getLatestVersion(
            req.params.id
        );

        res.json({

            success:true,

            data:version

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// All Versions
exports.getVersions=async(req,res)=>{

    try{

        const versions=
        await templateModel.getVersions(
            req.params.id
        );

        res.json({

            success:true,

            data:versions

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};