const pool = require("../config/db");

// Create Template
const createTemplate = async (template) => {
    const { template_name, checklist_type, created_by } = template;

    const query = `
        INSERT INTO templates
        (template_name, checklist_type, status, created_by)
        VALUES ($1, $2, 'Draft', $3)
        RETURNING *;
    `;

    const values = [
        template_name,
        checklist_type,
        created_by
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get All Templates
const getAllTemplates = async () => {

    const result = await pool.query(`
        SELECT *
        FROM templates
        ORDER BY id DESC;
    `);

    return result.rows;
};

// Get Template By ID
const getTemplateById = async (id) => {

    const result = await pool.query(
        `SELECT * FROM templates WHERE id=$1`,
        [id]
    );

    return result.rows[0];
};

// Publish Template
const publishTemplate = async (id) => {

    const result = await pool.query(
        `
        UPDATE templates
        SET status='Published'
        WHERE id=$1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

// Save Template Version
const saveTemplateVersion = async (
    templateId,
    templateJson
) => {

    const versionResult = await pool.query(
        `
        SELECT COALESCE(MAX(version_number),0)+1 AS version
        FROM template_versions
        WHERE template_id=$1
        `,
        [templateId]
    );

    const version = versionResult.rows[0].version;

    const result = await pool.query(
        `
        INSERT INTO template_versions
        (
            template_id,
            version_number,
            template_json
        )
        VALUES($1,$2,$3)
        RETURNING *;
        `,
        [
            templateId,
            version,
            templateJson
        ]
    );

    return result.rows[0];

};

// Latest Version
const getLatestVersion = async (templateId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM template_versions
        WHERE template_id=$1
        ORDER BY version_number DESC
        LIMIT 1
        `,
        [templateId]
    );

    return result.rows[0];

};

// All Versions
const getVersions = async (templateId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM template_versions
        WHERE template_id=$1
        ORDER BY version_number DESC
        `,
        [templateId]
    );

    return result.rows;

};

module.exports = {

    createTemplate,

    getAllTemplates,

    getTemplateById,

    publishTemplate,

    saveTemplateVersion,

    getLatestVersion,

    getVersions

};