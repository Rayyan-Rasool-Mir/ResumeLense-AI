const mongoose = require("mongoose");
const { mongoURI } = require("./env");

mongoose.set("strictQuery", true);

async function connectDB() {
    const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10_000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected.");
    });
}

module.exports = {connectDB};