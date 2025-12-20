import { POSE_LANDMARKS } from '@mediapipe/pose';

export const squats = {
    id: 'squats',
    name: 'Squat Master',
    instructions: 'Stand with feet shoulder-width apart. Squat down until your hips are below your knees, then stand back up.',
    duration: 60, // seconds
    calibrationType: 'full_body',

    // State specific to this game
    initialState: {
        isSquatting: false,
        stepCount: 0, // Using stepCount as rep count for consistency
        feedback: 'Stand straight!',
        minAngleDuringRep: 180,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        // Remove scoreDelta from previous frame so it doesn't persist
        // We act on 'state', which is the clean version
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
        const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
        const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
        const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
        const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

        // 1. Determine which leg is more visible
        const leftLegVisibility = (leftHip.visibility + leftKnee.visibility + leftAnkle.visibility) / 3;
        const rightLegVisibility = (rightHip.visibility + rightKnee.visibility + rightAnkle.visibility) / 3;

        const minVisibilityThreshold = 0.5;

        // If neither leg is clearly visible, return warning
        // Ensure to return scoreDelta: 0
        if (leftLegVisibility < minVisibilityThreshold && rightLegVisibility < minVisibilityThreshold) {
            return { ...state, feedback: 'Make sure your full body is visible!', scoreDelta: 0 };
        }

        // Use the more visible leg
        const useLeft = leftLegVisibility > rightLegVisibility;

        const hip = useLeft ? leftHip : rightHip;
        const knee = useLeft ? leftKnee : rightKnee;
        const ankle = useLeft ? leftAnkle : rightAnkle;

        // 2. Calculate Knee Angle (Raw)
        const rawAngle = calculateAngle(hip, knee, ankle);

        // 3. Angle Smoothing (EMA)
        // Initialize smoothAngle if not present
        const prevAngle = state.smoothAngle !== undefined ? state.smoothAngle : rawAngle;
        const currentAngle = prevAngle * 0.7 + rawAngle * 0.3;

        // 4. Thresholds
        const SQUAT_ANGLE = 120;
        const STAND_ANGLE = 160;

        let isSquatting = state.isSquatting;
        let minAngleDuringRep = state.minAngleDuringRep !== undefined ? state.minAngleDuringRep : 180;
        let newState = { ...state, smoothAngle: currentAngle };

        if (state.isSquatting) {
            // Track depth while squatting
            if (currentAngle < minAngleDuringRep) {
                minAngleDuringRep = currentAngle;
            }
            newState.minAngleDuringRep = minAngleDuringRep;

            // Currently squatting, waiting to stand up
            if (currentAngle > STAND_ANGLE) {
                isSquatting = false;
            }
        } else {
            // Currently standing, waiting to squat
            if (currentAngle < SQUAT_ANGLE) {
                isSquatting = true;
                // Reset depth tracking for new rep
                minAngleDuringRep = currentAngle;
                newState.minAngleDuringRep = minAngleDuringRep;
            }
        }

        // State Machine Update
        if (isSquatting) {
            newState.isSquatting = true;

            // Dynamic feedback based on current depth
            if (currentAngle < 70) {
                newState.feedback = 'Too deep!';
            } else if (currentAngle < 95) {
                newState.feedback = 'Perfect depth!';
            } else if (currentAngle < 110) {
                newState.feedback = 'Good, go lower...';
            } else {
                newState.feedback = 'Squat down...';
            }
        } else {
            // Standing
            if (state.isSquatting) {
                // Just stood up - Rep complete!
                newState.isSquatting = false;
                newState.stepCount = (state.stepCount || 0) + 1;

                // Calculate Score based on best depth (minAngle)
                let points = 10;
                let feedbackMsg = 'Squat Complete';

                if (minAngleDuringRep < 85) {
                    points = 25;
                    feedbackMsg = 'Perfect! +25';
                } else if (minAngleDuringRep < 100) {
                    points = 15;
                    feedbackMsg = 'Good Job! +15';
                } else {
                    points = 10;
                    feedbackMsg = 'Go Lower Next Time +10';
                }

                newState.feedback = feedbackMsg;
                // Return points for this ONE frame
                return { ...newState, scoreDelta: points };
            } else {
                newState.feedback = 'Ready';
            }
        }

        // Default: No score change
        return {
            ...newState,
            scoreDelta: 0
        };
    }
};

/**
 * Calculates the angle between three points (A, B, C) at B.
 * Returns angle in degrees (0-180).
 */
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360.0 - angle;
    }

    return angle;
}
