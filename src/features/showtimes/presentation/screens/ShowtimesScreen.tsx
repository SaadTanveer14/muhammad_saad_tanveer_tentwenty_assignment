import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import type { RootStackScreenProps } from '../../../../app/navigation/types';
import { formatShortDate } from '../../../../core/format';
import { useResponsive } from '../../../../core/layout';
import { spacing } from '../../../../core/theme';
import {
  AppHeader,
  AppText,
  Button,
  Chip,
  ScreenScaffold,
  Skeleton,
  StateView,
} from '../../../../core/ui';
import { useMovieDetail } from '../../../movies/presentation/hooks';
import { releaseLine } from '../../../movies/presentation/screens/MovieDetailScreen';
import type { Showtime } from '../../domain/types';
import { ShowtimeCard, ShowtimeCardSkeleton } from '../components/ShowtimeCard';
import { useShowDates, useShowtimes } from '../hooks';

const CTA_MAX_WIDTH = 360;

export function ShowtimesScreen({
  navigation,
  route,
}: RootStackScreenProps<'Showtimes'>) {
  const { movieId } = route.params;
  const { sizeClass } = useResponsive();
  const movie = useMovieDetail(movieId).data;
  const dates = useShowDates(movieId);

  const [date, setDate] = useState<string>();
  const selectedDate = date ?? dates.data?.[0];
  const showtimes = useShowtimes(movieId, selectedDate);

  const [showtimeId, setShowtimeId] = useState<string>();
  // Default to the first screening whenever the day changes.
  useEffect(() => {
    setShowtimeId(showtimes.data?.[0]?.id);
  }, [showtimes.data]);
  const selected = showtimes.data?.find(s => s.id === showtimeId);

  const header = (
    <AppHeader
      align="center"
      title={movie?.title}
      subtitle={releaseLine(movie?.releaseDate ?? null) ?? undefined}
      onBack={navigation.goBack}
    />
  );

  const footer = (
    <View
      style={[styles.footer, sizeClass !== 'compact' && styles.footerPinned]}
    >
      <Button
        label="Select Seats"
        fullWidth
        disabled={!selected}
        onPress={() =>
          selected &&
          navigation.navigate('SeatMap', { movieId, showtimeId: selected.id })
        }
        testID="select-seats"
      />
    </View>
  );

  return (
    <ScreenScaffold header={header} footer={footer} testID="showtimes-screen">
      <StatusBar barStyle="dark-content" />
      {dates.isError ? (
        <StateView state="error" onRetry={dates.refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            sizeClass === 'compact' && styles.contentTall,
          ]}
        >
          <AppText
            variant="subtitle"
            style={styles.gutter}
            accessibilityRole="header"
          >
            Date
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dates}
            accessibilityRole="radiogroup"
          >
            {dates.data
              ? dates.data.map(d => (
                  <Chip
                    key={d}
                    variant="selectable"
                    label={formatShortDate(d)}
                    selected={d === selectedDate}
                    onPress={() => setDate(d)}
                    testID={`date-${d}`}
                  />
                ))
              : [0, 1, 2, 3].map(i => (
                  <Skeleton key={i} width={67} height={32} />
                ))}
          </ScrollView>
          <ShowtimeCarousel
            showtimes={showtimes.data}
            isError={showtimes.isError}
            onRetry={showtimes.refetch}
            selectedId={showtimeId}
            onSelect={s => setShowtimeId(s.id)}
          />
        </ScrollView>
      )}
    </ScreenScaffold>
  );
}

function ShowtimeCarousel({
  showtimes,
  isError,
  onRetry,
  selectedId,
  onSelect,
}: {
  showtimes: Showtime[] | undefined;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | undefined;
  onSelect: (showtime: Showtime) => void;
}) {
  if (isError) {
    return (
      <View style={styles.message}>
        <StateView
          state="error"
          message="Couldn’t load showtimes."
          onRetry={onRetry}
        />
      </View>
    );
  }
  if (showtimes && showtimes.length === 0) {
    return (
      <View style={styles.message}>
        <StateView state="empty" title="No showtimes on this day" />
      </View>
    );
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.showtimes}
      accessibilityRole="radiogroup"
    >
      {showtimes
        ? showtimes.map(s => (
            <ShowtimeCard
              key={s.id}
              showtime={s}
              selected={s.id === selectedId}
              onPress={onSelect}
            />
          ))
        : [0, 1].map(i => <ShowtimeCardSkeleton key={i} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  contentTall: { paddingTop: spacing.huge * 2 + spacing.xxl },
  gutter: { paddingHorizontal: spacing.xl },
  dates: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + spacing.xxs,
    paddingBottom: spacing.xl,
  },
  showtimes: {
    gap: spacing.sm + spacing.xxs,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  message: { height: 220 },
  footer: {
    paddingHorizontal: spacing.xl + spacing.sm,
    paddingVertical: spacing.md,
  },
  footerPinned: { alignSelf: 'flex-end', width: CTA_MAX_WIDTH },
});
