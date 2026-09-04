const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Database connection
const connectDB = require("./backend/config/db");

// Routes
const authRoutes = require("./backend/routes/authRoutes");
const postRoutes = require("./backend/routes/postRoutes");

// Load environment variables
dotenv.config({
    path: "./backend/.env"
});

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(
    "/uploads",
    express.static("backend/uploads")
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