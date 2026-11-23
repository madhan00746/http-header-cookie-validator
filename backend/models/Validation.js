const mongoose = require("mongoose");

const validationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["HTTP Header", "Response Header", "Cookie", "Session"] },
  input: { name: String, value: String },
  valid: { type: Boolean, required: true },
  message: { type: String },
  warnings: [String],
  sessionId: { type: String },
  fromState: { type: String },
  toState: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Validation", validationSchema);
