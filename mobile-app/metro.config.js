const { getDefaultConfig } = require('metro-config')

module.exports = (async () => {
  const {
    resolver: { sourceExts },
  } = await getDefaultConfig()
  return {
    transformer: {
      experimentalImportSupport: false,
      inlineRequires: true,
      babelTransformerPath: require.resolve('react-native-typescript-transformer'),
    },
    resolver: {
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs'],
    },
  }
})()
