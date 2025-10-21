export const config = {
  port: process.env.PORT || 3000,
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    tmdb: process.env.TMDB_API_KEY || ''
  },
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173']
}

export default config;