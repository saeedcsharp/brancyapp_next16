let counter = 0;
const BASE = Date.now().toString(36);

export function generateId(prefix = "b"): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${BASE}_${counter.toString(36)}`;
}
