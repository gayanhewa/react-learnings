// Artificial delay so loading states are actually visible in dev.
// Remove these calls (or the import) once you're done learning the patterns.
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
