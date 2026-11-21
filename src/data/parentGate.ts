/**
 * Short-lived pass from the parental gate to the parent area.
 * Kept in memory only (never persisted) and cleared when the parent area closes, so a deep link
 * (kidsbrain://settings), a restored navigation state or a later visit can never skip the gate.
 * Reading it does not clear it: the navigator may mount the screen more than once on entry.
 */
let passIssuedAt = 0;
const PASS_TTL_MS = 30_000;

export function issueParentPass() {
  passIssuedAt = Date.now();
}

export function hasParentPass(): boolean {
  return passIssuedAt > 0 && Date.now() - passIssuedAt < PASS_TTL_MS;
}

export function clearParentPass() {
  passIssuedAt = 0;
}
