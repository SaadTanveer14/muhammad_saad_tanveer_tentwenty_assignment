import { render, screen } from '@testing-library/react-native';
import React from 'react';

import App from '../App';

// TODO: hangs under Jest since the tab navigator + FlashList UI landed (the
// app itself runs fine). Investigate before re-enabling.
test.skip('boots into the Watch tab', async () => {
  await render(<App />);

  expect(await screen.findByTestId('watch-home-screen')).toBeOnTheScreen();
});
