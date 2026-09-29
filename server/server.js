const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const protect = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();

// Updated CORS Middleware to allow DELETE and preflight OPTIONS requests
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Smart Resource & Equipment Booking Portal API is running!"
  });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });