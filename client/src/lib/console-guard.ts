// Silences noisy consoles only in production; keeps warn/error for observability.
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}