const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const validationRoutes = require("./routes/validationRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/validation", validationRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "HTTP Header and Cookie Validation Platform is Running!", version: "2.0.0" });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend connected successfully!", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  });
