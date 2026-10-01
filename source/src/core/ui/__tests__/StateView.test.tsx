import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../test/renderWithProviders';
import { StateView } from '../StateView';

describe('StateView', () => {
  it('lets the user retry from the error state', async () => {
    const onRetry = jest.fn();
    await renderWithProviders(<StateView state="error" onRetry={onRetry} />);

    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('explains the offline state instead of spinning forever', async () => {
    await renderWithProviders(
      <StateView state="offline" onRetry={jest.fn()} />,
    );

    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    expect(screen.queryByTestId('state-loading')).toBeNull();
  });
});
