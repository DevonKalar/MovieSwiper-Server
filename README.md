# MovieSwiper Server

A TypeScript/Node.js backend API for a movie recommendation application that combines user authentication, OpenAI integration, and TMDB (The Movie Database) services.

## 🎯 Features

- **User Authentication**: JWT-based auth with secure httpOnly cookies
- **OpenAI Integration**: AI-powered movie recommendations using the latest Responses API
- **TMDB Integration**: Access to comprehensive movie database
- **Database Management**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS protection, input validation
- **Type Safety**: Full TypeScript implementation with Zod validation

## 🏗️ Architecture

```
src/
├── config/          # Environment configuration
├── lib/             # Database and utility libraries
├── middleware/      # Authentication, validation, rate limiting
├── routes/          # API endpoints (auth, openai, tmdb)
├── services/        # External service integrations
└── types/           # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- TMDB API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movieswiper-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/movieswiper_app
   
   # API Keys
   OPENAI_API_KEY=your_openai_api_key
   TMDB_BEARER_TOKEN=your_tmdb_bearer_token
   
   # Security
   JWT_SECRET=your_jwt_secret_key
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:5173
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new user account |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Sign out user |

**Example Registration:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

### OpenAI (`/api/openai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/response` | Generate AI response |
| GET | `/response/:id` | Retrieve specific response |

**Example AI Request:**
```json
POST /api/openai/response
{
  "input": "Recommend a sci-fi movie similar to Blade Runner",
  "instructions": "Focus on atmospheric cyberpunk themes",
  "previous_response_id": "resp_123" // Optional for conversation
}
```

### TMDB (`/api/tmdb`)

Movie database integration endpoints for fetching movie data, search, and metadata.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Prevents XSS attacks
- **Rate Limiting**: Protects against abuse
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Controlled cross-origin requests
- **Password Hashing**: bcrypt with salt rounds

## 🛠️ Technology Stack

### Core
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Build Tool**: tsup

### Database
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migration**: Prisma Migrate

### External APIs
- **AI**: OpenAI (Responses API)
- **Movies**: The Movie Database (TMDB)

### Security & Validation
- **Authentication**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit

## 🔧 Development

### Available Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build for production
npm start             # Start production server
npm run postinstall   # Generate Prisma client
```

### Database Operations

```bash
# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View data
npx prisma studio

# Generate client
npx prisma generate
```

### Project Structure Details

- **`/config`**: Environment configuration and app settings
- **`/lib`**: Database connection and shared utilities
- **`/middleware`**: Express middleware for auth, validation, rate limiting
- **`/routes`**: API route handlers organized by feature
- **`/services`**: External service integrations (OpenAI, TMDB)
- **`/types`**: TypeScript type definitions and Express extensions

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API authentication | ✅ |
| `TMDB_BEARER_TOKEN` | TMDB API bearer token | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment mode | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | ❌ |

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure secure database connection
4. Set appropriate `CORS_ORIGINS`
5. Enable SSL/HTTPS in production

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ **Commercial use** - Use in commercial applications
- ✅ **Modification** - Modify and create derivative works  
- ✅ **Distribution** - Distribute copies of the software
- ✅ **Private use** - Use privately without restrictions
- ⚠️ **Attribution required** - Include original license and copyright notice