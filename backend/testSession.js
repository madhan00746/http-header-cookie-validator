const updateSessionState = require("./validators/sessionManager");

console.log("Test 1:", updateSessionState("Issued", "ACTIVATE"));
console.log("Test 2:", updateSessionState("Active", "EXPIRE"));
console.log("Test 3:", updateSessionState("Expired", "ACTIVATE"));
