/**
 * HTTP Request Header Validator
 * Validates header names and values per RFC 7230
 */

function validateHeader(name, value) {
  const warnings = [];

  // Check for empty name/value
  if (!name || !value) {
    return { valid: false, message: "Header name and value are required.", warnings: [] };
  }

  // Check CRLF injection
  if (/[\r\n]/.test(name) || /[\r\n]/.test(value)) {
    return { valid: false, message: "CRLF injection detected in header name/value.", warnings: [] };
  }

  // Validate header name per RFC 7230 token
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid header name: contains illegal characters.", warnings: [] };
  }

  // Validate header value
  const valueRegex = /^[\t\x20-\x7E\x80-\xFF]*$/;
  if (!valueRegex.test(value)) {
    return { valid: false, message: "Invalid header value: contains illegal characters.", warnings: [] };
  }

  // Security warnings
  if (name === "Authorization" && !value.startsWith("Bearer ") && !value.startsWith("Basic ")) {
    warnings.push("Authorization header should use Bearer or Basic scheme.");
  }

  if (name === "Content-Type" && value.trim() === "") {
    warnings.push("Content-Type value should not be empty.");
  }

  if (name === "X-Forwarded-For") {
    warnings.push("X-Forwarded-For can be spoofed; use with caution.");
  }

  return {
    valid: true,
    message: "Header is valid.",
    warnings
  };
}

module.exports = validateHeader;
