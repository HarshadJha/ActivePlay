import { POSE_LANDMARKS } from '@mediapipe/pose';

export const happySteps = {
    id: 'happy_steps',
    name: 'Happy Steps',
    instructions: 'March in place! Lift your knees high.',
    duration: 60, // seconds

    // State specific to this game
    initialState: {
        lastLeg: null,
        stepCount: 0,
        feedback: 'Get Ready!',
        upFramesLeft: 0,
        upFramesRight: 0,
        cooldownFrames: 0,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;
        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
        const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
        const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

        // Visibility check
        const minVisibility = 0.5;
        if (leftHip.visibility < minVisibility || rightHip.visibility < minVisibility ||
            leftKnee.visibility < minVisibility || rightKnee.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your full body is visible!', scoreDelta: 0 };
        }

        // Thresholds (knee should be higher than hip + some margin, but y increases downwards)
        // Actually, knee y < hip y means knee is higher.
        // Let's use a relative threshold.
        const liftThreshold = 0.1;

        const isLeftUp = leftKnee.y < (leftHip.y + liftThreshold);
        const isRightUp = rightKnee.y < (rightHip.y + liftThreshold);

        // Simple step detection
        // We want alternating steps.

        let newState = { ...state, feedback: 'March!' };
        let scoreIncrement = 0;

        let upFramesLeft = (state.upFramesLeft || 0);
        let upFramesRight = (state.upFramesRight || 0);
        let cooldownFrames = (state.cooldownFrames || 0);

        upFramesLeft = isLeftUp ? upFramesLeft + 1 : 0;
        upFramesRight = isRightUp ? upFramesRight + 1 : 0;
        cooldownFrames = Math.max(0, cooldownFrames - 1);

        // Left step detection with gating
        if (upFramesLeft >= 2 && !isRightUp && state.lastLeg !== 'left' && cooldownFrames === 0) {
            if (leftKnee.y < leftHip.y) {
                newState.lastLeg = 'left';
                newState.stepCount = (state.stepCount || 0) + 1;
                scoreIncrement = 10;
                newState.feedback = 'Great Left Step!';
                cooldownFrames = 5;
            }
        }

        // Right step detection with gating
        else if (upFramesRight >= 2 && !isLeftUp && state.lastLeg !== 'right' && cooldownFrames === 0) {
            if (rightKnee.y < rightHip.y) {
                newState.lastLeg = 'right';
                newState.stepCount = (state.stepCount || 0) + 1;
                scoreIncrement = 10;
                newState.feedback = 'Great Right Step!';
                cooldownFrames = 5;
            }
        }

        return {
            ...newState,
            upFramesLeft,
            upFramesRight,
            cooldownFrames,
            scoreDelta: scoreIncrement,
        };
    }
};
