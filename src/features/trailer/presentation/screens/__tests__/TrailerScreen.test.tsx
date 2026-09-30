import { act, cleanup, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { TrailerScreen } from '../TrailerScreen';

function renderTrailer() {
  const goBack = jest.fn();
  const props = {
    navigation: { goBack },
    route: {
      key: 'trailer',
      name: 'Trailer',
      params: { videoKey: 'X2m-08cOAbc', title: 'Free Guy' },
    },
  } as unknown as React.ComponentProps<typeof TrailerScreen>;
  return {
    goBack,
    render: () => renderWithProviders(<TrailerScreen {...props} />),
  };
}

describe('TrailerScreen', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('starts playback itself instead of waiting for a tap', async () => {
    await renderTrailer().render();

    const player = screen.getByTestId('youtube-player');
    const script: string = player.props.webViewProps.injectedJavaScript;
    expect(player.props.videoId).toBe('X2m-08cOAbc');
    expect(script).toContain('playVideo()');
    expect(player.props.webViewProps.mediaPlaybackRequiresUserAction).toBe(
      false,
    );
  });

  it('returns to the detail screen when the trailer ends', async () => {
    const { goBack, render } = renderTrailer();
    await render();

    await act(async () => {
      screen.getByTestId('youtube-player').props.onChangeState('ended');
    });

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('shows an error with Back when the player fails, never a black screen', async () => {
    await renderTrailer().render();

    await act(async () => {
      screen.getByTestId('youtube-player').props.onError('embed error');
    });

    expect(screen.getByText('This trailer can’t be played')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  });
});
