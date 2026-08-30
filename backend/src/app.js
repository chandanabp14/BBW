const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB =
  require("./config/db");

const templateRoutes =
  require("./routes/template.routes");

const app = express();


// =====================================================
// CONNECT MONGODB
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json({
    limit: "30mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "30mb"
  })
);


// =====================================================
// SERVE UPLOADED IMAGES
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "../uploads"
    )
  )
);


// =====================================================
// TEMPLATE ROUTES
// =====================================================

app.use(
  "/api/templates",
  templateRoutes
);


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message:
      "Checklist Management API Running..."
  });

});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message:
      "Route not found."
  });

});


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Server running on Port ${PORT}`
    );

  }
);