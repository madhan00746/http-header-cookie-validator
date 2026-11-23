/**
 * HTTP Response Header Validator
 * Validates response header names and values, checks security best practices
 */

function validateResponseHeader(name, value) {
  const warnings = [];

  // Check for empty name/value
  if (!name || value === undefined || value === null || (name === "" && value === "")) {
    return { valid: false, message: "Response header name and value are required.", warnings: [], securityNote: "" };
  }

  if (!name) {
    return { valid: false, message: "Response header name is required.", warnings: [], securityNote: "" };
  }

  if (value === undefined || value === null || value === "") {
    return { valid: false, message: "Response header value is required.", warnings: [], securityNote: "" };
  }

  // Check CRLF injection
  if (/[\r\n]/.test(name) || /[\r\n]/.test(value)) {
    return { valid: false, message: "CRLF injection detected in header name/value.", warnings: [], securityNote: "" };
  }

  // Validate header name per RFC 7230 token
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid header name: contains illegal characters.", warnings: [], securityNote: "" };
  }

  // Validate header value
  const valueRegex = /^[\t\x20-\x7E\x80-\xFF]*$/;
  if (!valueRegex.test(value)) {
    return { valid: false, message: "Invalid header value: contains illegal characters.", warnings: [], securityNote: "" };
  }

  // Security best-practice warnings
  if (name === "Content-Type" && value.includes("text/html") && !value.includes("charset")) {
    warnings.push("Content-Type for HTML responses should include charset=utf-8.");
  }

  if (name === "Set-Cookie") {
    if (!value.includes("HttpOnly")) {
      warnings.push("Set-Cookie missing HttpOnly flag.");
    }
    if (!value.includes("Secure")) {
      warnings.push("Set-Cookie missing Secure flag.");
    }
    if (!value.includes("SameSite")) {
      warnings.push("Set-Cookie missing SameSite attribute.");
    }
  }

  if (name === "Cache-Control" && value.includes("no-store")) {
    warnings.push("Good: Cache-Control no-store prevents caching of sensitive data.");
  }

  if (name === "X-Content-Type-Options" && value !== "nosniff") {
    warnings.push("X-Content-Type-Options should be set to nosniff.");
  }

  if (name === "Strict-Transport-Security" && !value.includes("max-age")) {
    warnings.push("Strict-Transport-Security should include max-age directive.");
  }

  if (name === "Content-Security-Policy") {
    if (value.includes("unsafe-inline")) {
      warnings.push("CSP contains unsafe-inline which weakens security.");
    }
    if (value.includes("unsafe-eval")) {
      warnings.push("CSP contains unsafe-eval which allows arbitrary code execution.");
    }
  }

  return {
    valid: true,
    message: "Response header is valid.",
    warnings,
    securityNote: "Response header validated. Check warnings for security recommendations."
  };
}

module.exports = validateResponseHeader;
