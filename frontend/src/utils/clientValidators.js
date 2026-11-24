/**
 * Client-Side Standalone Validation Engines
 * Provides full interactivity on static deployments (e.g., GitHub Pages)
 * when a local Express server is not reachable.
 */

export function validateHeaderClient(name, value) {
  const warnings = [];
  if (!name || !value) {
    return { valid: false, message: "Header name and value are required.", warnings: [] };
  }
  if (/[\r\n]/.test(name) || /[\r\n]/.test(value)) {
    return { valid: false, message: "CRLF injection detected in header name/value.", warnings: [] };
  }
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid header name: contains illegal characters.", warnings: [] };
  }
  const valueRegex = /^[\t\x20-\x7E\x80-\xFF]*$/;
  if (!valueRegex.test(value)) {
    return { valid: false, message: "Invalid header value: contains illegal characters.", warnings: [] };
  }
  if (name === "Authorization" && !value.startsWith("Bearer ") && !value.startsWith("Basic ")) {
    warnings.push("Authorization header should use Bearer or Basic scheme.");
  }
  if (name === "Content-Type" && value.trim() === "") {
    warnings.push("Content-Type value should not be empty.");
  }
  if (name === "X-Forwarded-For") {
    warnings.push("X-Forwarded-For can be spoofed; use with caution.");
  }
  return { valid: true, message: "Header is valid.", warnings };
}

export function validateResponseHeaderClient(name, value) {
  const warnings = [];
  if (!name || value === undefined || value === null || (name === "" && value === "")) {
    return { valid: false, message: "Response header name and value are required.", warnings: [], securityNote: "" };
  }
  if (/[\r\n]/.test(name) || /[\r\n]/.test(value)) {
    return { valid: false, message: "CRLF injection detected in header name/value.", warnings: [], securityNote: "" };
  }
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid header name: contains illegal characters.", warnings: [], securityNote: "" };
  }
  const valueRegex = /^[\t\x20-\x7E\x80-\xFF]*$/;
  if (!valueRegex.test(value)) {
    return { valid: false, message: "Invalid header value: contains illegal characters.", warnings: [], securityNote: "" };
  }
  if (name === "Content-Type" && value.includes("text/html") && !value.includes("charset")) {
    warnings.push("Content-Type for HTML responses should include charset=utf-8.");
  }
  if (name === "Set-Cookie") {
    if (!value.includes("HttpOnly")) warnings.push("Set-Cookie missing HttpOnly flag.");
    if (!value.includes("Secure")) warnings.push("Set-Cookie missing Secure flag.");
    if (!value.includes("SameSite")) warnings.push("Set-Cookie missing SameSite attribute.");
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
    if (value.includes("unsafe-inline")) warnings.push("CSP contains unsafe-inline which weakens security.");
    if (value.includes("unsafe-eval")) warnings.push("CSP contains unsafe-eval which allows arbitrary code execution.");
  }
  return {
    valid: true,
    message: "Response header is valid.",
    warnings,
    securityNote: "Response header validated. Check warnings for security recommendations."
  };
}

export function validateCookieClient(name, value) {
  const warnings = [];
  if (!name || !value) {
    return { valid: false, message: "Cookie name and value are required.", warnings: [] };
  }
  const nameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Invalid cookie name: contains illegal characters.", warnings: [] };
  }
  if (/[\s;,]/.test(value)) {
    return { valid: false, message: "Invalid cookie value: contains forbidden characters (whitespace, semicolons, commas).", warnings: [] };
  }
  warnings.push("Consider adding HttpOnly flag to prevent XSS attacks.");
  warnings.push("Consider adding Secure flag to ensure cookie is sent over HTTPS only.");
  warnings.push("Consider adding SameSite=Strict or SameSite=Lax to prevent CSRF attacks.");
  if (name.startsWith("__Host-")) warnings.push("Good: __Host- prefix enforces Secure and path=/ requirements.");
  if (name.startsWith("__Secure-")) warnings.push("Good: __Secure- prefix enforces Secure flag.");
  return { valid: true, message: "Cookie is valid.", warnings };
}

const transitions = {
  Issued: { ACTIVATE: "Active", REVOKE: "Revoked" },
  Active: { VALID_REQUEST: "Active", EXPIRE: "Expired", REVOKE: "Revoked" },
  Expired: {},
  Revoked: {}
};

export function updateSessionStateClient(currentState, event) {
  const nextState = transitions[currentState]?.[event];
  if (!nextState) {
    const available = Object.keys(transitions[currentState] || {});
    return {
      success: false,
      fromState: currentState,
      toState: null,
      message: `Invalid transition: Cannot apply "${event}" to state "${currentState}". ${available.length > 0 ? "Available events: " + available.join(", ") + "." : "No transitions available from this state (terminal state)."}`
    };
  }
  return {
    success: true,
    fromState: currentState,
    toState: nextState,
    state: nextState,
    message: `Transition successful: ${currentState} -> ${nextState} (via ${event})`
  };
}

export function getDefaultStatsClient() {
  return {
    total: 63,
    successful: 39,
    failed: 24,
    invalidHeaders: 8,
    invalidResponseHeaders: 4,
    invalidCookies: 5,
    activeSessions: 7,
    expiredSessions: 4,
    revokedSessions: 3,
    recent: [
      { _id: "1", type: "HTTP Header", input: { name: "Content-Type", value: "application/json" }, valid: true, message: "Header is valid.", createdAt: new Date().toISOString() },
      { _id: "2", type: "HTTP Header", input: { name: "Bad\r\nHeader", value: "evil" }, valid: false, message: "CRLF injection detected in header name/value.", createdAt: new Date().toISOString() },
      { _id: "3", type: "Response Header", input: { name: "X-Content-Type-Options", value: "nosniff" }, valid: true, message: "Response header is valid.", createdAt: new Date().toISOString() },
      { _id: "4", type: "Cookie", input: { name: "sessionId", value: "abc123xyz" }, valid: true, message: "Cookie is valid.", createdAt: new Date().toISOString() },
      { _id: "5", type: "Session", input: { name: "Issued", value: "ACTIVATE" }, valid: true, message: "Transition successful: Issued -> Active (via ACTIVATE)", createdAt: new Date().toISOString() }
    ]
  };
}
