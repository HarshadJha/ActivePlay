import { POSE_LANDMARKS } from '@mediapipe/pose';

export const reachHold = {
    id: 'reach_hold',
    name: 'Reach & Hold',
    instructions: 'Raise your arms above your shoulders and hold steady. Great for balance and flexibility!',
    duration: 60, // seconds
    calibrationType: 'upper_body',

    // State specific to this game
    initialState: {
        isHolding: false,
        holdStartTime: null,
        totalHoldTime: 0,
        stepCount: 0, // Number of successful holds
        feedback: 'Raise your arms!',
        lastScoreTime: null,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        // Remove scoreDelta from previous frame
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
        const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

        // Visibility check
        const minVisibility = 0.4;
        if (leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility ||
            leftElbow.visibility < minVisibility || rightElbow.visibility < minVisibility ||
            leftWrist.visibility < minVisibility || rightWrist.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your arms are visible!', scoreDelta: 0 };
        }

        // Check if arms are raised (wrists should be higher than shoulders)
        // In MediaPipe, y increases downward, so higher means smaller y value
        const raiseThreshold = 0.1; // Wrists should be this much higher than shoulders

        const isLeftArmRaised = leftWrist.y < (leftShoulder.y - raiseThreshold);
        const isRightArmRaised = rightWrist.y < (rightShoulder.y - raiseThreshold);

        // Both arms should be raised
        const areBothArmsRaised = isLeftArmRaised && isRightArmRaised;

        // Calculate arm stability (how steady the arms are)
        const leftArmHeight = leftShoulder.y - leftWrist.y;
        const rightArmHeight = rightShoulder.y - rightWrist.y;

        let newState = { ...state };
        let scoreIncrement = 0;
        const currentTime = Date.now();

        if (areBothArmsRaised) {
            if (!state.isHolding) {
                // Just started holding
                newState.isHolding = true;
                newState.holdStartTime = currentTime;
                newState.lastScoreTime = currentTime;
                newState.feedback = 'Great! Hold steady...';
            } else {
                // Currently holding
                const holdDuration = (currentTime - state.holdStartTime) / 1000; // in seconds
                newState.totalHoldTime = state.totalHoldTime + 0.033; // Approximate frame time

                // Award points every second of holding
                if (currentTime - state.lastScoreTime >= 1000) {
                    scoreIncrement = 5;
                    newState.lastScoreTime = currentTime;

                    // Update feedback based on hold duration
                    if (holdDuration >= 10) {
                        newState.feedback = `Amazing! ${Math.floor(holdDuration)}s hold!`;
                    } else if (holdDuration >= 5) {
                        newState.feedback = `Excellent! ${Math.floor(holdDuration)}s!`;
                    } else {
                        newState.feedback = `Good! Keep holding...`;
                    }
                }

                // Bonus for stability (arms at similar height)
                const armBalance = Math.abs(leftArmHeight - rightArmHeight);
                if (armBalance < 0.05) {
                    newState.feedback += ' Perfect balance!';
                }
            }
        } else {
            if (state.isHolding) {
                // Just stopped holding
                const holdDuration = (currentTime - state.holdStartTime) / 1000;

                // Award bonus points for completing a hold
                if (holdDuration >= 3) {
                    newState.stepCount = (state.stepCount || 0) + 1;
                    scoreIncrement = Math.floor(holdDuration * 2); // 2 points per second held
                    newState.feedback = `Hold complete! +${scoreIncrement}`;
                } else {
                    newState.feedback = 'Hold longer for points!';
                }

                newState.isHolding = false;
                newState.holdStartTime = null;
            } else {
                // Not holding, encourage to raise arms
                if (isLeftArmRaised && !isRightArmRaised) {
                    newState.feedback = 'Raise your right arm!';
                } else if (!isLeftArmRaised && isRightArmRaised) {
                    newState.feedback = 'Raise your left arm!';
                } else {
                    newState.feedback = 'Raise both arms!';
                }
            }
        }

        return {
            ...newState,
            scoreDelta: scoreIncrement
        };
    }
};
