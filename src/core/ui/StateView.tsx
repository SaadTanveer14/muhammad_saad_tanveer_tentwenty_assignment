import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

export type StateViewProps =
  | { state: 'loading'; message?: string }
  | { state: 'empty'; title: string; message?: string }
  | { state: 'error'; title?: string; message?: string; onRetry?: () => void }
  | { state: 'offline'; message?: string; onRetry?: () => void };

/**
 * One component for every non-content state, so each screen designs
 * loading / empty / error / offline the same way.
 */
export function StateView(props: StateViewProps) {
  return (
    <View style={styles.root} testID={`state-${props.state}`}>
      {renderContent(props)}
    </View>
  );
}

function renderContent(props: StateViewProps) {
  switch (props.state) {
    case 'loading':
      return (
        <>
          <ActivityIndicator color={colors.primary} size="large" />
          {props.message ? <Message text={props.message} /> : null}
        </>
      );
    case 'empty':
      return (
        <>
          <AppText variant="title" style={styles.center}>
            {props.title}
          </AppText>
          {props.message ? <Message text={props.message} /> : null}
        </>
      );
    case 'error':
      return (
        <>
          <AppText variant="title" style={styles.center}>
            {props.title ?? 'Something went wrong'}
          </AppText>
          <Message text={props.message ?? 'Please try again.'} />
          {props.onRetry ? (
            <Button
              label="Retry"
              onPress={props.onRetry}
              style={styles.action}
            />
          ) : null}
        </>
      );
    case 'offline':
      return (
        <>
          <AppText variant="title" style={styles.center}>
            You're offline
          </AppText>
          <Message
            text={
              props.message ??
              'Connect to the internet to load this content for the first time.'
            }
          />
          {props.onRetry ? (
            <Button
              label="Retry"
              onPress={props.onRetry}
              style={styles.action}
            />
          ) : null}
        </>
      );
  }
}

function Message({ text }: { text: string }) {
  return (
    <AppText
      color={colors.textSecondary}
      style={[styles.center, styles.message]}
    >
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  center: { textAlign: 'center' },
  message: { marginTop: spacing.sm },
  action: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
