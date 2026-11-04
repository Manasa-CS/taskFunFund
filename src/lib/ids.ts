/** Generates a random id for a new record. */
export function makeId(): string {
  return crypto.randomUUID()
}
