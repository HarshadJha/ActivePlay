# ActivePlay 🏃‍♂️🎮

ActivePlay is an interactive web-based fitness application that transforms physical exercise into engaging mini-games using computer vision. Built with **React**, **Vite**, and **MediaPipe**, it leverages your device's webcam to track full-body movements in real-time—no refreshing or extra hardware required!

## ✨ Features

- **📸 Real-time Motion Tracking**: Powered by MediaPipe Pose for accurate body detection.
- **🎮 Gamified Fitness**: Turn workouts into fun challenges to stay motivated.
- **📊 Instant Feedback**: Get real-time scoring and visual cues on your form.
- **🔒 Privacy-First**: All processing happens locally in your browser; no video data is sent to servers.
- **👤 User Authentication**: Secure login and registration with JWT tokens.
- **📈 Progress Tracking**: Save and track your game scores and achievements.

## 🕹️ Available Games

| Game | Description | Focus Area |
| :--- | :--- | :--- |
| **Air Drawing** | Unleash your creativity by drawing in the air with your hands. | Coordination |
| **Happy Steps** | March in place to maintain a rhythm and keep your energy up! | Cardio, Legs |
| **Overhead Reach Bubbles** | Reach high to pop bubbles floating above you. | Shoulders, Stretching |
| **Pose Match** | Mimic the on-screen poses as quickly and accurately as possible. | Flexibility, Coordination |
| **Reach Hold** | Hold specific poses to test your balance and endurance. | Core, Stability |
| **Reaction Time Challenge** | Hit targets as they appear to test your reflexes. | Reflexes, Agility |
| **Side Lean Balance** | Lean side-to-side to control elements, heavily engaging your core. | Core, Obliques |
| **Squats** | Perform squats with real-time counting and form analysis. | Legs, Glutes |
| **Step In Box** | Step accurately into virtual targets projected on the floor. | Agility, Footwork |
| **Virtual Drums** | Rock out on a virtual drum kit for a rhythm-based cardio workout. | Cardio, Coordination |

## 🛠️ Tech Stack

**Frontend:**
- React 19, Vite
- Tailwind CSS, Lucide React
- Google MediaPipe Pose
- React Router
- Axios

**Backend:**
- Node.js, Express
- PostgreSQL with Prisma ORM
- JWT Authentication
- bcryptjs, Helmet, CORS

## 🚀 Getting Started

Follow these steps to get ActivePlay running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database (local or cloud-based like [Neon](https://neon.tech/))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/HarshadJha/ActivePlay.git
cd ActivePlay
```

#### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL (default is http://localhost:5000)
# VITE_API_URL=http://localhost:5000
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

#### 4. Configure Backend Environment

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/activeplay?schema=public"

# JWT Authentication - Generate secure random strings for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (must match your frontend port)
FRONTEND_URL=http://localhost:5173
```

**Database Options:**

- **Local PostgreSQL**: Install PostgreSQL locally and use connection string like:
  ```
  postgresql://postgres:password@localhost:5432/activeplay
  ```

- **Cloud Database (Recommended for easy setup)**: Use [Neon](https://neon.tech/) (free tier):
  1. Sign up at https://neon.tech/
  2. Create a new project named "activeplay"
  3. Copy the connection string
  4. Paste it as `DATABASE_URL` in `backend/.env`

#### 5. Initialize Database

```bash
# From the backend directory
cd backend

# Push database schema (creates tables)
npm run prisma:push

# Generate Prisma Client (automatically done by push, but can run separately)
npm run prisma:generate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

Expected output:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your Prisma schema
```

#### 6. Start the Application

Open **two terminal windows**:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📍 Environment: development
🔗 Frontend URL: http://localhost:5173
✅ Database connected successfully
```

**Terminal 2 - Frontend Development Server:**
```bash
# From project root
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 7. Start Playing! 🎉

1. Open your browser and navigate to `http://localhost:5173`
2. **Register** a new account or **Login** if you already have one
3. Allow camera access when prompted
4. Choose a game and start exercising!

## 📁 Project Structure

```
ActivePlay/
├── backend/                  # Backend server
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── prisma/              # Database schema
│   ├── routes/              # API routes
│   ├── .env.example         # Environment template
│   └── server.js            # Server entry point
├── src/                     # Frontend source
│   ├── components/          # React components
│   ├── context/             # React context providers
│   ├── games/               # Game implementations
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── services/            # API services
│   └── utils/               # Utility functions
├── .env.example             # Frontend environment template
└── README.md
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Create and run migrations

## 🐛 Troubleshooting

### Frontend Issues

**Issue**: "Camera not detected"
- **Solution**: Ensure you've allowed camera permissions in your browser
- **Solution**: Check if another application is using the camera

**Issue**: "Cannot connect to server"
- **Solution**: Verify backend is running on `http://localhost:5000`
- **Solution**: Check `VITE_API_URL` in `.env` matches your backend URL

### Backend Issues

**Issue**: "Can't reach database server"
- **Solution**: Verify `DATABASE_URL` in `backend/.env` is correct
- **Solution**: Ensure PostgreSQL server is running
- **Solution**: Check firewall/network settings

**Issue**: "The table `public.User` does not exist"
- **Solution**: Run `npm run prisma:push` from the backend directory

**Issue**: "Environment variable not found: DATABASE_URL"
- **Solution**: Create `backend/.env` file from `backend/.env.example`

**Issue**: "Authentication failed"
- **Solution**: Check username/password in `DATABASE_URL` are correct

**Issue**: "CORS error" in browser console
- **Solution**: Verify `FRONTEND_URL` in `backend/.env` matches your frontend port
- **Solution**: Default is `http://localhost:5173`, change if using different port

## 📚 Additional Documentation

- [Backend Database Setup Guide](backend/DATABASE_SETUP.md) - Detailed database configuration
- [Backend Quick Start](backend/QUICKSTART.md) - Quick backend setup reference
- [Security Policy](SECURITY.md) - Security guidelines and best practices

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) for pose detection technology
- [Prisma](https://www.prisma.io/) for database ORM
- [Neon](https://neon.tech/) for serverless PostgreSQL

---

**Made with ❤️ for fitness enthusiasts everywhere!**
