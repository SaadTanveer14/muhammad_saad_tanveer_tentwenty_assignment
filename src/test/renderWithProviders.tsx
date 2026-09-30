import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import React, { type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

interface Options extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  /** Wrap in a NavigationContainer (for components using navigation hooks). */
  withNavigation?: boolean;
}

export async function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withNavigation = false,
    ...options
  }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    const content = withNavigation ? (
      <NavigationContainer>{children}</NavigationContainer>
    ) : (
      children
    );
    return (
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          {content}
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }
  const result = await render(ui, { wrapper: Wrapper, ...options });
  return { queryClient, ...result };
}
