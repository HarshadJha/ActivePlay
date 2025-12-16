# Quick Start Guide - Backend Setup

## Prerequisites
- Node.js installed ✅
- PostgreSQL database (cloud or local)

## Step 1: Get a Database

**Easiest: Use Neon (Free PostgreSQL)**

1. Visit: https://neon.tech/
2. Click "Sign Up" → Sign in with GitHub
3. Click "Create a project"
4. Choose a name (e.g., "activeplay")
5. Select region closest to you
6. Click "Create project"
7. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/activeplay`)

## Step 2: Configure Backend

1. Open `backend/.env`
2. Replace the `DATABASE_URL` value with your Neon connection string
3. Save the file

## Step 3: Initialize Database

Open terminal in the backend folder:

```bash
cd backend

# Create database tables
npm run prisma:push

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

## Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📍 Environment: development
🔗 Frontend URL: http://localhost:5173
✅ Database connected successfully
```

## Step 5: Test the API

**Option A: Using curl (in new terminal)**
```bash
# Health check
curl http://localhost:5000/health

# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

**Option B: Using browser**
- Visit: http://localhost:5000/health
- Should see: `{"status":"OK","timestamp":"..."}`

## Next: Frontend Integration

Once the backend is running, proceed to Phase 3 to connect your React frontend!

---

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- Database URL is incorrect
- Check your `.env` file
- Make sure DATABASE_URL is correct

**Error: "Invalid `prisma.xxx()` invocation"**
- Run `npm run prisma:push` first
- This creates the database tables

**Port 5000 already in use**
- Change PORT in `.env` file
- Or stop other process using port 5000
