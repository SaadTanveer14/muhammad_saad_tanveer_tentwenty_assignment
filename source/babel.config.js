module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod 4 uses `export * as ns` syntax.
    '@babel/plugin-transform-export-namespace-from',
    // react-native-worklets/plugin must be listed last.
    'react-native-worklets/plugin',
  ],
  env: {
    test: {
      // MSW 3 is ESM-only (uses `import.meta.url` and static class blocks);
      // Jest runs CommonJS.
      plugins: [
        'babel-plugin-transform-import-meta',
        '@babel/plugin-transform-class-static-block',
      ],
    },
  },
};
