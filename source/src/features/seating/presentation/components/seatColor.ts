import { colors } from '../../../../core/theme';
import type { Seat } from '../../domain/types';

export function seatColor(seat: Seat, selected: boolean): string {
  if (selected) {
    return colors.seat.selected;
  }
  if (seat.status === 'taken') {
    return colors.seat.taken;
  }
  return seat.type === 'vip' ? colors.seat.vip : colors.seat.available;
}

export function seatAccessibilityLabel(seat: Seat, selected: boolean): string {
  const state = selected
    ? 'selected'
    : seat.status === 'taken'
    ? 'not available'
    : 'available';
  const type = seat.type === 'vip' ? 'VIP, ' : '';
  return `Row ${seat.row}, seat ${seat.number}, ${type}${state}`;
}
