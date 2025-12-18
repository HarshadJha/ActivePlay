# Backend Database Setup - Quick Fix

## Issue
Registration is failing because the database hasn't been properly initialized with Prisma.

## Solution Steps

### Step 1: Verify .env Configuration

Create or check `backend/.env` file with valid DATABASE_URL:

```env
# Example for Neon PostgreSQL (free tier)
DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/activeplay?sslmode=require"

# Or local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/activeplay"

# Other required variables
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
```

### Step 2: Get a Free Database (if you don't have one)

**Using Neon (Recommended - Free)**:
1. Go to https://neon.tech/
2. Sign up with GitHub
3. Create a new project named "activeplay"
4. Copy the connection string
5. Paste it into `backend/.env` as `DATABASE_URL`

### Step 3: Initialize Database

Run these commands in the `backend` directory:

```bash
# Navigate to backend
cd backend

# Push schema to database (creates tables)
npm run prisma:push

# (Optional) Generate Prisma Client
npm run prisma:generate

# (Optional) View database in browser
npm run prisma:studio
```

### Step 4: Restart Backend Server

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it
npm run dev
```

### Expected Output

After `npm run prisma:push`, you should see:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
✔ Your database is now in sync with your Prisma schema
```

After `npm run dev`, you should see:
```
🚀 Server running on port 5000
📍 Environment: development
🔗 Frontend URL: http://localhost:5174
✅ Database connected successfully
```

## Testing

Once backend is running, test the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

Expected response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

## Common Issues

### Error: "Can't reach database server"
- **Solution**: Check your DATABASE_URL is correct
- **Solution**: Ensure database server is running
- **Solution**: Check firewall/network settings

### Error: "The table `public.User` does not exist"
- **Solution**: Run `npm run prisma:push` to create tables

### Error: "Environment variable not found: DATABASE_URL"
- **Solution**: Create `backend/.env` file with DATABASE_URL

### Error: "Authentication failed for user"
- **Solution**: Check username/password in DATABASE_URL are correct

## Next Steps

After database is set up:
1. Test registration in browser at http://localhost:5174/register
2. Check browser DevTools → Network tab for API responses
3. Check backend terminal for any error logs
