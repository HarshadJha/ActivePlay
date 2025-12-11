const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

let score = 0;
let balloon = {
  x: Math.random() * 600,
  y: Math.random() * 400,
  radius: 40
};

// Pose AI
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// Webcam setup
const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});
// Try to start MediaPipe Camera; fall back to plain getUserMedia if needed
async function startCamera() {
  const statusEl = document.getElementById("status");
  try {
    await camera.start();
    statusEl.innerText = "Webcam started (MediaPipe Camera).";
  } catch (err) {
    console.warn("MediaPipe Camera failed, falling back to getUserMedia:", err);
    statusEl.innerText = "Requesting camera access...";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      statusEl.innerText = "Camera API not available in this browser.";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      video.srcObject = stream;
      await video.play();
      statusEl.innerText = "Webcam started (getUserMedia).";

      // Create a render loop to send frames to MediaPipe Pose
      async function renderLoop() {
        await pose.send({ image: video });
        requestAnimationFrame(renderLoop);
      }
      requestAnimationFrame(renderLoop);
    } catch (err2) {
      console.error("getUserMedia failed:", err2);
      statusEl.innerText = "Unable to access the camera. Check permissions or secure context (HTTPS).";
    }
  }
}

// Do not auto-start the camera on load. Wait for user to click the Start button.
const statusEl = document.getElementById("status");
if (statusEl && statusEl.innerText.trim() === "") {
  statusEl.innerText = 'Click "Start Camera" to begin.';
}

const startButton = document.getElementById('startButton');
if (startButton) {
  startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    const originalText = startButton.innerText;
    startButton.innerText = 'Starting…';
    try {
      await startCamera();
      // hide the button after successful start
      startButton.style.display = 'none';
    } catch (err) {
      console.error('startCamera failed on user click:', err);
      startButton.disabled = false;
      startButton.innerText = originalText;
    }
  });
}

// Game Logic
function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    const rightWrist = results.poseLandmarks[16];

    let handX = rightWrist.x * canvas.width;
    let handY = rightWrist.y * canvas.height;

    ctx.beginPath();
    ctx.arc(handX, handY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Draw balloon
    drawBalloon();

    // Collision check
    let dx = handX - balloon.x;
    let dy = handY - balloon.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < balloon.radius) {
      score++;
      document.getElementById("score").innerText = "Score: " + score;

      balloon.x = Math.random() * 600;
      balloon.y = Math.random() * 400;

      // Adaptive difficulty
      if (score > 5) balloon.radius = 30;
      if (score > 10) balloon.radius = 20;
    }
  }
}

function drawBalloon() {
  ctx.beginPath();
  ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}
