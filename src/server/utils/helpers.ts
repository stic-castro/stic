export function generateId(): string {
  // Simple ID generator for the mock system
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
