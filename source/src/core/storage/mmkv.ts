import { createMMKV } from 'react-native-mmkv';

/** Synchronous key-value store; also backs the query cache persister. */
export const storage = createMMKV({ id: 'cinebook' });
