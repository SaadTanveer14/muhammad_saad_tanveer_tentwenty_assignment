/**
 * Where an image comes from: a remote URL (TMDb) or a bundled asset
 * (`require(...)`, used by mock data). Plain TS so domain models can use it.
 */
export type ImageSource = { uri: string } | number;
