import { POSE_LANDMARKS } from '@mediapipe/pose';

export const sideLeanBalance = {
    id: 'side_lean_balance',
    name: 'Side Lean Balance',
    instructions: 'Lean left and right to move the ball and collect coins! Great for core balance.',
    duration: 60, // seconds

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
        const minVisibility = 0.5;
        if (leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility ||
            leftHip.visibility < minVisibility || rightHip.visibility < minVisibility) {
            return { ...state, feedback: 'Stand where camera can see you!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;

        // Calculate lean direction based on shoulder tilt
        // If left shoulder is more to the right (higher x), user is leaning right
        const shoulderDiff = leftShoulder.x - rightShoulder.x;
        const hipDiff = leftHip.x - rightHip.x;

        // Average shoulder and hip tilt for more stable detection
        const leanAmount = (shoulderDiff + hipDiff) / 2;

        // Lean thresholds
        const LEAN_THRESHOLD = 0.05;
        const MAX_LEAN = 0.15;

        let leanDirection = 0; // -1 = left, 0 = center, 1 = right
        let leanStrength = 0; // 0-1

        if (leanAmount > LEAN_THRESHOLD) {
            // Leaning right
            leanDirection = 1;
            leanStrength = Math.min((leanAmount - LEAN_THRESHOLD) / (MAX_LEAN - LEAN_THRESHOLD), 1);
        } else if (leanAmount < -LEAN_THRESHOLD) {
            // Leaning left
            leanDirection = -1;
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

        // Spawn coins
        let coins = [...(state.coins || [])];
        const timeSinceStart = (currentTime - gameStartTime) / 1000;
        const nextCoinSpawn = state.nextCoinSpawn || 0;

        if (timeSinceStart > nextCoinSpawn && coins.length < 3) {
            // Spawn new coin at random position
            const newCoin = {
                id: Math.random(),
                x: 0.2 + Math.random() * 0.6, // Random x between 0.2 and 0.8
                y: 0.3 + Math.random() * 0.4, // Random y between 0.3 and 0.7
                radius: 0.05,
                spawnTime: currentTime,
            };
            coins.push(newCoin);
        }

        // Check coin collisions
        const BALL_RADIUS = 0.08;
        let scoreIncrement = 0;
        let coinsCollected = state.coinsCollected || 0;
        let newFeedback = state.feedback;

        coins = coins.filter(coin => {
            const distance = Math.sqrt(
                Math.pow(ballX - coin.x, 2) +
                Math.pow(state.ballY - coin.y, 2)
            );

            if (distance < BALL_RADIUS + coin.radius) {
                // Coin collected!
                scoreIncrement += 20;
                coinsCollected++;
                newFeedback = `Coin collected! +20`;
                return false; // Remove coin
            }

            // Remove coins that have been on screen too long (15 seconds)
            const coinAge = (currentTime - coin.spawnTime) / 1000;
            return coinAge < 15;
        });

        // Update feedback based on lean
        if (scoreIncrement === 0) {
            if (leanDirection === 0) {
                newFeedback = 'Lean to move the ball!';
            } else if (leanDirection === 1) {
                newFeedback = 'Leaning right!';
            } else {
                newFeedback = 'Leaning left!';
            }
        }

        // Calculate next coin spawn time
        let newNextCoinSpawn = nextCoinSpawn;
        if (coins.length < 3 && timeSinceStart > nextCoinSpawn) {
            newNextCoinSpawn = timeSinceStart + 2 + Math.random() * 3; // Spawn every 2-5 seconds
        }

        return {
            ...state,
            ballX,
            ballY: state.ballY,
            ballVelocityX,
            coins,
            coinsCollected,
            stepCount: coinsCollected, // For display consistency
            feedback: newFeedback,
            nextCoinSpawn: newNextCoinSpawn,
            gameStartTime,
            leanDirection, // For rendering
            leanStrength, // For rendering
            scoreDelta: scoreIncrement,
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
