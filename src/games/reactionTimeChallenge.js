import { POSE_LANDMARKS } from '@mediapipe/pose';

export const reactionTimeChallenge = {
    id: 'reaction_time_challenge',
    name: 'Reaction Time Challenge',
    instructions: 'Touch the targets as fast as you can! Improves hand-eye coordination.',
    duration: 60, // seconds
    calibrationType: 'hands_only',

    // State specific to this game
    initialState: {
        targets: [],
        targetsHit: 0,
        stepCount: 0, // Using as targets hit for consistency
        feedback: 'Get ready!',
        currentTarget: null,
        targetSpawnTime: null,
        reactionTimes: [],
        averageReactionTime: 0,
        bestReactionTime: null,
        gameStartTime: null,
        nextTargetDelay: 2000, // ms
        lastTargetEndTime: null,
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

        // Visibility check
        const minVisibility = 0.4;
        if (leftWrist.visibility < minVisibility || rightWrist.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your hands are visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;

        let currentTarget = state.currentTarget;
        let targetSpawnTime = state.targetSpawnTime;
        let scoreIncrement = 0;
        let targetsHit = state.targetsHit || 0;
        let newFeedback = state.feedback;
        let reactionTimes = [...(state.reactionTimes || [])];
        let bestReactionTime = state.bestReactionTime;
        let nextTargetDelay = state.nextTargetDelay || 2000;
        let lastTargetEndTime = state.lastTargetEndTime || gameStartTime;

        // Spawn new target if none exists and enough time has passed
        if (!currentTarget && (currentTime - lastTargetEndTime > nextTargetDelay)) {
            // Define target zones (corners and center areas)
            const zones = [
                { x: 0.2, y: 0.2, label: 'Top Left' },
                { x: 0.8, y: 0.2, label: 'Top Right' },
                { x: 0.2, y: 0.7, label: 'Bottom Left' },
                { x: 0.8, y: 0.7, label: 'Bottom Right' },
                { x: 0.5, y: 0.35, label: 'Top Center' },
                { x: 0.5, y: 0.65, label: 'Bottom Center' },
                { x: 0.35, y: 0.45, label: 'Left Center' },
                { x: 0.65, y: 0.45, label: 'Right Center' },
            ];

            const randomZone = zones[Math.floor(Math.random() * zones.length)];

            const isDistractor = Math.random() < 0.2; // 20% Chance of distractor

            currentTarget = {
                id: Math.random(),
                x: randomZone.x,
                y: randomZone.y,
                radius: 0.08,
                label: randomZone.label,
                shape: Math.floor(Math.random() * 3), // 0=circle, 1=square, 2=star
                type: isDistractor ? 'distractor' : 'normal',
            };

            targetSpawnTime = currentTime;
            if (isDistractor) {
                newFeedback = '⚠️ RED TARGET! DO NOT TOUCH!';
            } else {
                newFeedback = `Touch the ${randomZone.label} target!`;
            }
        }

        // Check if hands are touching the current target
        if (currentTarget) {
            const HAND_RADIUS = 0.06;

            // Check left hand
            const leftHandDist = Math.sqrt(
                Math.pow(leftWrist.x - currentTarget.x, 2) +
                Math.pow(leftWrist.y - currentTarget.y, 2)
            );

            // Check right hand
            const rightHandDist = Math.sqrt(
                Math.pow(rightWrist.x - currentTarget.x, 2) +
                Math.pow(rightWrist.y - currentTarget.y, 2)
            );

            if (leftHandDist < HAND_RADIUS + currentTarget.radius ||
                rightHandDist < HAND_RADIUS + currentTarget.radius) {

                if (currentTarget.type === 'distractor') {
                    // Penalty for touching distractor
                    scoreIncrement = -30;
                    targetsHit = Math.max(0, targetsHit - 1);
                    newFeedback = '❌ OUCH! DO NOT TOUCH RED!';

                    currentTarget = null;
                    targetSpawnTime = null;
                    lastTargetEndTime = currentTime;
                    nextTargetDelay += 500; // Penalize speed
                } else {
                    // Target hit!
                    const reactionTime = currentTime - targetSpawnTime;
                    reactionTimes.push(reactionTime);
                    targetsHit++;

                    // Calculate score based on reaction time
                    let points = 10;
                    if (reactionTime < 500) {
                        points = 50; // Lightning fast!
                        newFeedback = '⚡ Lightning Fast! +50';
                    } else if (reactionTime < 1000) {
                        points = 30; // Very fast
                        newFeedback = '🔥 Very Fast! +30';
                    } else if (reactionTime < 1500) {
                        points = 20; // Fast
                        newFeedback = '✨ Fast! +20';
                    } else {
                        points = 10; // Good
                        newFeedback = '👍 Good! +10';
                    }

                    scoreIncrement = points;

                    // Update best reaction time
                    if (!bestReactionTime || reactionTime < bestReactionTime) {
                        bestReactionTime = reactionTime;
                    }

                    // Clear current target
                    currentTarget = null;
                    targetSpawnTime = null;
                    lastTargetEndTime = currentTime;

                    // Decrease delay between targets as player improves (min 800ms)
                    nextTargetDelay = Math.max(800, nextTargetDelay - 50);
                }
            } else {
                // Check if target has been on screen too long (timeout after 3 seconds)
                const targetAge = currentTime - targetSpawnTime;
                if (targetAge > 3000) {
                    if (currentTarget.type === 'distractor') {
                        newFeedback = 'Good avoid!';
                    } else {
                        newFeedback = 'Too slow! Try again!';
                    }
                    currentTarget = null;
                    targetSpawnTime = null;
                    lastTargetEndTime = currentTime;
                    // Increase delay slightly on timeout
                    nextTargetDelay = Math.min(2500, nextTargetDelay + 100);
                }
            }
        }

        // Calculate average reaction time
        const averageReactionTime = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        // Provide hand position feedback when no target
        if (!currentTarget && scoreIncrement === 0) {
            const leftHandRaised = leftWrist.y < leftShoulder.y;
            const rightHandRaised = rightWrist.y < rightShoulder.y;

            if (leftHandRaised || rightHandRaised) {
                newFeedback = 'Ready! Target incoming...';
            } else {
                newFeedback = 'Raise your hands to get ready!';
            }
        }

        return {
            ...state,
            currentTarget,
            targetSpawnTime,
            targetsHit,
            stepCount: targetsHit, // For display consistency
            feedback: newFeedback,
            reactionTimes,
            averageReactionTime,
            bestReactionTime,
            gameStartTime,
            nextTargetDelay,
            rightWristPos: { x: rightWrist.x, y: rightWrist.y }, // For rendering
            scoreDelta: scoreIncrement,
            lastTargetEndTime,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            currentTarget: state.currentTarget,
            targetsHit: state.targetsHit || 0,
            averageReactionTime: state.averageReactionTime || 0,
            bestReactionTime: state.bestReactionTime,
            leftWristPos: state.leftWristPos || { x: 0.3, y: 0.5 },
            rightWristPos: state.rightWristPos || { x: 0.7, y: 0.5 },
        };
    },
};
