/* istanbul ignore file */
if (import.meta.env.PROD) {
  const noop = () => {};
  // keep errors/warnings; silence noisy logs in prod
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}