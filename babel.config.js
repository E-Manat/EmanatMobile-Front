module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.svg'],
        alias: {
          '@assets': './assets',
          '@components': './components',
          '@screens': './screens',
          '@navigation': './navigation',
          '@services': './services',
          '@utils': './utils',
          '@types': './types',
          '@configs': './configs',
        },
      },
    ],
    'module:react-native-dotenv',
  ],
};
