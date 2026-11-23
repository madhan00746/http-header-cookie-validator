const express = require("express");
const router = express.Router();
const validateHeader = require("../validators/headerValidator");
const validateResponseHeader = require("../validators/responseHeaderValidator");
const validateCookie = require("../validators/cookieValidator");
const updateSessionState = require("../validators/sessionManager");
const Validation = require("../models/Validation");

// POST /api/validation/header
router.post("/header", async (req, res) => {
  try {
    const { name, value } = req.body;
    const result = validateHeader(name, value);
    const doc = await Validation.create({
      type: "HTTP Header",
      input: { name: name || "", value: value || "" },
      valid: result.valid,
      message: result.message,
      warnings: result.warnings || []
    });
    res.json({ type: "HTTP Header", input: { name, value }, ...result, id: doc._id, createdAt: doc.createdAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/validation/response
router.post("/response", async (req, res) => {
  try {
    const { name, value } = req.body;
    const result = validateResponseHeader(name, value);
    const doc = await Validation.create({
      type: "Response Header",
      input: { name: name || "", value: value || "" },
      valid: result.valid,
      message: result.message,
      warnings: result.warnings || []
    });
    res.json({ type: "Response Header", input: { name, value }, ...result, id: doc._id, createdAt: doc.createdAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/validation/cookie
router.post("/cookie", async (req, res) => {
  try {
    const { name, value } = req.body;
    const result = validateCookie(name, value);
    const doc = await Validation.create({
      type: "Cookie",
      input: { name: name || "", value: value || "" },
      valid: result.valid,
      message: result.message,
      warnings: result.warnings || []
    });
    res.json({ type: "Cookie", input: { name, value }, ...result, id: doc._id, createdAt: doc.createdAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/validation/session
router.post("/session", async (req, res) => {
  try {
    const { currentState, event } = req.body;
    const result = updateSessionState(currentState, event);
    const doc = await Validation.create({
      type: "Session",
      input: { name: currentState || "", value: event || "" },
      valid: result.success,
      message: result.message,
      fromState: result.fromState,
      toState: result.toState
    });
    res.json({ type: "Session", ...result, id: doc._id, createdAt: doc.createdAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/validation/history
router.get("/history", async (req, res) => {
  try {
    const { type, result, search, sort, page = 1, limit = 20 } = req.query;
    let query = {};
    if (type && type !== "all") query.type = type;
    if (result === "valid") query.valid = true;
    if (result === "invalid") query.valid = false;
    if (search) {
      query.$or = [
        { "input.name": { $regex: search, $options: "i" } },
        { "input.value": { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }
    const sortOrder = sort === "oldest" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Validation.countDocuments(query);
    const history = await Validation.find(query).sort({ createdAt: sortOrder }).skip(skip).limit(parseInt(limit));
    res.json({ history, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/validation/stats
router.get("/stats", async (req, res) => {
  try {
    const total = await Validation.countDocuments();
    const successful = await Validation.countDocuments({ valid: true });
    const failed = await Validation.countDocuments({ valid: false });
    const invalidHeaders = await Validation.countDocuments({ type: "HTTP Header", valid: false });
    const invalidResponseHeaders = await Validation.countDocuments({ type: "Response Header", valid: false });
    const invalidCookies = await Validation.countDocuments({ type: "Cookie", valid: false });
    const activeSessions = await Validation.countDocuments({ type: "Session", toState: "Active" });
    const expiredSessions = await Validation.countDocuments({ type: "Session", toState: "Expired" });
    const revokedSessions = await Validation.countDocuments({ type: "Session", toState: "Revoked" });
    const recent = await Validation.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      total, successful, failed,
      invalidHeaders, invalidResponseHeaders, invalidCookies,
      activeSessions, expiredSessions, revokedSessions,
      recent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/validation/history
router.delete("/history", async (req, res) => {
  try {
    const result = await Validation.deleteMany({});
    res.json({ success: true, message: `Deleted ${result.deletedCount} validation records.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
