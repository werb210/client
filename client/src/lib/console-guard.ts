if (import.meta.env.PROD) {
  const noop = () => {};
  try {
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    // keep warn/error for observability
  } catch {}
}