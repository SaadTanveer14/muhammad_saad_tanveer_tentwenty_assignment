import { act, cleanup, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../test/renderWithProviders';
import { AnimatedSplash } from '../AnimatedSplash';

describe('AnimatedSplash', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(async () => {
    await cleanup();
    jest.useRealTimers();
  });

  it('only takes over from the launch screen once its artwork has loaded', async () => {
    const onReady = jest.fn();
    await renderWithProviders(
      <AnimatedSplash onReady={onReady} onFinish={jest.fn()} />,
    );

    await fireEvent(screen.getByTestId('splash-mark'), 'load');
    expect(onReady).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('splash-wordmark'), 'load');
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('never blocks the app if the artwork fails to load', async () => {
    const onReady = jest.fn();
    await renderWithProviders(
      <AnimatedSplash onReady={onReady} onFinish={jest.fn()} />,
    );

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('uses the native launch-screen artwork so the hand-off is instant', async () => {
    await renderWithProviders(
      <AnimatedSplash onReady={jest.fn()} onFinish={jest.fn()} />,
    );

    const uri = (testID: string) =>
      (screen.getByTestId(testID).props.source as { uri: string }).uri;
    expect(uri('splash-mark')).toBe('splash_mark');
    expect(uri('splash-wordmark')).toBe('splash_wordmark');
  });
});
