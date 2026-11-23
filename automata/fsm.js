/**
 * Finite State Machine (FSM) - Session Lifecycle Manager
 *
 * Theory:
 * A Finite State Machine is a mathematical model of computation consisting of:
 *   - Q: A finite set of states
 *   - Σ: A finite set of input symbols (events/alphabet)
 *   - δ: A transition function δ: Q × Σ → Q
 *   - q0: An initial state
 *   - F: A set of accepting (terminal) states
 *
 * For Session Management:
 *   Q  = { Issued, Active, Expired, Revoked }
 *   Σ  = { ACTIVATE, REVOKE, VALID_REQUEST, EXPIRE }
 *   q0 = Issued
 *   F  = { Expired, Revoked }
 *
 * Transition Function δ:
 *   δ(Issued,  ACTIVATE)      = Active
 *   δ(Issued,  REVOKE)        = Revoked
 *   δ(Active,  VALID_REQUEST) = Active    (self-loop)
 *   δ(Active,  EXPIRE)        = Expired
 *   δ(Active,  REVOKE)        = Revoked
 *   δ(Expired, *)             = undefined (terminal)
 *   δ(Revoked, *)             = undefined (terminal)
 */

"use strict";

// --- State & Event Definitions ---

const STATES = Object.freeze({
  ISSUED:  "Issued",
  ACTIVE:  "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
});

const EVENTS = Object.freeze({
  ACTIVATE:      "ACTIVATE",
  REVOKE:        "REVOKE",
  VALID_REQUEST: "VALID_REQUEST",
  EXPIRE:        "EXPIRE",
});

// State metadata
const STATE_META = {
  [STATES.ISSUED]: {
    description: "Session token has been generated and issued. Awaiting activation.",
    isTerminal: false,
    color: "#3b9eff",
  },
  [STATES.ACTIVE]: {
    description: "Session is active and processing requests.",
    isTerminal: false,
    color: "#22c97d",
  },
  [STATES.EXPIRED]: {
    description: "Session has timed out. No further transitions are possible.",
    isTerminal: true,
    color: "#f5a623",
  },
  [STATES.REVOKED]: {
    description: "Session has been manually revoked. No further transitions are possible.",
    isTerminal: true,
    color: "#ff4c6a",
  },
};

// --- Transition Table (δ) ---

const TRANSITION_TABLE = {
  [STATES.ISSUED]: {
    [EVENTS.ACTIVATE]: STATES.ACTIVE,
    [EVENTS.REVOKE]:   STATES.REVOKED,
  },
  [STATES.ACTIVE]: {
    [EVENTS.VALID_REQUEST]: STATES.ACTIVE,  // self-loop
    [EVENTS.EXPIRE]:        STATES.EXPIRED,
    [EVENTS.REVOKE]:        STATES.REVOKED,
  },
  [STATES.EXPIRED]: {},  // terminal
  [STATES.REVOKED]: {},  // terminal
};

// --- FSM Class ---

class SessionFSM {
  constructor(initialState = STATES.ISSUED) {
    if (!TRANSITION_TABLE[initialState]) {
      throw new Error(`Invalid initial state: "${initialState}"`);
    }
    this.state = initialState;
    this.history = [];
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Apply an event to the FSM.
   * @param {string} event - The event to process.
   * @returns {{ success: boolean, fromState: string, toState: string|null, message: string }}
   */
  transition(event) {
    const fromState = this.state;
    const meta = STATE_META[fromState];

    if (meta.isTerminal) {
      return {
        success:   false,
        fromState,
        toState:   null,
        message:   `Cannot transition from terminal state "${fromState}". Session lifecycle is complete.`,
      };
    }

    const nextState = TRANSITION_TABLE[fromState][event];

    if (!nextState) {
      const available = Object.keys(TRANSITION_TABLE[fromState]);
      return {
        success:   false,
        fromState,
        toState:   null,
        message:   `Invalid transition: Event "${event}" is not valid in state "${fromState}". ` +
                   (available.length > 0
                     ? `Valid events: ${available.join(", ")}.`
                     : "No events available."),
      };
    }

    this.state = nextState;
    const record = {
      timestamp: new Date().toISOString(),
      fromState,
      event,
      toState: nextState,
    };
    this.history.push(record);

    return {
      success:   true,
      fromState,
      toState:   nextState,
      state:     nextState,
      message:   `Transition successful: ${fromState} → ${nextState} (via ${event})`,
      record,
    };
  }

  /** @returns {string} Current state */
  getState() { return this.state; }

  /** @returns {boolean} Whether current state is terminal */
  isTerminal() { return STATE_META[this.state].isTerminal; }

  /** @returns {string[]} Events valid from current state */
  getAvailableEvents() { return Object.keys(TRANSITION_TABLE[this.state]); }

  /** @returns {Object[]} Full transition history */
  getHistory() { return this.history; }
}

// --- Pure Transition Function (stateless, used by API) ---

/**
 * Stateless transition function — does not maintain state internally.
 * @param {string} currentState
 * @param {string} event
 * @returns {{ success: boolean, fromState: string, toState: string|null, message: string }}
 */
function applyTransition(currentState, event) {
  const validStates = Object.keys(TRANSITION_TABLE);

  if (!currentState) {
    return { success: false, fromState: null, toState: null, message: "Current state is required." };
  }
  if (!event) {
    return { success: false, fromState: currentState, toState: null, message: "Event is required." };
  }
  if (!validStates.includes(currentState)) {
    return {
      success:   false,
      fromState: currentState,
      toState:   null,
      message:   `Unknown state: "${currentState}". Valid states: ${validStates.join(", ")}.`,
    };
  }

  const meta = STATE_META[currentState];
  if (meta.isTerminal) {
    return {
      success:   false,
      fromState: currentState,
      toState:   null,
      message:   `Cannot transition from terminal state "${currentState}". No events are accepted.`,
    };
  }

  const nextState = TRANSITION_TABLE[currentState][event];
  if (!nextState) {
    const available = Object.keys(TRANSITION_TABLE[currentState]);
    return {
      success:   false,
      fromState: currentState,
      toState:   null,
      message:   `Invalid event "${event}" for state "${currentState}". ` +
                 `Valid events: ${available.join(", ")}.`,
    };
  }

  return {
    success:   true,
    fromState: currentState,
    toState:   nextState,
    state:     nextState,
    message:   `Transition successful: ${currentState} → ${nextState} (via ${event})`,
  };
}

// --- Exports ---

module.exports = {
  STATES,
  EVENTS,
  STATE_META,
  TRANSITION_TABLE,
  SessionFSM,
  applyTransition,
};
