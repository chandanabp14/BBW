const Template =
  require("./template.schema");

const TemplateVersion =
  require("./templateVersion.schema");


// =====================================================
// CREATE TEMPLATE
// =====================================================

const createTemplate = async (data) => {

  const template = await Template.create({

    template_name:
      data.template_name,

    checklist_type:
      data.checklist_type,

    status:
      data.status || "Draft",

    created_by:
      data.created_by || 1

  });

  return template;

};


// =====================================================
// GET ALL TEMPLATES
// =====================================================

const getAllTemplates = async () => {

  const templates =
    await Template
      .find()
      .sort({
        created_at: -1
      });

  return templates;

};


// =====================================================
// GET TEMPLATE BY ID
// =====================================================

const getTemplateById = async (id) => {

  const template =
    await Template.findById(id);

  return template;

};


// =====================================================
// UPDATE TEMPLATE DETAILS
// =====================================================

const updateTemplate = async (
  id,
  data
) => {

  const template =
    await Template.findByIdAndUpdate(
      id,
      {
        template_name:
          data.template_name,

        checklist_type:
          data.checklist_type
      },
      {
        new: true,
        runValidators: true
      }
    );

  return template;

};


// =====================================================
// PUBLISH TEMPLATE
// =====================================================

const publishTemplate = async (id) => {

  const template =
    await Template.findByIdAndUpdate(

      id,

      {
        status: "Published"
      },

      {
        new: true
      }

    );

  return template;

};


// =====================================================
// SAVE TEMPLATE VERSION
// =====================================================

const saveTemplateVersion = async (
  templateId,
  data
) => {

  const latestVersion =
    await TemplateVersion
      .findOne({
        template_id: templateId
      })
      .sort({
        version_number: -1
      });


  const nextVersionNumber =
    latestVersion
      ? latestVersion.version_number + 1
      : 1;


  const version =
    await TemplateVersion.create({

      template_id:
        templateId,

      version_number:
        nextVersionNumber,

      template_json:
        data

    });


  return version;

};


// =====================================================
// GET LATEST VERSION
// =====================================================

const getLatestVersion = async (
  templateId
) => {

  const version =
    await TemplateVersion
      .findOne({
        template_id: templateId
      })
      .sort({
        version_number: -1
      });

  return version;

};


// =====================================================
// GET ALL VERSIONS
// =====================================================

const getVersions = async (
  templateId
) => {

  const versions =
    await TemplateVersion
      .find({
        template_id: templateId
      })
      .sort({
        version_number: -1
      });

  return versions;

};


// =====================================================
// DELETE TEMPLATE
// =====================================================

const deleteTemplate = async (id) => {

  const template =
    await Template.findByIdAndDelete(id);


  if (!template) {

    return null;

  }


  await TemplateVersion.deleteMany({
    template_id: id
  });


  return template;

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  createTemplate,

  getAllTemplates,

  getTemplateById,

  updateTemplate,

  publishTemplate,

  saveTemplateVersion,

  getLatestVersion,

  getVersions,

  deleteTemplate

};