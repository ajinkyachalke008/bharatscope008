import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  ws: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '1000', 10),
  },

  refresh: {
    feed: parseInt(process.env.FEED_REFRESH_INTERVAL || '30000', 10),
    event: parseInt(process.env.EVENT_REFRESH_INTERVAL || '15000', 10),
    geo: parseInt(process.env.GEO_REFRESH_INTERVAL || '60000', 10),
  },

  apis: {
    gdelt: process.env.GDELT_API_URL || '',
    usgsEarthquake: process.env.USGS_EARTHQUAKE_API || '',
    eonetNasa: process.env.EONET_NASA_API || '',
    newsApiKey: process.env.NEWSAPI_KEY || '',
    openWeatherKey: process.env.OPENWEATHER_API_KEY || '',
  },

  get useMockData(): boolean {
    return process.env.USE_MOCK_DATA === 'true';
  },
};
