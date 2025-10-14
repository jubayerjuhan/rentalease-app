module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@services': './services',
            '@theme': './theme',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.png'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
