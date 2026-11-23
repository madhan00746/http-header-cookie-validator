# HTTP Header & Cookie Validation Platform

> **HeaderGuard** — A full-stack cybersecurity web application for validating HTTP headers, cookies, and managing session lifecycles using Finite State Machines.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Sample Inputs & Outputs](#sample-inputs--outputs)
- [FSM Documentation](#fsm-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)

---

## Overview

HeaderGuard is a college project demonstrating applied knowledge of:
- **Regular Expressions** for validating HTTP protocol structures
- **Finite State Machines (FSM)** for session lifecycle management
- **Full-Stack Web Development** with React, Node.js, Express, and MongoDB

The platform validates:
1. HTTP **Request Headers** (RFC 7230 compliant)
2. HTTP **Response Headers** with security analysis
3. **Cookies** (name/value syntax + security recommendations)
4. **Session State** transitions via a formal FSM

All validations are persisted in MongoDB Atlas for history tracking and statistics.

---

## Features

| Feature | Description |
|---------|-------------|
| ✅ Request Header Validator | RFC 7230 token validation, CRLF injection detection |
| ✅ Response Header Validator | Security header analysis (HSTS, CSP, X-Content-Type-Options, etc.) |
| ✅ Cookie Validator | Cookie name/value syntax + security attribute recommendations |
| ✅ FSM Session Manager | 4-state machine with 5 transitions, prevents invalid transitions |
| ✅ Validation History | Searchable, filterable, paginated history from MongoDB |
| ✅ Dashboard Stats | Real-time statistics from MongoDB (no hardcoded values) |
| ✅ FSM Diagram | Visual state diagram + formal transition table |
| ✅ Security Warnings | CRLF injection, missing HttpOnly/Secure/SameSite, unsafe CSP |
| ✅ Dark Theme UI | Professional cybersecurity-themed responsive design |
| ✅ REST API | 9 endpoints with proper HTTP status codes and error handling |

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| JavaScript (ES2024) | — | Logic & interactivity |
| CSS3 | — | Styling & animations |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 5.x | Web framework |
| Mongoose | 9.x | MongoDB ODM |
| dotenv | 18.x | Environment variables |
| cors | 2.x | Cross-origin resource sharing |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose Schema | Validation record model |

### Validation
| Technique | Application |
|-----------|------------|
| Regular Expressions | Header name/value syntax, cookie name/value syntax |
| Finite State Machine | Session lifecycle management (4 states, 5 transitions) |

---

## Project Structure

```
http-header-cookie-validator/
├── backend/
│   ├── models/
│   │   └── Validation.js          # Mongoose schema
│   ├── routes/
│   │   └── validationRoutes.js    # All API routes
│   ├── validators/
│   │   ├── headerValidator.js     # Request header validation
│   │   ├── responseHeaderValidator.js  # Response header validation
│   │   ├── cookieValidator.js     # Cookie validation
│   │   └── sessionManager.js     # FSM session transitions
│   ├── .env                       # Environment variables (not in git)
│   ├── .env.example               # Template for .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HeaderValidator.jsx
│   │   │   ├── ResponseHeaderValidator.jsx
│   │   │   ├── CookieValidator.jsx
│   │   │   ├── SessionManager.jsx
│   │   │   ├── ValidationHistory.jsx
│   │   │   ├── FSMDiagram.jsx
│   │   │   └── AboutProject.jsx
│   │   ├── App.jsx                # Root component + routing
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # Base reset
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── automata/
│   ├── fsm.js                     # FSM implementation (SessionFSM class)
│   └── README.md                  # Automata theory documentation
│
├── sample-data/
│   ├── header-samples.json        # Test cases for request headers
│   ├── response-header-samples.json  # Test cases for response headers
│   ├── cookie-samples.json        # Test cases for cookies
│   └── session-samples.json       # Test cases for FSM sessions
│
└── README.md                      # This file
```

---

## Installation

### Prerequisites

- Node.js 18+ (tested with Node.js 20)
- MongoDB Atlas account (free tier works)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/http-header-cookie-validator.git
cd http-header-cookie-validator

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Create `backend/.env` using `backend/.env.example` as a template:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## Running the Project

### Start Backend

```bash
cd backend
node server.js
```

Expected output:
```
✅ MongoDB Connected Successfully!
🚀 Server running on http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE  Local: http://localhost:5173/
```

Open your browser at **http://localhost:5173**

---

## API Documentation

Base URL: `http://localhost:5000`

### GET `/api/test`
Health check.
```json
{ "success": true, "message": "Backend connected successfully!", "timestamp": "..." }
```

### POST `/api/validation/header`
Validate an HTTP request header.

**Request:**
```json
{ "name": "Content-Type", "value": "application/json" }
```

**Response:**
```json
{
  "type": "HTTP Header",
  "input": { "name": "Content-Type", "value": "application/json" },
  "valid": true,
  "message": "Header is valid.",
  "warnings": [],
  "id": "...",
  "createdAt": "2026-11-23T10:00:00.000Z"
}
```

### POST `/api/validation/response`
Validate an HTTP response header.

**Request:**
```json
{ "name": "Set-Cookie", "value": "session=abc123" }
```

**Response:**
```json
{
  "type": "Response Header",
  "valid": true,
  "message": "Response header is valid.",
  "warnings": [
    "Set-Cookie missing HttpOnly flag.",
    "Set-Cookie missing Secure flag.",
    "Set-Cookie missing SameSite attribute."
  ],
  "securityNote": "Response header validated. Check warnings for security recommendations."
}
```

### POST `/api/validation/cookie`
Validate a cookie name and value.

**Request:**
```json
{ "name": "sessionId", "value": "abc123xyz" }
```

### POST `/api/validation/session`
Apply an FSM event to a session state.

**Request:**
```json
{ "currentState": "Issued", "event": "ACTIVATE" }
```

**Response:**
```json
{
  "type": "Session",
  "success": true,
  "fromState": "Issued",
  "toState": "Active",
  "state": "Active",
  "message": "Transition successful: Issued → Active (via ACTIVATE)"
}
```

### GET `/api/validation/history`
Get validation history with optional filters.

**Query parameters:**
| Param | Values | Description |
|-------|--------|-------------|
| type | `HTTP Header`, `Response Header`, `Cookie`, `Session` | Filter by type |
| result | `valid`, `invalid` | Filter by result |
| search | string | Search in name, value, message |
| sort | `oldest`, `newest` (default) | Sort order |
| page | number (default 1) | Page number |
| limit | number (default 20) | Per page |

**Response:**
```json
{
  "history": [...],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

### GET `/api/validation/stats`
Get dashboard statistics.

**Response:**
```json
{
  "total": 42,
  "successful": 35,
  "failed": 7,
  "invalidHeaders": 3,
  "invalidResponseHeaders": 2,
  "invalidCookies": 2,
  "activeSessions": 5,
  "expiredSessions": 3,
  "revokedSessions": 2,
  "recent": [...]
}
```

### DELETE `/api/validation/history`
Clear all validation history.

**Response:**
```json
{ "success": true, "message": "Deleted 42 validation records." }
```

---

## Sample Inputs & Outputs

See the `sample-data/` folder for comprehensive test cases:

- [`header-samples.json`](sample-data/header-samples.json) — 11 request header test cases
- [`response-header-samples.json`](sample-data/response-header-samples.json) — 8 response header test cases
- [`cookie-samples.json`](sample-data/cookie-samples.json) — 8 cookie test cases
- [`session-samples.json`](sample-data/session-samples.json) — 9 FSM session test cases

---

## FSM Documentation

See [`automata/README.md`](automata/README.md) for full FSM theory and documentation.

### Quick Reference

**States:** Issued → Active → Expired | Revoked

**Transition Table:**

| From    | Event         | To      |
|---------|---------------|---------|
| Issued  | ACTIVATE      | Active  |
| Issued  | REVOKE        | Revoked |
| Active  | VALID_REQUEST | Active  |
| Active  | EXPIRE        | Expired |
| Active  | REVOKE        | Revoked |
| Expired | (any)         | ❌ Terminal |
| Revoked | (any)         | ❌ Terminal |

---

## Testing

### Manual Testing (using curl or Postman)

```bash
# Test backend connection
curl http://localhost:5000/api/test

# Valid header
curl -X POST http://localhost:5000/api/validation/header \
  -H "Content-Type: application/json" \
  -d '{"name":"Content-Type","value":"application/json"}'

# CRLF injection (should fail)
curl -X POST http://localhost:5000/api/validation/header \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bad\\r\\nHeader\",\"value\":\"test\"}"

# Valid FSM transition
curl -X POST http://localhost:5000/api/validation/session \
  -H "Content-Type: application/json" \
  -d '{"currentState":"Issued","event":"ACTIVATE"}'

# Invalid FSM transition (terminal state)
curl -X POST http://localhost:5000/api/validation/session \
  -H "Content-Type: application/json" \
  -d '{"currentState":"Expired","event":"ACTIVATE"}'

# Get stats
curl http://localhost:5000/api/validation/stats

# Get history with filter
curl "http://localhost:5000/api/validation/history?type=Session&result=invalid"
```

### Test Checklist

- [ ] Valid HTTP request header accepted
- [ ] Invalid HTTP request header rejected
- [ ] CRLF injection detected
- [ ] Security warnings shown for Authorization header
- [ ] Valid response header accepted
- [ ] Set-Cookie warnings for missing HttpOnly/Secure/SameSite
- [ ] CSP unsafe-inline warning triggered
- [ ] Valid cookie accepted
- [ ] Cookie with semicolons rejected
- [ ] Valid FSM transition: Issued → Active
- [ ] Invalid FSM transition from terminal state rejected
- [ ] Dashboard stats loading from MongoDB
- [ ] History showing real data
- [ ] Search in history working
- [ ] Pagination working
- [ ] Delete history working
- [ ] All 9 API endpoints responding correctly

---

## Screenshots

> _Add screenshots here after running the application._

| Page | Description |
|------|-------------|
| Dashboard | Stats cards and recent activity |
| Request Header Validator | Form with examples and results |
| Response Header Validator | Security warning analysis |
| Cookie Validator | Cookie syntax check with recommendations |
| Session Manager | FSM state transitions |
| Validation History | Searchable/filterable history table |
| FSM Diagram | Visual state machine diagram |

---

## Author

**College Project** — HTTP Header and Cookie Validation Platform  
Technology: Automata Theory (FSM) + Regular Expressions + Full-Stack Web Development

---

## License

This project is for educational purposes.
