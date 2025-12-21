import { POSE_LANDMARKS } from '@mediapipe/pose';

export const CALIBRATION_TYPES = {
    HANDS_ONLY: 'hands_only',
    UPPER_BODY: 'upper_body',
    FULL_BODY: 'full_body',
};

export const CALIBRATION_CONFIG = {
    [CALIBRATION_TYPES.HANDS_ONLY]: {
        title: 'Hands Calibration',
        instructions: 'Stand so your head, shoulders, and hands are visible.',
        requiredLandmarks: [
            POSE_LANDMARKS.LEFT_SHOULDER,
            POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.LEFT_WRIST,
            POSE_LANDMARKS.RIGHT_WRIST,
        ],
        checkCentering: (landmarks) => {
            const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
            const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
            const centerX = (ls.x + rs.x) * 0.5;
            return centerX > 0.3 && centerX < 0.7;
        }
    },
    [CALIBRATION_TYPES.UPPER_BODY]: {
        title: 'Upper Body Calibration',
        instructions: 'Position yourself so your shoulders and hands are clearly visible.',
        requiredLandmarks: [
            POSE_LANDMARKS.LEFT_SHOULDER,
            POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.LEFT_WRIST,
            POSE_LANDMARKS.RIGHT_WRIST,
        ],
        checkCentering: (landmarks) => {
            const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
            const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
            const centerX = (ls.x + rs.x) * 0.5;
            return centerX > 0.3 && centerX < 0.7;
        }
    },
    [CALIBRATION_TYPES.FULL_BODY]: {
        title: 'Full Body Calibration',
        instructions: 'Step back so your shoulders, hips, and knees are visible.',
        requiredLandmarks: [
            POSE_LANDMARKS.LEFT_SHOULDER,
            POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.LEFT_HIP,
            POSE_LANDMARKS.RIGHT_HIP,
            POSE_LANDMARKS.LEFT_KNEE,
            POSE_LANDMARKS.RIGHT_KNEE,
            // Removed ankles - too strict for most webcam setups
        ],
        checkCentering: (landmarks) => {
            const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
            const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
            const lc = (ls.x + rs.x) * 0.5;
            return lc > 0.3 && lc < 0.7;
        }
    }
};

export const checkCalibration = (landmarks, type = CALIBRATION_TYPES.FULL_BODY) => {
    if (!landmarks) return { ok: false, message: 'No pose detected' };

    const config = CALIBRATION_CONFIG[type] || CALIBRATION_CONFIG[CALIBRATION_TYPES.FULL_BODY];

    // Check visibility of required landmarks (more lenient threshold)
    const missingLandmarks = config.requiredLandmarks.filter(index => {
        const lm = landmarks[index];
        return !lm || (lm.visibility < 0.4); // Reduced from 0.5 for more forgiving detection
    });

    if (missingLandmarks.length > 0) {
        return { ok: false, message: config.instructions };
    }

    // Check centering
    if (!config.checkCentering(landmarks)) {
        return { ok: false, message: 'Please center yourself in the frame.' };
    }

    return { ok: true, message: 'Calibration passed! Stay in position.' };
};
