# ActivePlay Backend

Backend API server for ActivePlay - A fitness gamification application.

## Tech Stack

- **Node.js** with Express.js
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **bcryptjs** for password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `FRONTEND_URL` - Your frontend URL (default: http://localhost:5173)

### 3. Set Up Database

**Option A: Use a cloud PostgreSQL database (Recommended for production)**

Get a free PostgreSQL database from:
- [Neon](https://neon.tech/) (Recommended)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

**Option B: Use local PostgreSQL**

Install PostgreSQL locally and create a database:
```bash
createdb activeplay
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all database tables
- Generate Prisma Client

### 5. (Optional) View Database with Prisma Studio

```bash
npm run prisma:studio
```

Opens a GUI at http://localhost:5555 to view/edit your database.

### 6. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `DELETE /api/users/account` - Delete account (protected)

### Game Sessions
- `POST /api/games/sessions` - Save game session (protected)
- `GET /api/games/sessions` - Get user's sessions (protected)
- `GET /api/games/statistics` - Get user statistics (protected)
- `GET /api/games/leaderboard?gameType={gameType}` - Get leaderboard (protected)

### Health Check
- `GET /health` - Server health check

## Database Schema

### Models
- **User** - User authentication data
- **UserProfile** - User preferences and onboarding data
- **GameSession** - Individual game play sessions
- **UserStats** - Aggregated user statistics
- **Achievement** - User achievements

## Production Deployment

### Deploy to Railway

1. Create a Railway account
2. Create a new project
3. Add PostgreSQL database
4. Connect your GitHub repository
5. Add environment variables
6. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Secure random string
- `JWT_REFRESH_SECRET` - Another secure random string
- `FRONTEND_URL` - Production frontend URL
- `NODE_ENV=production`

## Development Notes

- Server uses `--watch` flag for auto-restart on file changes
- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- Rate limiting: 100 requests per 15 minutes per IP
- CORS enabled for frontend URL only
