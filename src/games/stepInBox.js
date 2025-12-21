import { POSE_LANDMARKS } from '@mediapipe/pose';

export const stepInBox = {
    id: 'step_in_box',
    name: 'Step-In-Box',
    instructions: 'Step or lean in the direction shown! Great for coordination and leg strength.',
    duration: 60, // seconds
    calibrationType: 'full_body',

    // State specific to this game
    initialState: {
        currentDirection: null,
        directionStartTime: null,
        correctSteps: 0,
        stepCount: 0, // Using as correct steps for consistency
        feedback: 'Get ready!',
        gameStartTime: null,
        streak: 0,
        centerPosition: null, // User's center position for calibration
        calibrated: false,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
        const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
        const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
        // Shoulders not required for current detection

        // Visibility check
        const minVisibility = 0.4; // Matches lenient calibration
        if (leftHip.visibility < minVisibility || rightHip.visibility < minVisibility ||
            leftKnee.visibility < minVisibility || rightKnee.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your body is visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;
        const timeSinceStart = (currentTime - gameStartTime) / 1000;

        // Calculate center position (average of hips)
        const currentCenterX = (leftHip.x + rightHip.x) / 2;
        const currentCenterY = (leftHip.y + rightHip.y) / 2;

        // Calibrate center position in first 2 seconds
        let centerPosition = state.centerPosition;
        let calibrated = state.calibrated;

        if (!calibrated && timeSinceStart < 2) {
            centerPosition = { x: currentCenterX, y: currentCenterY };
            return {
                ...state,
                centerPosition,
                feedback: 'Stand in center... Calibrating...',
                gameStartTime,
                scoreDelta: 0,
            };
        } else if (!calibrated) {
            calibrated = true;
        }

        // If not calibrated yet, use current position
        if (!centerPosition) {
            centerPosition = { x: currentCenterX, y: currentCenterY };
        }

        // Calculate movement from center
        const moveX = currentCenterX - centerPosition.x;
        const moveY = currentCenterY - centerPosition.y;

        // Movement thresholds
        const MOVE_THRESHOLD = 0.08; // Significant movement
        const KNEE_BEND_THRESHOLD = 0.05; // Knee bend detection

        // Detect knee bends (for up/down movements)
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
        const kneeBend = avgKneeY - avgHipY;

        // Determine current user position
        let userDirection = 'CENTER';

        if (moveX < -MOVE_THRESHOLD) {
            userDirection = 'LEFT';
        } else if (moveX > MOVE_THRESHOLD) {
            userDirection = 'RIGHT';
        } else if (moveY < -MOVE_THRESHOLD || kneeBend > KNEE_BEND_THRESHOLD) {
            userDirection = 'UP';
        } else if (moveY > MOVE_THRESHOLD) {
            userDirection = 'DOWN';
        }

        // Generate new direction if needed
        let currentDirection = state.currentDirection;
        let directionStartTime = state.directionStartTime;

        if (!currentDirection || (currentTime - directionStartTime) > 4000) {
            // Generate new random direction
            const directions = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
            currentDirection = directions[Math.floor(Math.random() * directions.length)];
            directionStartTime = currentTime;
        }

        // Check if user is in correct position
        let scoreIncrement = 0;
        let correctSteps = state.correctSteps || 0;
        let newFeedback = state.feedback;
        let streak = state.streak || 0;

        const timeInDirection = currentTime - directionStartTime;
        if (userDirection === currentDirection && timeInDirection > 500) {
            // Correct direction!
            correctSteps++;
            streak++;

            // Score based on speed
            let points = 10;
            if (timeInDirection < 1000) {
                points = 25; // Very fast
                newFeedback = `⚡ Lightning ${currentDirection}! +25`;
            } else if (timeInDirection < 2000) {
                points = 15; // Fast
                newFeedback = `✨ Quick ${currentDirection}! +15`;
            } else {
                points = 10; // Good
                newFeedback = `👍 Good ${currentDirection}! +10`;
            }

            // Streak bonus
            if (streak > 1) {
                const streakBonus = Math.min(streak * 2, 20);
                points += streakBonus;
                newFeedback += ` Streak x${streak}!`;
            }

            scoreIncrement = points;

            // Generate new direction immediately
            const directions = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
            currentDirection = directions[Math.floor(Math.random() * directions.length)];
            directionStartTime = currentTime;
        } else if (scoreIncrement === 0) {
            // Provide guidance
            if (timeInDirection < 500) {
                newFeedback = `Get ready...`;
            } else if (timeInDirection > 3500) {
                newFeedback = `Hurry! Step ${currentDirection}!`;
                // Reset streak if too slow
                if (streak > 0) {
                    streak = 0;
                }
            } else {
                newFeedback = `Step ${currentDirection}!`;
            }
        }

        return {
            ...state,
            currentDirection,
            directionStartTime,
            correctSteps,
            stepCount: correctSteps, // For display consistency
            feedback: newFeedback,
            gameStartTime,
            streak,
            centerPosition,
            calibrated,
            userDirection, // For rendering
            moveX, // For rendering
            moveY, // For rendering

            scoreDelta: scoreIncrement,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            currentDirection: state.currentDirection,
            userDirection: state.userDirection || 'CENTER',
            correctSteps: state.correctSteps || 0,
            streak: state.streak || 0,
            calibrated: state.calibrated || false,
        };
    },
};
