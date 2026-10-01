import React, { useCallback, useMemo, useReducer } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../../../../app/navigation/types';
import { formatLongDate } from '../../../../core/format';
import { useResponsive } from '../../../../core/layout';
import { colors, spacing } from '../../../../core/theme';
import {
  AppHeader,
  AppText,
  ScreenScaffold,
  Skeleton,
  StateView,
} from '../../../../core/ui';
import { useMovieDetail } from '../../../movies/presentation/hooks';
import { useShowtime } from '../../../showtimes/presentation/hooks';
import {
  initialSeatSelection,
  seatSelectionReducer,
  totalPrice,
} from '../../domain/seatSelection';
import { MAX_SELECTION, type Seat, type SeatPrices } from '../../domain/types';
import { PriceSummaryBar } from '../components/PriceSummaryBar';
import { SeatLegend } from '../components/SeatLegend';
import { SeatMap } from '../components/SeatMap';
import { SelectedSeatPill } from '../components/SelectedSeatPill';
import { useSeatLayout } from '../hooks/useSeatLayout';

const PANEL_WIDTH = 320;

export function SeatMapScreen({
  navigation,
  route,
}: RootStackScreenProps<'SeatMap'>) {
  const { movieId, showtimeId } = route.params;
  const { sizeClass } = useResponsive();
  const movie = useMovieDetail(movieId).data;
  const showtime = useShowtime(showtimeId);
  const layout = useSeatLayout(showtime.data?.layoutId);
  const [selection, dispatch] = useReducer(
    (
      state: typeof initialSeatSelection,
      action: Parameters<typeof seatSelectionReducer>[1],
    ) => seatSelectionReducer(state, action),
    initialSeatSelection,
  );

  const selectedIds = useMemo(
    () => new Set(selection.selected.map(s => s.id)),
    [selection.selected],
  );
  const onSeatPress = useCallback(
    (seat: Seat) => dispatch({ type: 'toggle', seat }),
    [],
  );

  const s = showtime.data;
  const subtitle = s
    ? `${formatLongDate(s.date)}  |  ${s.startTime} ${s.hall}`
    : undefined;
  const header = (
    <AppHeader
      align="center"
      title={movie?.title}
      subtitle={subtitle}
      onBack={navigation.goBack}
    />
  );

  const isError = showtime.isError || layout.isError;
  const retry = () =>
    showtime.isError ? showtime.refetch() : layout.refetch();
  const wide = sizeClass !== 'compact';

  const map = isError ? (
    <StateView
      state="error"
      message="Couldn’t load the seat map."
      onRetry={retry}
    />
  ) : layout.data ? (
    <SeatMap
      layout={layout.data}
      selectedIds={selectedIds}
      onSeatPress={onSeatPress}
    />
  ) : (
    <View style={styles.mapLoading} testID="seat-map-loading">
      <Skeleton height={220} />
    </View>
  );

  const panel = s ? (
    <SelectionPanel
      prices={s.prices}
      selected={selection.selected}
      rejection={selection.rejection}
      onRemove={seatId => dispatch({ type: 'remove', seatId })}
      onProceed={() =>
        Alert.alert(
          'Proceed to pay',
          `${selection.selected.length} seat(s), $${totalPrice(
            selection.selected,
            s.prices,
          )}. Payment isn’t part of this demo.`,
        )
      }
      wide={wide}
    />
  ) : null;

  return (
    <ScreenScaffold header={header} testID="seat-map-screen">
      <StatusBar barStyle="dark-content" />
      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={styles.mapArea}>{map}</View>
        {panel}
      </View>
    </ScreenScaffold>
  );
}

function SelectionPanel({
  prices,
  selected,
  rejection,
  onRemove,
  onProceed,
  wide,
}: {
  prices: SeatPrices;
  selected: Seat[];
  rejection: 'taken' | 'limit' | null;
  onRemove: (seatId: string) => void;
  onProceed: () => void;
  wide: boolean;
}) {
  const insets = useSafeAreaInsets();
  const hint =
    rejection === 'limit'
      ? `You can select up to ${MAX_SELECTION} seats.`
      : rejection === 'taken'
      ? 'That seat is already taken.'
      : null;

  const content = (
    <>
      <SeatLegend prices={prices} />
      {selected.length > 0 ? (
        <View style={styles.pills}>
          {selected.map(seat => (
            <SelectedSeatPill
              key={seat.id}
              seat={seat}
              onRemove={() => onRemove(seat.id)}
            />
          ))}
        </View>
      ) : (
        <AppText variant="caption" color={colors.textSecondary}>
          Tap a seat to select it.
        </AppText>
      )}
      {hint ? (
        <AppText
          variant="caption"
          color={colors.danger}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {hint}
        </AppText>
      ) : null}
    </>
  );

  const summary = (
    <PriceSummaryBar
      total={totalPrice(selected, prices)}
      onProceed={onProceed}
      disabled={selected.length === 0}
    />
  );

  return (
    <View
      style={[
        styles.panel,
        wide ? styles.panelWide : null,
        { paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      {wide ? (
        <ScrollView contentContainerStyle={styles.panelContent}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.panelContent}>{content}</View>
      )}
      {summary}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  bodyWide: { flexDirection: 'row' },
  mapArea: { flex: 1, paddingTop: spacing.lg },
  mapLoading: { padding: spacing.xl },
  panel: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + spacing.xs,
    gap: spacing.xl,
  },
  panelWide: { width: PANEL_WIDTH, justifyContent: 'space-between' },
  panelContent: { gap: spacing.xl },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
