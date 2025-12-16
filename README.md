# ActivePlay 🏃‍♂️🎮

ActivePlay is an interactive web-based fitness application that transforms physical exercise into engaging mini-games using computer vision. Built with **React**, **Vite**, and **MediaPipe**, it leverages your device's webcam to track full-body movements in real-time—no refreshing or extra hardware required!

## ✨ Features

- **📸 Real-time Motion Tracking**: Powered by MediaPipe Pose for accurate body detection.
- **🎮 Gamified Fitness**: Turn workouts into fun challenges to stay motivated.
- **📊 Instant Feedback**: Get real-time scoring and visual cues on your form.
- **🔒 Privacy-First**: All processing happens locally in your browser; no video data is sent to servers.

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

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, Lucide React
- **Computer Vision**: Google MediaPipe Pose
- **Routing**: React Router

## 🚀 Getting Started

Follow these steps to get ActivePlay running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HarshadJha/ActivePlay.git
   cd ActivePlay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Start Playing**
   Open your browser and navigate to `http://localhost:5173`. Allow camera access when prompted.

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
