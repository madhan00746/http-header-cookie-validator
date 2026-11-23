/**
 * Seed Database with Sample Demonstrations
 * Run via: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Validation = require("./models/Validation");
const validateHeader = require("./validators/headerValidator");
const validateResponseHeader = require("./validators/responseHeaderValidator");
const validateCookie = require("./validators/cookieValidator");
const updateSessionState = require("./validators/sessionManager");

async function seed() {
  console.log("🌱 Connecting to MongoDB Atlas for sample seeding...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected.");

  const sampleDir = path.join(__dirname, "..", "sample-data");

  // Read sample files
  const headerSamples = JSON.parse(fs.readFileSync(path.join(sampleDir, "header-samples.json"), "utf8"));
  const responseSamples = JSON.parse(fs.readFileSync(path.join(sampleDir, "response-header-samples.json"), "utf8"));
  const cookieSamples = JSON.parse(fs.readFileSync(path.join(sampleDir, "cookie-samples.json"), "utf8"));
  const sessionSamples = JSON.parse(fs.readFileSync(path.join(sampleDir, "session-samples.json"), "utf8"));

  let count = 0;

  // Headers
  for (const item of headerSamples) {
    const res = validateHeader(item.input.name, item.input.value);
    await Validation.create({
      type: "HTTP Header",
      input: item.input,
      valid: res.valid,
      message: res.message,
      warnings: res.warnings || [],
    });
    count++;
  }

  // Response headers
  for (const item of responseSamples) {
    const res = validateResponseHeader(item.input.name, item.input.value);
    await Validation.create({
      type: "Response Header",
      input: item.input,
      valid: res.valid,
      message: res.message,
      warnings: res.warnings || [],
    });
    count++;
  }

  // Cookies
  for (const item of cookieSamples) {
    const res = validateCookie(item.input.name, item.input.value);
    await Validation.create({
      type: "Cookie",
      input: item.input,
      valid: res.valid,
      message: res.message,
      warnings: res.warnings || [],
    });
    count++;
  }

  // Sessions
  for (const item of sessionSamples) {
    const res = updateSessionState(item.input.currentState, item.input.event);
    await Validation.create({
      type: "Session",
      input: { name: item.input.currentState, value: item.input.event },
      valid: res.success,
      message: res.message,
      fromState: res.fromState,
      toState: res.toState,
    });
    count++;
  }

  console.log(`🎉 Successfully seeded ${count} validation samples into MongoDB Atlas.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
