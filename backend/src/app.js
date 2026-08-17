const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

require("./config/db");

// Routes
const templateRoutes = require("./routes/template.routes");

app.use("/api/templates", templateRoutes);

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Checklist Management API Running..."
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});