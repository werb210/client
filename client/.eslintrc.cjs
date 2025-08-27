module.exports = {
  rules: {
    'no-console': process.env.NODE_ENV === 'production'
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off'
  }
};