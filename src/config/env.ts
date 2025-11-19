interface config {
  port: number | string;
  apiKeys: {
    openai: string;
    tmdb: string;
  };
  corsOrigins: string[];
}

export const config: config = {
  port: process.env.PORT || 3000,
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    tmdb: process.env.TMDB_API_KEY || ''
  },
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) 
    : ['http://localhost:5173']
}