const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for .db files
config.resolver.assetExts.push("db");

// Ensure assets are properly handled
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
