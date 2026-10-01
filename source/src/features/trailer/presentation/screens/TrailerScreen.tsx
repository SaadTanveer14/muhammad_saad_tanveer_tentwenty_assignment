import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';

import type { RootStackScreenProps } from '../../../../app/navigation/types';
import { useIsOnline } from '../../../../core/network';
import { colors, spacing } from '../../../../core/theme';
import { AppText, Button, IconButton } from '../../../../core/ui';

/**
 * Starts playback from inside the player page as soon as YouTube's player is
 * ready. The library's own `play` prop sends an app→page message, which
 * never takes effect:
 * - its hosted player page compares the raw message to "playVideo", but the
 *   library sends JSON (`{"eventName":"playVideo"}`) — so nothing matches on
 *   either platform;
 * - on Android, react-native-webview dispatches the message on `document`
 *   without bubbling, while the page listens on `window`.
 * `player` is the page's global YT.Player instance; `playVideo` only exists
 * once it's ready, so poll briefly and stop after the first call.
 */
const AUTOPLAY_SCRIPT = `
(function () {
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    var p = window.player;
    if (p && typeof p.playVideo === 'function') {
      p.playVideo();
      clearInterval(timer);
    } else if (tries > 80) {
      clearInterval(timer);
    }
  }, 250);
})();
true;
`;

/**
 * Full-screen trailer. Autoplays, returns to the detail screen when the
 * video ends, and can be left at any time (close button, Android back,
 * iOS swipe). Errors and offline show a message with Back, never black.
 */
export function TrailerScreen({
  navigation,
  route,
}: RootStackScreenProps<'Trailer'>) {
  const { videoKey, title } = route.params;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const onChangeState = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.ENDED) {
        navigation.goBack();
      }
    },
    [navigation],
  );

  // Fit a 16:9 player inside the screen in either orientation.
  const playerWidth = Math.min(width, (height * 16) / 9);
  const playerHeight = (playerWidth * 9) / 16;
  const showError = failed || !isOnline;

  return (
    <View style={styles.root} testID="trailer-screen">
      <StatusBar barStyle="light-content" hidden />
      {showError ? (
        <View style={styles.center}>
          <AppText variant="title" color={colors.textInverse}>
            {isOnline ? 'This trailer can’t be played' : 'You’re offline'}
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            style={styles.message}
          >
            {isOnline
              ? 'Something went wrong loading the video.'
              : 'Connect to the internet to watch the trailer.'}
          </AppText>
          <Button
            label="Back"
            onPress={navigation.goBack}
            style={styles.back}
          />
        </View>
      ) : (
        <View style={styles.center}>
          <YoutubePlayer
            width={playerWidth}
            height={playerHeight}
            videoId={videoKey}
            play
            forceAndroidAutoplay
            onReady={() => setReady(true)}
            onError={() => setFailed(true)}
            onChangeState={onChangeState}
            initialPlayerParams={{
              modestbranding: true,
              rel: false,
              // Already full screen in landscape: hide YouTube's own
              // full-screen (rotate) button.
              preventFullScreen: true,
            }}
            webViewProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
              injectedJavaScript: AUTOPLAY_SCRIPT,
            }}
          />
          {!ready ? (
            <View
              style={[StyleSheet.absoluteFill, styles.center]}
              pointerEvents="none"
            >
              <ActivityIndicator color={colors.textInverse} size="large" />
            </View>
          ) : null}
        </View>
      )}
      <IconButton
        icon="close"
        accessibilityLabel={`Close ${title} trailer`}
        color={colors.textInverse}
        onPress={navigation.goBack}
        style={[
          styles.close,
          { top: insets.top + spacing.sm, left: insets.left + spacing.sm },
        ]}
        testID="close-trailer"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gradientEnd },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: { marginTop: spacing.sm, textAlign: 'center' },
  back: { marginTop: spacing.xl, minWidth: 160 },
  close: { position: 'absolute' },
});
