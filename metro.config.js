const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { assetExts }
  } = await getDefaultConfig();
  return {
    transformer: {
      // Your transformer configuration
    },
    resolver: {
      assetExts: [...assetExts, 'db'], // Include 'db' as an asset extension
      // Do not add 'db' to sourceExts
    },
  };
})();