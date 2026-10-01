import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '../core/theme';

/**
 * Native image resources (Android res/drawable-*, iOS Images.xcassets) —
 * the same artwork the launch screen uses. Unlike bundled JS assets they
 * are available on the very first frame, so the mark never blinks during
 * the hand-off from the native launch screen.
 */
const MARK = { uri: 'splash_mark' };
const WORDMARK = { uri: 'splash_wordmark' };

/** Same size as the native launch-screen mark, so the hand-off is seamless. */
const MARK_SIZE = { width: 128, height: 126 };
const WORDMARK_SIZE = { width: 183, height: 34 };
/** How far the mark rises to make room for the wordmark below it. */
const MARK_RISE = (WORDMARK_SIZE.height + spacing.xl) / 2;

/** Timeline (ms). */
const T = {
  rise: 450,
  wordmarkDelay: 300,
  wordmark: 450,
  hold: 600,
  exit: 380,
};

/** Never hold the app back on the splash if an image fails to load. */
const READY_TIMEOUT_MS = 1500;

export interface AnimatedSplashProps {
  /**
   * Called once the splash artwork has loaded and the splash is opaque on
   * screen — mount the app underneath from this point.
   */
  onReady: () => void;
  /** Called once the splash has faded out and can be unmounted. */
  onFinish: () => void;
}

/**
 * In-app splash that picks up exactly where the native launch screen
 * leaves off (same background, same centred 128-pt mark), then:
 * the mark rises with a soft pop and a warm glow, the wordmark slides in
 * beneath it, and the whole screen lifts and fades into the app.
 * Honours the system "reduce motion" setting with a plain fade.
 */
export function AnimatedSplash({ onReady, onFinish }: AnimatedSplashProps) {
  const reduceMotion = useReducedMotion();

  // Until both images have decoded, render nothing opaque: the native
  // launch screen (same background, same mark, same spot) stays visible
  // underneath, so there's no blank frame during the hand-off.
  const [ready, setReady] = useState(false);
  const loaded = useRef(0);
  const markReady = useCallback(() => setReady(true), []);
  const onImageSettled = useCallback(() => {
    loaded.current += 1;
    if (loaded.current >= 2) {
      markReady();
    }
  }, [markReady]);

  useEffect(() => {
    const timer = setTimeout(markReady, READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [markReady]);

  useEffect(() => {
    if (ready) {
      onReady();
    }
  }, [ready, onReady]);

  const markY = useSharedValue(0);
  const markScale = useSharedValue(1);
  const glow = useSharedValue(0);
  const wordmark = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const finish = (finished?: boolean) => {
      'worklet';
      if (finished) {
        runOnJS(onFinish)();
      }
    };

    if (reduceMotion) {
      wordmark.value = 1;
      exit.value = withDelay(
        T.hold,
        withTiming(1, { duration: T.exit }, finish),
      );
      return;
    }

    const ease = Easing.out(Easing.cubic);
    markY.value = withTiming(-MARK_RISE, { duration: T.rise, easing: ease });
    markScale.value = withSequence(
      withTiming(1.08, { duration: T.rise * 0.6, easing: ease }),
      withSpring(1, { damping: 9, stiffness: 140 }),
    );
    glow.value = withSequence(
      withTiming(1, { duration: T.rise }),
      withTiming(0.55, { duration: T.wordmark + T.hold }),
    );
    wordmark.value = withDelay(
      T.wordmarkDelay,
      withTiming(1, { duration: T.wordmark, easing: ease }),
    );
    exit.value = withDelay(
      T.wordmarkDelay + T.wordmark + T.hold,
      withTiming(
        1,
        { duration: T.exit, easing: Easing.in(Easing.cubic) },
        finish,
      ),
    );
  }, [ready, reduceMotion, onFinish, markY, markScale, glow, wordmark, exit]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + exit.value * 0.12 }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: markY.value }, { scale: markScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ translateY: markY.value }, { scale: 0.6 + glow.value * 0.6 }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: MARK_RISE + (1 - wordmark.value) * spacing.md }],
  }));

  return (
    <Animated.View
      style={[
        styles.root,
        ready ? styles.opaque : styles.hidden,
        containerStyle,
      ]}
      accessible
      accessibilityLabel="CineBook"
      testID="animated-splash"
    >
      <Animated.View style={[styles.center, contentStyle]}>
        <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
          <SoftGlow />
        </Animated.View>
        <Animated.View style={markStyle}>
          <Image
            source={MARK}
            style={MARK_SIZE}
            testID="splash-mark"
            fadeDuration={0}
            onLoad={onImageSettled}
            onError={onImageSettled}
          />
        </Animated.View>
        <Animated.View style={[styles.wordmark, wordmarkStyle]}>
          <Image
            source={WORDMARK}
            style={WORDMARK_SIZE}
            testID="splash-wordmark"
            fadeDuration={0}
            onLoad={onImageSettled}
            onError={onImageSettled}
          />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const GLOW_SIZE = 260;

/** Warm radial glow that fades to nothing at its edge (no hard disc). */
function SoftGlow() {
  return (
    <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
      <Defs>
        <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.splashGlow} stopOpacity={0.32} />
          <Stop
            offset="0.55"
            stopColor={colors.splashGlow}
            stopOpacity={0.12}
          />
          <Stop offset="1" stopColor={colors.splashGlow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle
        cx={GLOW_SIZE / 2}
        cy={GLOW_SIZE / 2}
        r={GLOW_SIZE / 2}
        fill="url(#splashGlow)"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 10 },
  opaque: { backgroundColor: colors.splashBackground },
  // Still rendered (so the images load) but invisible over the launch screen.
  hidden: { opacity: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: GLOW_SIZE, height: GLOW_SIZE },
  wordmark: { position: 'absolute' },
});
