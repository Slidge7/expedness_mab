module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-redux|@reduxjs/toolkit|immer|react-native|@react-native|@react-navigation|i18next|react-i18next)/)',
  ],
};
