declare module 'react-native-config' {
  export interface NativeConfig {
    TMDB_READ_TOKEN?: string;
    TMDB_API_BASE_URL?: string;
    TMDB_IMAGE_BASE_URL?: string;
    USE_MOCK_DATA?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
