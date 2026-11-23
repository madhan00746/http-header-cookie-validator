/**
 * Cookie Validator
 * Validates cookie name and value, provides security recommendations
 */

function validateCookie(name, value) {
  const warnings = [];

  // Check for empty name/value
  if (!name || value === undefined || value === null || value === "") {
    return { valid: false, message: "Cookie name and value are required.", warnings: [] };
  }

  if (!name) {
    return { valid: false, message: "Cookie name is required.", warnings: [] };
  }

  // Validate cookie name per RFC 6265 token
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid cookie name: contains illegal characters.", warnings: [] };
  }

  // Validate cookie value: reject whitespace, semicolons, commas
  if (/[\s;,]/.test(value)) {
    return { valid: false, message: "Invalid cookie value: contains forbidden characters (whitespace, semicolons, commas).", warnings: [] };
  }

  // Security warnings — always present since we only validate name+value, not attributes
  warnings.push("Consider adding HttpOnly flag to prevent XSS attacks.");
  warnings.push("Consider adding Secure flag to ensure cookie is sent over HTTPS only.");
  warnings.push("Consider adding SameSite=Strict or SameSite=Lax to prevent CSRF attacks.");

  // Prefix checks
  if (name.startsWith("__Host-")) {
    warnings.push("Good: __Host- prefix enforces Secure and path=/ requirements.");
  }

  if (name.startsWith("__Secure-")) {
    warnings.push("Good: __Secure- prefix enforces Secure flag.");
  }

  return {
    valid: true,
    message: "Cookie is valid.",
    warnings
  };
}

module.exports = validateCookie;
