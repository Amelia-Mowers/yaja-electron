// This is a custom transformer to ignore all stylesheets
module.exports = {
    process() {
      return 'module.exports = {};';
    },
    getCacheKey() {
      // The output is always the same.
      return 'cssTransform';
    },
  };
  