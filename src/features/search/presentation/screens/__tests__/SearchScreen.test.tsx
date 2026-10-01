import { cleanup, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { SearchScreen } from '../SearchScreen';

function renderSearch() {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  const props = {
    navigation,
    route: { key: 'search', name: 'Search' },
  } as unknown as React.ComponentProps<typeof SearchScreen>;
  return {
    navigation,
    render: () => renderWithProviders(<SearchScreen {...props} />),
  };
}

describe('SearchScreen', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('has no Cancel button before a search starts', async () => {
    await renderSearch().render();

    expect(screen.queryByTestId('cancel-search')).toBeNull();
  });

  it('lets the user end a search and return to the Watch list', async () => {
    const { navigation, render } = renderSearch();
    await render();

    await fireEvent.changeText(screen.getByTestId('search-input'), 'batman');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Cancel search' }),
    );

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('search-input').props.value).toBe('');
  });

  it('shows Cancel as soon as the field is focused, even before typing', async () => {
    await renderSearch().render();

    await fireEvent(screen.getByTestId('search-input'), 'focus');

    expect(screen.getByTestId('cancel-search')).toBeOnTheScreen();
  });
});
