const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const path = require("path");

// Load environment variables
dotenv.config({
    path: path.join(__dirname, ".env")
});

// Database connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
    "/uploads",
    express.static(uploadDir)
);

// Test route
app.get("/test", (req, res) => {
    res.send("TEST ROUTE WORKS");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Social Media App Backend is running!");
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});