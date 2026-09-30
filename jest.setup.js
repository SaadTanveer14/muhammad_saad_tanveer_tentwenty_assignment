/* eslint-env jest */
require('react-native-gesture-handler/jestSetup');

require('react-native-reanimated').setUpTests();

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    TMDB_READ_TOKEN: 'test-token',
    TMDB_API_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  },
}));

// react-native-mmkv swaps in an in-memory store under Jest, but still imports
// Nitro at module load; stub the native bridge so that import succeeds.
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn() },
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// Gesture Handler 3 asks Worklets for the UI runtime on startup; the JS (web)
// Worklets implementation used under Jest throws for that call.
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => ({}),
}));

// The YouTube player is a WebView. Tests get a stand-in that exposes the
// player callbacks so lifecycle behaviour ("ended" → back) can be driven.
jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const { View } = require('react-native');
  const PLAYER_STATES = {
    ENDED: 'ended',
    PAUSED: 'paused',
    PLAYING: 'playing',
    UNSTARTED: 'unstarted',
    BUFFERING: 'buffering',
    VIDEO_CUED: 'video cued',
  };
  function YoutubePlayer(props) {
    return React.createElement(View, {
      testID: 'youtube-player',
      videoId: props.videoId,
      onChangeState: props.onChangeState,
      onError: props.onError,
      onReady: props.onReady,
    });
  }
  return { __esModule: true, default: YoutubePlayer, PLAYER_STATES };
});

jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  function FastImage(props) {
    return React.createElement(View, {
      testID: props.testID,
      style: props.style,
    });
  }
  FastImage.resizeMode = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.preload = () => {};
  return { __esModule: true, default: FastImage };
});
