import cors from 'cors';

export const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://worldmonitor.app'] : true,
  credentials: true,
});
