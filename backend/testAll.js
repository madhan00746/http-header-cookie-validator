const http = require("http");

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let respData = "";
        res.on("data", (chunk) => (respData += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== COMPREHENSIVE PLATFORM VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`FAIL: ${name}`);
      console.error(`      -> ${e.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test("GET /api/test", async () => {
    const res = await request("GET", "/api/test");
    if (res.status !== 200 || !res.data.success) throw new Error("Health check failed");
  });

  // 2. Valid Request Header
  await test("POST /api/validation/header - Content-Type application/json", async () => {
    const res = await request("POST", "/api/validation/header", {
      name: "Content-Type",
      value: "application/json",
    });
    if (res.status !== 200 || !res.data.valid) throw new Error("Expected valid: true");
  });

  // 3. Invalid Request Header (Whitespace in name)
  await test("POST /api/validation/header - Invalid name with whitespace", async () => {
    const res = await request("POST", "/api/validation/header", {
      name: "Bad Name",
      value: "val",
    });
    if (res.status !== 200 || res.data.valid) throw new Error("Expected valid: false for whitespace in name");
  });

  // 4. CRLF Injection in Header
  await test("POST /api/validation/header - CRLF injection prevention", async () => {
    const res = await request("POST", "/api/validation/header", {
      name: "Injected\r\nHeader",
      value: "evil",
    });
    if (res.status !== 200 || res.data.valid || !res.data.message.includes("CRLF")) {
      throw new Error("Expected CRLF detection");
    }
  });

  // 5. Valid Response Header with Security Check
  await test("POST /api/validation/response - Set-Cookie missing flags", async () => {
    const res = await request("POST", "/api/validation/response", {
      name: "Set-Cookie",
      value: "session=xyz123",
    });
    if (res.status !== 200 || !res.data.valid || !res.data.warnings || res.data.warnings.length === 0) {
      throw new Error("Expected response valid with security warnings for Set-Cookie");
    }
  });

  // 6. Valid Response Header with Strict-Transport-Security
  await test("POST /api/validation/response - HSTS valid", async () => {
    const res = await request("POST", "/api/validation/response", {
      name: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
    if (res.status !== 200 || !res.data.valid) throw new Error("Expected valid HSTS");
  });

  // 7. Cookie Validator - Valid Cookie
  await test("POST /api/validation/cookie - Valid cookie with recommendations", async () => {
    const res = await request("POST", "/api/validation/cookie", {
      name: "authToken",
      value: "secureVal123",
    });
    if (res.status !== 200 || !res.data.valid || !res.data.warnings) {
      throw new Error("Expected valid cookie with recommendations");
    }
  });

  // 8. Cookie Validator - Invalid Semicolon in value
  await test("POST /api/validation/cookie - Semicolon in value rejected", async () => {
    const res = await request("POST", "/api/validation/cookie", {
      name: "cookieName",
      value: "val;illegal",
    });
    if (res.status !== 200 || res.data.valid) throw new Error("Expected invalid cookie with semicolon");
  });

  // 9. FSM Session - Valid Transition Issued -> Active
  await test("POST /api/validation/session - Issued -> Active (ACTIVATE)", async () => {
    const res = await request("POST", "/api/validation/session", {
      currentState: "Issued",
      event: "ACTIVATE",
    });
    if (res.status !== 200 || !res.data.success || res.data.state !== "Active") {
      throw new Error("Expected transition to Active");
    }
  });

  // 10. FSM Session - Valid Transition Active -> Valid_Request (Self-loop)
  await test("POST /api/validation/session - Active -> Active (VALID_REQUEST)", async () => {
    const res = await request("POST", "/api/validation/session", {
      currentState: "Active",
      event: "VALID_REQUEST",
    });
    if (res.status !== 200 || !res.data.success || res.data.state !== "Active") {
      throw new Error("Expected self-loop in Active");
    }
  });

  // 11. FSM Session - Invalid Transition Expired -> Active
  await test("POST /api/validation/session - Expired -> Active rejected (terminal state)", async () => {
    const res = await request("POST", "/api/validation/session", {
      currentState: "Expired",
      event: "ACTIVATE",
    });
    if (res.status !== 200 || res.data.success) {
      throw new Error("Expected rejection of transition from terminal state");
    }
  });

  // 12. Dashboard Stats from MongoDB
  await test("GET /api/validation/stats - Dynamic MongoDB statistics", async () => {
    const res = await request("GET", "/api/validation/stats");
    if (res.status !== 200 || typeof res.data.total !== "number" || res.data.total < 1) {
      throw new Error("Stats not returned or count is 0");
    }
    console.log(`      -> MongoDB Total Validations: ${res.data.total}`);
    console.log(`      -> Successful: ${res.data.successful}, Failed: ${res.data.failed}`);
    console.log(`      -> Active Sessions: ${res.data.activeSessions}`);
  });

  // 13. Validation History with Pagination & Filters
  await test("GET /api/validation/history - Paginated retrieval", async () => {
    const res = await request("GET", "/api/validation/history?page=1&limit=5");
    if (res.status !== 200 || !Array.isArray(res.data.history) || res.data.history.length === 0) {
      throw new Error("History endpoint failed to return records");
    }
    console.log(`      -> Retrieved page ${res.data.page} with ${res.data.history.length} records (Total: ${res.data.total})`);
  });

  // 14. History Filter by Type
  await test("GET /api/validation/history?type=Session - Filter by type", async () => {
    const res = await request("GET", "/api/validation/history?type=Session");
    if (res.status !== 200 || !Array.isArray(res.data.history)) {
      throw new Error("Type filter failed");
    }
    const allMatch = res.data.history.every((h) => h.type === "Session");
    if (!allMatch) throw new Error("Filtered items contain non-Session types");
  });

  console.log("\n=========================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================");

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
