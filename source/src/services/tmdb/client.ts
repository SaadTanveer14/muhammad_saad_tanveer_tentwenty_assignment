import { createHttpClient } from '../../core/api';
import { tmdbConfig } from './config';
import { errorSchema } from './schemas';

/** The configured client every TMDb request goes through. */
export const tmdbClient = createHttpClient({
  baseUrl: tmdbConfig.apiBaseUrl,
  headers: () => ({ Authorization: `Bearer ${tmdbConfig.accessToken}` }),
  parseServerError: body => {
    const parsed = errorSchema.safeParse(body);
    if (!parsed.success) {
      return null;
    }
    const isError =
      parsed.data.success === false || parsed.data.status_code !== undefined;
    return isError
      ? { message: parsed.data.status_message, code: parsed.data.status_code }
      : null;
  },
});
