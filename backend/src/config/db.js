const mongoose = require("mongoose");
require("dotenv").config();

const connectDatabase = async () => {
    const connectionString = process.env.MONGODB_URI;

    if (!connectionString) {
        throw new Error("MONGODB_URI is not configured.");
    }

    await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully.");
};

module.exports = connectDatabase;
