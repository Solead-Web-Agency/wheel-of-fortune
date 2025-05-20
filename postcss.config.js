const prefixSelector = require("postcss-prefix-selector");

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-prefix-selector": {
      prefix: ".wheel-of-fortune",
      transform: (prefix, selector, prefixedSelector) => {
        // Avoid prefixing root-level tags
        if (selector.startsWith("html") || selector.startsWith("body"))
          return selector;
        return prefixedSelector;
      },
    },
  },
};
