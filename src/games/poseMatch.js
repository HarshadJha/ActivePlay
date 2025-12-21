import { POSE_LANDMARKS } from '@mediapipe/pose';

export const poseMatch = {
    id: 'pose_match',
    name: 'Pose Match',
    instructions: 'Match the pose shown on screen! Great for full body flexibility.',
    duration: 60, // seconds
    calibrationType: 'full_body',

    // State specific to this game
    initialState: {
        currentPose: null,
        poseStartTime: null,
        posesMatched: 0,
        stepCount: 0, // Using as poses matched for consistency
        feedback: 'Get ready!',
        gameStartTime: null,
        matchProgress: 0,
        perfectMatches: 0,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        // Get all necessary landmarks
        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
        const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

        // Visibility check
        const minVisibility = 0.4;
        const allVisible = [leftShoulder, rightShoulder, leftElbow, rightElbow,
            leftWrist, rightWrist, leftHip, rightHip]
            .every(landmark => landmark.visibility >= minVisibility);

        if (!allVisible) {
            return { ...state, feedback: 'Make sure your full body is visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;

        // Define target poses
        const poses = [
            {
                name: 'T-Pose',
                description: 'Arms straight out to sides',
                check: (lm) => {
                    const leftArmAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW]);
                    const rightArmAngle = calculateAngle(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW]);
                    return leftArmAngle > 70 && leftArmAngle < 110 && rightArmAngle > 70 && rightArmAngle < 110;
                },
                icon: '🤸',
            },
            {
                name: 'Left Arm Up',
                description: 'Raise your left arm straight up',
                check: (lm) => {
                    const leftWristAboveShoulder = lm[POSE_LANDMARKS.LEFT_WRIST].y < lm[POSE_LANDMARKS.LEFT_SHOULDER].y - 0.15;
                    const rightArmDown = lm[POSE_LANDMARKS.RIGHT_WRIST].y > lm[POSE_LANDMARKS.RIGHT_SHOULDER].y;
                    return leftWristAboveShoulder && rightArmDown;
                },
                icon: '👈',
            },
            {
                name: 'Right Arm Up',
                description: 'Raise your right arm straight up',
                check: (lm) => {
                    const rightWristAboveShoulder = lm[POSE_LANDMARKS.RIGHT_WRIST].y < lm[POSE_LANDMARKS.RIGHT_SHOULDER].y - 0.15;
                    const leftArmDown = lm[POSE_LANDMARKS.LEFT_WRIST].y > lm[POSE_LANDMARKS.LEFT_SHOULDER].y;
                    return rightWristAboveShoulder && leftArmDown;
                },
                icon: '👉',
            },
            {
                name: 'Both Arms Up',
                description: 'Raise both arms straight up',
                check: (lm) => {
                    const leftWristAboveShoulder = lm[POSE_LANDMARKS.LEFT_WRIST].y < lm[POSE_LANDMARKS.LEFT_SHOULDER].y - 0.15;
                    const rightWristAboveShoulder = lm[POSE_LANDMARKS.RIGHT_WRIST].y < lm[POSE_LANDMARKS.RIGHT_SHOULDER].y - 0.15;
                    return leftWristAboveShoulder && rightWristAboveShoulder;
                },
                icon: '🙌',
            },
            {
                name: 'Side Bend Left',
                description: 'Lean to your left side',
                check: (lm) => {
                    const shoulderTilt = lm[POSE_LANDMARKS.LEFT_SHOULDER].y - lm[POSE_LANDMARKS.RIGHT_SHOULDER].y;
                    return shoulderTilt > 0.05;
                },
                icon: '↖️',
            },
            {
                name: 'Side Bend Right',
                description: 'Lean to your right side',
                check: (lm) => {
                    const shoulderTilt = lm[POSE_LANDMARKS.RIGHT_SHOULDER].y - lm[POSE_LANDMARKS.LEFT_SHOULDER].y;
                    return shoulderTilt > 0.05;
                },
                icon: '↗️',
            },
            {
                name: 'Arms Forward',
                description: 'Extend both arms forward',
                check: (lm) => {
                    const leftElbowAngle = calculateAngle(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
                    const rightElbowAngle = calculateAngle(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
                    return leftElbowAngle > 160 && rightElbowAngle > 160;
                },
                icon: '👐',
            },
        ];

        // Select or maintain current pose
        let currentPose = state.currentPose;
        let poseStartTime = state.poseStartTime;

        if (!currentPose) {
            // Select random pose
            currentPose = poses[Math.floor(Math.random() * poses.length)];
            poseStartTime = currentTime;
        }

        // Check if user matches the current pose
        const isMatching = currentPose.check(landmarks);
        let matchProgress = state.matchProgress || 0;

        if (isMatching) {
            matchProgress = Math.min(matchProgress + 3, 100); // Increase progress
        } else {
            matchProgress = Math.max(matchProgress - 2, 0); // Decrease progress
        }

        let scoreIncrement = 0;
        let posesMatched = state.posesMatched || 0;
        let perfectMatches = state.perfectMatches || 0;
        let newFeedback = state.feedback;

        // Check if pose is fully matched
        if (matchProgress >= 100 && !state.poseCompleted) {
            // Pose matched!
            const timeToMatch = (currentTime - poseStartTime) / 1000;
            posesMatched++;

            // Score based on speed
            let points = 20;

            if (timeToMatch < 2) {
                points = 50;
                perfectMatches++;
                newFeedback = `⭐ Perfect ${currentPose.name}! +50`;
            } else if (timeToMatch < 4) {
                points = 35;
                newFeedback = `✨ Great ${currentPose.name}! +35`;
            } else if (timeToMatch < 6) {
                points = 25;
                newFeedback = `👍 Good ${currentPose.name}! +25`;
            } else {
                points = 20;
                newFeedback = `✓ ${currentPose.name} Complete! +20`;
            }

            scoreIncrement = points;

            // Select new pose
            currentPose = poses[Math.floor(Math.random() * poses.length)];
            poseStartTime = currentTime;
            matchProgress = 0;
        } else {
            // Provide feedback on progress
            const timeInPose = (currentTime - poseStartTime) / 1000;

            if (matchProgress > 80) {
                newFeedback = `Almost there! Hold it...`;
            } else if (matchProgress > 50) {
                newFeedback = `Good! Keep the pose...`;
            } else if (isMatching) {
                newFeedback = `Yes! ${currentPose.description}`;
            } else if (timeInPose > 8) {
                newFeedback = `Hurry! ${currentPose.description}`;
            } else {
                newFeedback = `${currentPose.icon} ${currentPose.description}`;
            }
        }

        return {
            ...state,
            currentPose,
            poseStartTime,
            posesMatched,
            stepCount: posesMatched, // For display consistency
            feedback: newFeedback,
            gameStartTime,
            matchProgress,
            perfectMatches,
            poseCompleted: matchProgress >= 100,
            scoreDelta: scoreIncrement,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            currentPose: state.currentPose,
            posesMatched: state.posesMatched || 0,
            matchProgress: state.matchProgress || 0,
            perfectMatches: state.perfectMatches || 0,
        };
    },
};

// Helper function to calculate angle between three points
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360.0 - angle;
    }

    return angle;
}
