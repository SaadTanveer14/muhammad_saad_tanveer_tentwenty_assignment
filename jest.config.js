const rnPreset = require('@react-native/jest-preset');

module.exports = {
  preset: '@react-native/jest-preset',
  // Reanimated 4 / Worklets resolve their web (JS) implementations under Jest.
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./src/test/setupAfterEnv.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transform: {
    ...rnPreset.transform,
    // MSW and its dependencies ship ESM-only .mjs files.
    '^.+\\.(js|mjs|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@shopify/flash-list|@d11/react-native-fast-image|react-native-.*|@tanstack|zod|msw|@msw|@mswjs|@open-draft|until-async|rettime|cookie|headers-polyfill|set-cookie-parser|tough-cookie|outvariant|is-node-process|strict-event-emitter)/)',
  ],
};
