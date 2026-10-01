import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SearchResultsParams } from '../../features/search/presentation/hooks/useSearchResults';

export type WatchStackParamList = {
  WatchHome: undefined;
  Search: undefined;
  SearchResults: SearchResultsParams;
};

export type TabParamList = {
  Dashboard: undefined;
  Watch: NavigatorScreenParams<WatchStackParamList>;
  MediaLibrary: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  MovieDetail: { movieId: number };
  Showtimes: { movieId: number };
  SeatMap: { movieId: number; showtimeId: string };
  Trailer: { videoKey: string; title: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type WatchStackScreenProps<T extends keyof WatchStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WatchStackParamList, T>,
    TabScreenProps<'Watch'>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
