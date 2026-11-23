/**
 * Session Manager — Finite State Machine
 * Manages session state transitions
 */

const transitions = {
  Issued:  { ACTIVATE: "Active", REVOKE: "Revoked" },
  Active:  { VALID_REQUEST: "Active", EXPIRE: "Expired", REVOKE: "Revoked" },
  Expired: {},
  Revoked: {}
};

function updateSessionState(currentState, event) {
  const validStates = Object.keys(transitions);

  if (!validStates.includes(currentState)) {
    return {
      success: false,
      fromState: currentState,
      toState: null,
      message: `Unknown state: "${currentState}". Valid states: ${validStates.join(", ")}.`
    };
  }

  if (!event) {
    return {
      success: false,
      fromState: currentState,
      toState: null,
      message: "Event is required."
    };
  }

  const nextState = transitions[currentState][event];

  if (!nextState) {
    const available = Object.keys(transitions[currentState]);
    return {
      success: false,
      fromState: currentState,
      toState: null,
      message: `Invalid transition: Cannot apply "${event}" to state "${currentState}". ${
        available.length > 0
          ? "Available events: " + available.join(", ") + "."
          : "No transitions available from this state (terminal state)."
      }`
    };
  }

  return {
    success: true,
    fromState: currentState,
    toState: nextState,
    state: nextState,
    message: `Transition successful: ${currentState} → ${nextState} (via ${event})`
  };
}

module.exports = updateSessionState;
