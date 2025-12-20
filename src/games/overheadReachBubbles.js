import { POSE_LANDMARKS } from '@mediapipe/pose';

export const overheadReachBubbles = {
    id: 'overhead_reach_bubbles',
    name: 'Overhead Reach Bubbles',
    instructions: 'Reach up and pop the floating bubbles! Great for shoulder mobility.',
    duration: 60, // seconds
    calibrationType: 'hands_only',

    // State specific to this game
    initialState: {
        bubbles: [],
        bubblesPopped: 0,
        stepCount: 0, // Using as bubbles popped for consistency
        feedback: 'Reach for the bubbles!',
        nextBubbleSpawn: 0,
        gameStartTime: null,
        lastPopTime: null,
        combo: 0,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

        // Visibility check
        const minVisibility = 0.5;
        if (leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility ||
            leftWrist.visibility < minVisibility || rightWrist.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your arms are visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;
        const timeSinceStart = (currentTime - gameStartTime) / 1000;

        // Spawn bubbles
        let bubbles = [...(state.bubbles || [])];
        const nextBubbleSpawn = state.nextBubbleSpawn || 0;

        if (timeSinceStart > nextBubbleSpawn && bubbles.length < 5) {
            // Spawn new bubble at random position (upper half of screen)
            const newBubble = {
                id: Math.random(),
                x: 0.2 + Math.random() * 0.6, // Random x between 0.2 and 0.8
                y: 0.15 + Math.random() * 0.35, // Random y between 0.15 and 0.5 (upper half)
                radius: 0.06 + Math.random() * 0.02, // Random size
                floatSpeed: 0.0005 + Math.random() * 0.0005, // Slow upward float
                spawnTime: currentTime,
                color: Math.floor(Math.random() * 5), // 0-4 for different colors
            };
            bubbles.push(newBubble);
        }

        // Update bubble positions (float upward)
        bubbles = bubbles.map(bubble => ({
            ...bubble,
            y: bubble.y - bubble.floatSpeed,
        }));

        // Remove bubbles that floated off screen or are too old
        bubbles = bubbles.filter(bubble => {
            const bubbleAge = (currentTime - bubble.spawnTime) / 1000;
            return bubble.y > -0.1 && bubbleAge < 7; // Remove if off screen or older than 7s
        });

        // Check if hands are touching bubbles
        const HAND_RADIUS = 0.05;
        let scoreIncrement = 0;
        let bubblesPopped = state.bubblesPopped || 0;
        let newFeedback = state.feedback;
        let combo = state.combo || 0;
        const lastPopTime = state.lastPopTime || 0;

        // Reset combo if no pop in last 2 seconds
        if (currentTime - lastPopTime > 2000) {
            combo = 0;
        }

        let newLastPopTime = lastPopTime;
        let poppedThisFrame = false;

        bubbles = bubbles.filter(bubble => {
            // Check left hand
            const leftHandDist = Math.sqrt(
                Math.pow(leftWrist.x - bubble.x, 2) +
                Math.pow(leftWrist.y - bubble.y, 2)
            );

            // Check right hand
            const rightHandDist = Math.sqrt(
                Math.pow(rightWrist.x - bubble.x, 2) +
                Math.pow(rightWrist.y - bubble.y, 2)
            );

            if (leftHandDist < HAND_RADIUS + bubble.radius ||
                rightHandDist < HAND_RADIUS + bubble.radius) {
                // Bubble popped!
                poppedThisFrame = true;
                bubblesPopped++;
                newLastPopTime = currentTime;
                combo++;

                // Score based on bubble size (smaller = harder = more points)
                const basePoints = Math.floor(20 / bubble.radius);
                const comboBonus = Math.min(combo * 2, 20);
                scoreIncrement += basePoints + comboBonus;

                // Determine which hand popped it
                const handUsed = leftHandDist < rightHandDist ? 'Left' : 'Right';

                if (combo > 1) {
                    newFeedback = `${handUsed} hand! Combo x${combo}! +${basePoints + comboBonus}`;
                } else {
                    newFeedback = `${handUsed} hand pop! +${basePoints}`;
                }

                return false; // Remove bubble
            }

            return true; // Keep bubble
        });

        // Update feedback if no pop this frame
        if (!poppedThisFrame) {
            // Check if hands are raised
            const leftHandRaised = leftWrist.y < leftShoulder.y - 0.1;
            const rightHandRaised = rightWrist.y < rightShoulder.y - 0.1;

            if (bubbles.length === 0) {
                newFeedback = 'Get ready for more bubbles!';
            } else if (!leftHandRaised && !rightHandRaised) {
                newFeedback = 'Raise your hands to reach!';
            } else if (leftHandRaised && rightHandRaised) {
                newFeedback = 'Both hands up! Great reach!';
            } else {
                newFeedback = 'Reach for the bubbles!';
            }
        }

        // Calculate next bubble spawn time
        let newNextBubbleSpawn = nextBubbleSpawn;
        if (bubbles.length < 5 && timeSinceStart > nextBubbleSpawn) {
            // Spawn faster as game progresses
            const spawnInterval = Math.max(1, 3 - timeSinceStart / 20);
            newNextBubbleSpawn = timeSinceStart + spawnInterval;
        }

        // Calculate reach height for rendering (highest hand position)
        const leftReachHeight = leftShoulder.y - leftWrist.y;
        const rightReachHeight = rightShoulder.y - rightWrist.y;
        const maxReachHeight = Math.max(leftReachHeight, rightReachHeight);

        return {
            ...state,
            bubbles,
            bubblesPopped,
            stepCount: bubblesPopped, // For display consistency
            feedback: newFeedback,
            nextBubbleSpawn: newNextBubbleSpawn,
            gameStartTime,
            lastPopTime: newLastPopTime,
            combo,
            leftWristPos: { x: leftWrist.x, y: leftWrist.y }, // For rendering
            rightWristPos: { x: rightWrist.x, y: rightWrist.y }, // For rendering
            maxReachHeight, // For rendering
            scoreDelta: scoreIncrement,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            bubbles: state.bubbles || [],
            bubblesPopped: state.bubblesPopped || 0,
            combo: state.combo || 0,
            leftWristPos: state.leftWristPos || { x: 0.3, y: 0.5 },
            rightWristPos: state.rightWristPos || { x: 0.7, y: 0.5 },
            maxReachHeight: state.maxReachHeight || 0,
        };
    },
};
