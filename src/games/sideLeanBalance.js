import { POSE_LANDMARKS } from '@mediapipe/pose';

export const sideLeanBalance = {
    id: 'side_lean_balance',
    name: 'Side Lean Balance',
    instructions: 'Lean left and right to move the ball and collect coins! Great for core balance.',
    duration: 60, // seconds
    calibrationType: 'upper_body',

    // State specific to this game
    initialState: {
        ballX: 0.5, // Center of screen (0-1 range)
        ballY: 0.5,
        ballVelocityX: 0,
        coins: [],
        coinsCollected: 0,
        stepCount: 0, // Using as coins collected for consistency
        feedback: 'Lean to move the ball!',
        nextCoinSpawn: 0,
        gameStartTime: null,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

        // Visibility check
        const minVisibility = 0.4;
        if (leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility ||
            leftHip.visibility < minVisibility || rightHip.visibility < minVisibility) {
            return { ...state, feedback: 'Stand where camera can see you!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;

        // Calculate lean based on vertical difference (Tilt) of shoulders and hips
        // Y increases downwards
        const shoulderTilt = leftShoulder.y - rightShoulder.y;
        const hipTilt = leftHip.y - rightHip.y;

        // Average tilt (Positive = Left shoulder lower = Leaning Left)
        const leanAmount = (shoulderTilt + hipTilt) / 2;

        // Lean thresholds
        const LEAN_THRESHOLD = 0.05;
        const MAX_LEAN = 0.15;

        let leanDirection = 0; // -1 = left, 0 = center, 1 = right
        let leanStrength = 0; // 0-1

        if (leanAmount > LEAN_THRESHOLD) {
            // Leaning left (Left shoulder lower / higher Y)
            leanDirection = -1;
            leanStrength = Math.min((leanAmount - LEAN_THRESHOLD) / (MAX_LEAN - LEAN_THRESHOLD), 1);
        } else if (leanAmount < -LEAN_THRESHOLD) {
            // Leaning right (Right shoulder lower / higher Y)
            leanDirection = 1;
            leanStrength = Math.min((Math.abs(leanAmount) - LEAN_THRESHOLD) / (MAX_LEAN - LEAN_THRESHOLD), 1);
        }

        // Update ball physics
        const ACCELERATION = 0.002;
        const FRICTION = 0.92;
        const MAX_VELOCITY = 0.015;

        let ballVelocityX = (state.ballVelocityX || 0) * FRICTION;
        ballVelocityX += leanDirection * leanStrength * ACCELERATION;
        ballVelocityX = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ballVelocityX));

        let ballX = state.ballX + ballVelocityX;

        // Keep ball on screen with bounce
        if (ballX < 0.1) {
            ballX = 0.1;
            ballVelocityX = Math.abs(ballVelocityX) * 0.5;
        } else if (ballX > 0.9) {
            ballX = 0.9;
            ballVelocityX = -Math.abs(ballVelocityX) * 0.5;
        }

        // Scoring based on Leaning Duration
        let scoreIncrement = 0;
        let newFeedback = state.feedback;

        // Track continuous lean duration
        let leanHoldTime = state.leanHoldTime || 0;
        let pointsEarned = state.pointsEarned || 0;

        if (leanDirection !== 0) {
            // User is leaning
            leanHoldTime += 0.033; // Approx frame time

            // Award points every 0.1s of holding a lean
            if (leanHoldTime > 0.1) {
                scoreIncrement = 2; // Continuous points
                leanHoldTime = 0; // Reset accumulator but keep flow
                pointsEarned += 2;
            }

            if (leanDirection === 1) {
                newFeedback = 'Great! Leaning Right +2';
            } else {
                newFeedback = 'Great! Leaning Left +2';
            }
        } else {
            // Not leaning enough
            leanHoldTime = 0;
            newFeedback = 'Lean Left or Right to score!';
        }

        // Keep the ball physics for visual feedback (it's fun)
        // ... (Ball logic maps to leanStrength)

        return {
            ...state,
            ballX,
            ballY: state.ballY,
            ballVelocityX,
            leanHoldTime,
            pointsEarned,
            stepCount: pointsEarned, // Use points for display
            feedback: newFeedback,
            gameStartTime,
            leanDirection, // For rendering
            leanStrength, // For rendering
            scoreDelta: scoreIncrement,
            // Clear unused state
            coins: [],
            coinsCollected: 0,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            ballX: state.ballX || 0.5,
            ballY: state.ballY || 0.5,
            coins: state.coins || [],
            coinsCollected: state.coinsCollected || 0,
            leanDirection: state.leanDirection || 0,
            leanStrength: state.leanStrength || 0,
        };
    },
};
