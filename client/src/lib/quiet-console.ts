if (import.meta.env.PROD) {
  const noop = () => {};
  console.debug = noop; 
  console.log = noop; 
  console.info = noop;
}