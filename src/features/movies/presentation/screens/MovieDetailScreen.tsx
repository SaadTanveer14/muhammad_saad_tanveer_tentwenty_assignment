import React from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../../../../app/navigation/types';
import { formatLongDate, toIsoDate } from '../../../../core/format';
import { useResponsive } from '../../../../core/layout';
import { colors, spacing } from '../../../../core/theme';
import {
  AppHeader,
  AppImage,
  AppText,
  Button,
  Chip,
  Divider,
  GradientOverlay,
  Skeleton,
  StateView,
} from '../../../../core/ui';
import type { MovieDetail } from '../../domain/types';
import { genreColor } from '../genreColor';
import { useMovieDetail, useMovieTrailer } from '../hooks';

const HERO_MAX_HEIGHT = 466;
const CTA_WIDTH = 243;
/** Reading text never gets wider than this. */
const MAX_TEXT_WIDTH = 720;

export function releaseLine(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }
  const prefix =
    releaseDate > toIsoDate(new Date()) ? 'In Theaters' : 'Released';
  return `${prefix} ${formatLongDate(releaseDate)}`;
}

export function MovieDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'MovieDetail'>) {
  const { movieId } = route.params;
  const { sizeClass, width, height } = useResponsive();
  const insets = useSafeAreaInsets();
  const detail = useMovieDetail(movieId);
  const trailer = useMovieTrailer(movieId);
  const movie = detail.data;

  const header = (
    <AppHeader
      transparent={Boolean(movie)}
      title="Watch"
      onBack={navigation.goBack}
    />
  );

  if (!movie) {
    return (
      <View style={styles.root} testID="movie-detail-screen">
        {header}
        {detail.isError ? (
          <StateView state="error" onRetry={detail.refetch} />
        ) : (
          <DetailSkeleton />
        )}
      </View>
    );
  }

  const hero = (
    <Hero
      movie={movie}
      trailerAvailable={Boolean(trailer.data)}
      trailerLoading={trailer.isPending}
      onGetTickets={() => navigation.navigate('Showtimes', { movieId })}
      onWatchTrailer={() =>
        trailer.data &&
        navigation.navigate('Trailer', {
          videoKey: trailer.data.key,
          title: movie.title,
        })
      }
    />
  );
  const info = <Info movie={movie} loadingGenres={detail.isPlaceholderData} />;

  return (
    <View style={styles.root} testID="movie-detail-screen">
      <StatusBar barStyle="light-content" />
      {header}
      {sizeClass === 'compact' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
          <View style={{ height: Math.min(HERO_MAX_HEIGHT, width * 1.24) }}>
            {hero}
          </View>
          {info}
        </ScrollView>
      ) : (
        <View style={styles.panes}>
          <View style={[styles.heroPane, { minHeight: height }]}>{hero}</View>
          <ScrollView
            style={styles.infoPane}
            contentContainerStyle={{
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.xl,
              paddingRight: insets.right,
            }}
          >
            {info}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Hero({
  movie,
  trailerAvailable,
  trailerLoading,
  onGetTickets,
  onWatchTrailer,
}: {
  movie: MovieDetail;
  trailerAvailable: boolean;
  trailerLoading: boolean;
  onGetTickets: () => void;
  onWatchTrailer: () => void;
}) {
  const release = releaseLine(movie.releaseDate);
  return (
    <View style={styles.hero}>
      <AppImage
        source={movie.backdrop ?? movie.poster}
        style={StyleSheet.absoluteFill}
      />
      <GradientOverlay
        stops={[
          { offset: 0, opacity: 0.45 },
          { offset: 0.25, opacity: 0 },
          { offset: 0.45, opacity: 0 },
          { offset: 1, opacity: 0.85 },
        ]}
      />
      <View style={styles.heroContent}>
        {movie.logo ? (
          <AppImage
            source={movie.logo}
            resizeMode="contain"
            style={styles.logo}
          />
        ) : (
          <AppText
            variant="display"
            color={colors.textInverse}
            style={styles.center}
            accessibilityRole="header"
          >
            {movie.title}
          </AppText>
        )}
        {release ? (
          <AppText
            variant="subtitle"
            color={colors.textInverse}
            style={styles.center}
          >
            {release}
          </AppText>
        ) : null}
        <View style={styles.ctas}>
          <Button
            label="Get Tickets"
            onPress={onGetTickets}
            testID="get-tickets"
          />
          {trailerAvailable || trailerLoading ? (
            <Button
              label="Watch Trailer"
              variant="outline"
              leadingIcon="play"
              labelColor={colors.textInverse}
              loading={trailerLoading}
              onPress={onWatchTrailer}
              testID="watch-trailer"
            />
          ) : (
            <AppText
              variant="caption"
              color={colors.textInverse}
              style={styles.center}
              testID="no-trailer"
            >
              No trailer available
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}

function Info({
  movie,
  loadingGenres,
}: {
  movie: MovieDetail;
  loadingGenres: boolean;
}) {
  return (
    <View style={styles.info}>
      <AppText variant="subtitle" accessibilityRole="header">
        Genres
      </AppText>
      <View style={styles.chips}>
        {loadingGenres
          ? [72, 64, 80].map(w => <Skeleton key={w} width={w} height={24} />)
          : movie.genres.map((genre, i) => (
              <Chip
                key={genre.id}
                variant="genre"
                label={genre.name}
                color={genreColor(i)}
              />
            ))}
      </View>
      <Divider style={styles.divider} />
      <AppText variant="subtitle" accessibilityRole="header">
        Overview
      </AppText>
      <AppText
        variant="paragraph"
        color={colors.textMuted}
        style={styles.overview}
      >
        {movie.overview || 'No overview available yet.'}
      </AppText>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View testID="movie-detail-loading">
      <Skeleton height={HERO_MAX_HEIGHT} radius={0} />
      <View style={[styles.info, styles.skeletonInfo]}>
        <Skeleton width={90} height={18} />
        <Skeleton width="60%" height={24} />
        <Skeleton width="100%" height={60} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  panes: { flex: 1, flexDirection: 'row' },
  heroPane: { width: '45%' },
  infoPane: { flex: 1 },
  hero: { flex: 1, justifyContent: 'flex-end' },
  heroContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xs,
  },
  logo: { width: 200, height: 60, backgroundColor: 'transparent' },
  center: { textAlign: 'center' },
  ctas: {
    width: CTA_WIDTH,
    maxWidth: '100%',
    gap: spacing.sm + spacing.xxs,
    marginTop: spacing.xs,
  },
  info: {
    width: '100%',
    maxWidth: MAX_TEXT_WIDTH + spacing.huge * 2,
    paddingHorizontal: spacing.huge,
    paddingTop: spacing.xxl + spacing.xxs,
    paddingBottom: spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 1,
    marginTop: spacing.md + spacing.xxs,
  },
  divider: { marginVertical: spacing.xl + spacing.xxs },
  overview: { marginTop: spacing.md + spacing.xxs },
  skeletonInfo: { gap: spacing.md },
});
