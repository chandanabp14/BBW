const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");
const app = express();

app.use(cors());
// A complete checklist can contain many table cells and image data. Express's
// default JSON limit is only 100 KB, which caused save/publish requests to be
// rejected once a checklist became sufficiently large.
app.use(express.json({ limit: "10mb" }));

// Routes
const templateRoutes = require("./routes/template.routes");
const masterConfigRoutes = require("./routes/master-config.routes");
const inspectionRoutes = require("./routes/inspection.routes");

app.use("/api/templates", templateRoutes);
app.use("/api/master-configs", masterConfigRoutes);
app.use("/api/inspections", inspectionRoutes);

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Checklist Management API Running..."
    });
});

const PORT = process.env.PORT || 3000;

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on Port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Unable to start the API:", error.message);
        process.exit(1);
    });

// Return a useful response to the client when a request is too large instead
// of leaving the UI with an unexplained failed request.
app.use((error, _req, res, next) => {
    if (error?.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "The checklist is too large to save. Reduce embedded image size or split it into smaller checklists."
        });
    }

    next(error);
});
