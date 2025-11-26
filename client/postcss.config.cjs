/** PostCSS config for Tailwind v4 + HSL vars (CommonJS) */
module.exports = {
  plugins: {
    'postcss-import': {},
    // Use the bundled PostCSS nested plugin to avoid optional dependencies
    'postcss-nested': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
