# Automata — Finite State Machine for Session Management

## Formal Definition

A Finite State Machine (FSM) is defined as a 5-tuple:

**M = (Q, Σ, δ, q₀, F)**

| Symbol | Meaning                   | Value                                |
|--------|---------------------------|--------------------------------------|
| Q      | Finite set of states      | { Issued, Active, Expired, Revoked } |
| Σ      | Finite input alphabet     | { ACTIVATE, REVOKE, VALID_REQUEST, EXPIRE } |
| δ      | Transition function       | See transition table below           |
| q₀     | Initial state             | Issued                               |
| F      | Set of accepting states   | { Expired, Revoked }                 |

## Transition Table (δ: Q × Σ → Q)

| Current State | Event         | Next State | Notes            |
|---------------|---------------|------------|------------------|
| Issued        | ACTIVATE      | Active     | Session activated |
| Issued        | REVOKE        | Revoked    | Session cancelled |
| Active        | VALID_REQUEST | Active     | Self-loop, session continues |
| Active        | EXPIRE        | Expired    | Timeout          |
| Active        | REVOKE        | Revoked    | Manual revocation |
| Expired       | (any)         | —          | Terminal state   |
| Revoked       | (any)         | —          | Terminal state   |

## State Diagram

```
                    ACTIVATE
  ┌───────────┐ ──────────────────▶ ┌───────────┐
  │  ISSUED   │                     │  ACTIVE   │◀─┐
  │ (Initial) │                     │ (Running) │  │ VALID_REQUEST
  └───────────┘                     └───────────┘──┘
        │                            │        │
        │ REVOKE                     │ EXPIRE │ REVOKE
        │                            ▼        │
        │                     ┌───────────┐   │
        │                     │  EXPIRED  │   │
        │                     │(Terminal) │   │
        │                     └───────────┘   │
        │                                     ▼
        │                     ┌───────────────────┐
        └───────────────────▶ │     REVOKED       │
                 REVOKE        │   (Terminal)      │
                               └───────────────────┘
```

## Files

| File       | Description                                      |
|------------|--------------------------------------------------|
| `fsm.js`   | FSM implementation: SessionFSM class + stateless |
|            | `applyTransition()` function                     |

## Usage

```javascript
const { SessionFSM, applyTransition, STATES, EVENTS } = require("./fsm");

// Stateful usage (class-based)
const session = new SessionFSM();
console.log(session.getState()); // "Issued"

session.transition(EVENTS.ACTIVATE);
console.log(session.getState()); // "Active"

session.transition(EVENTS.EXPIRE);
console.log(session.getState()); // "Expired"

// Stateless usage (for API)
const result = applyTransition("Issued", "ACTIVATE");
// { success: true, fromState: "Issued", toState: "Active", ... }
```

## Why FSM for Sessions?

Sessions naturally follow a lifecycle:
1. A session is **issued** (created)
2. It is **activated** when first used
3. It stays **active** as long as valid requests come in
4. It eventually **expires** (timeout) or is **revoked** (logout/admin action)

The FSM enforces these rules precisely — it is impossible to go from Expired back to Active, or to activate an already-revoked session.

## Complexity Analysis

- **States**: 4 → O(1) lookup
- **Transitions**: 5 → O(1) lookup (hash map)
- **Transition evaluation**: O(1)
- **Space**: O(|Q| × |Σ|) = O(4 × 4) = O(16) constant
