import { POSE_LANDMARKS } from '@mediapipe/pose';

export const virtualDrums = {
    id: 'virtual_drums',
    name: 'Virtual Drums',
    instructions: 'Hit the drum pads with your hands! Follow the rhythm and make music!',
    duration: 60, // seconds

    // State specific to this game
    initialState: {
        drumPads: [
            { id: 'left_high', x: 0.25, y: 0.3, radius: 0.1, color: 0, label: 'Left High', sound: 'snare' },
            { id: 'left_low', x: 0.25, y: 0.6, radius: 0.1, color: 1, label: 'Left Low', sound: 'tom' },
            { id: 'right_high', x: 0.75, y: 0.3, radius: 0.1, color: 2, label: 'Right High', sound: 'cymbal' },
            { id: 'right_low', x: 0.75, y: 0.6, radius: 0.1, color: 3, label: 'Right Low', sound: 'kick' },
            { id: 'center', x: 0.5, y: 0.45, radius: 0.12, color: 4, label: 'Center', sound: 'crash' },
        ],
        hitsPerPad: {},
        totalHits: 0,
        stepCount: 0, // Using as total hits for consistency
        feedback: 'Hit the drums!',
        lastHitTime: {},
        gameStartTime: null,
        beatSequence: [],
        currentBeatIndex: 0,
        sequenceMode: false,
        sequenceScore: 0,
        hitAnimations: [], // For visual feedback
    },

    // Logic to process each frame
    update: (landmarks, stateArg) => {
        const { scoreDelta: _scoreDelta, ...state } = stateArg;

        if (!landmarks) return { ...state, scoreDelta: 0 };

        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
        const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
        const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];

        // Visibility check
        const minVisibility = 0.5;
        if (leftWrist.visibility < minVisibility || rightWrist.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your hands are visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;
        const timeSinceStart = (currentTime - gameStartTime) / 1000;

        // Initialize beat sequence after 5 seconds if not in sequence mode
        let beatSequence = state.beatSequence || [];
        let sequenceMode = state.sequenceMode || false;
        let currentBeatIndex = state.currentBeatIndex || 0;

        if (timeSinceStart > 5 && beatSequence.length === 0 && !sequenceMode) {
            // Generate a simple beat sequence
            const patterns = [
                ['left_high', 'right_high', 'left_high', 'right_high'],
                ['left_low', 'right_low', 'center', 'center'],
                ['left_high', 'center', 'right_high', 'center'],
                ['left_low', 'left_high', 'right_low', 'right_high'],
            ];
            beatSequence = patterns[Math.floor(Math.random() * patterns.length)];
            currentBeatIndex = 0;
        }

        const drumPads = state.drumPads;
        const HAND_RADIUS = 0.06;
        const HIT_COOLDOWN = 300; // ms between hits on same pad

        let scoreIncrement = 0;
        let totalHits = state.totalHits || 0;
        let hitsPerPad = { ...(state.hitsPerPad || {}) };
        let lastHitTime = { ...(state.lastHitTime || {}) };
        let newFeedback = state.feedback;
        let sequenceScore = state.sequenceScore || 0;
        let hitAnimations = [...(state.hitAnimations || [])];

        // Detect downward hand motion (hitting motion)
        const leftHandVelocity = leftWrist.y - (leftElbow.y - 0.1); // Approximate velocity
        const rightHandVelocity = rightWrist.y - (rightElbow.y - 0.1);

        const isLeftHandHitting = leftHandVelocity > 0; // Moving down
        const isRightHandHitting = rightHandVelocity > 0; // Moving down

        // Check each drum pad for hits
        drumPads.forEach(pad => {
            const timeSinceLastHit = currentTime - (lastHitTime[pad.id] || 0);

            if (timeSinceLastHit < HIT_COOLDOWN) {
                return; // Skip if hit too recently
            }

            // Check left hand
            const leftHandDist = Math.sqrt(
                Math.pow(leftWrist.x - pad.x, 2) +
                Math.pow(leftWrist.y - pad.y, 2)
            );

            // Check right hand
            const rightHandDist = Math.sqrt(
                Math.pow(rightWrist.x - pad.x, 2) +
                Math.pow(rightWrist.y - pad.y, 2)
            );

            let wasHit = false;
            let handUsed = '';

            if (leftHandDist < HAND_RADIUS + pad.radius && isLeftHandHitting) {
                wasHit = true;
                handUsed = 'Left';
            } else if (rightHandDist < HAND_RADIUS + pad.radius && isRightHandHitting) {
                wasHit = true;
                handUsed = 'Right';
            }

            if (wasHit) {
                // Pad hit!
                totalHits++;
                hitsPerPad[pad.id] = (hitsPerPad[pad.id] || 0) + 1;
                lastHitTime[pad.id] = currentTime;

                // Add hit animation
                hitAnimations.push({
                    id: Math.random(),
                    x: pad.x,
                    y: pad.y,
                    startTime: currentTime,
                    duration: 300,
                });

                // Check if this matches the beat sequence
                if (beatSequence.length > 0 && beatSequence[currentBeatIndex] === pad.id) {
                    // Correct beat!
                    scoreIncrement += 15;
                    sequenceScore++;
                    currentBeatIndex++;
                    newFeedback = `🎵 Perfect! ${pad.label} - ${sequenceScore}/${beatSequence.length}`;

                    // Check if sequence complete
                    if (currentBeatIndex >= beatSequence.length) {
                        scoreIncrement += 50; // Bonus for completing sequence
                        newFeedback = `🎉 Sequence Complete! +50 Bonus!`;
                        // Generate new sequence
                        const patterns = [
                            ['left_high', 'right_high', 'left_high', 'right_high'],
                            ['left_low', 'right_low', 'center', 'center'],
                            ['left_high', 'center', 'right_high', 'center'],
                            ['left_low', 'left_high', 'right_low', 'right_high'],
                            ['center', 'left_high', 'center', 'right_high'],
                        ];
                        beatSequence = patterns[Math.floor(Math.random() * patterns.length)];
                        currentBeatIndex = 0;
                        sequenceScore = 0;
                    }
                } else if (beatSequence.length > 0) {
                    // Wrong beat in sequence
                    scoreIncrement += 5; // Still give some points for hitting
                    newFeedback = `${handUsed} hand hit ${pad.label}! (Not in sequence)`;
                } else {
                    // Free play mode
                    scoreIncrement += 10;
                    newFeedback = `${handUsed} hand hit ${pad.label}! +10`;
                }
            }
        });

        // Clean up old hit animations
        hitAnimations = hitAnimations.filter(anim => {
            return currentTime - anim.startTime < anim.duration;
        });

        // Update feedback if no hit this frame
        if (scoreIncrement === 0) {
            if (beatSequence.length > 0 && currentBeatIndex < beatSequence.length) {
                const nextPad = drumPads.find(p => p.id === beatSequence[currentBeatIndex]);
                newFeedback = `Next: ${nextPad.label} (${currentBeatIndex + 1}/${beatSequence.length})`;
            } else if (beatSequence.length === 0) {
                newFeedback = 'Free play! Hit any drum!';
            }
        }

        // Calculate rhythm score (consistency of hits)
        const hitTimes = Object.values(lastHitTime);
        const rhythmConsistency = hitTimes.length > 2 ?
            calculateRhythmScore(hitTimes) : 0;

        return {
            ...state,
            drumPads,
            hitsPerPad,
            totalHits,
            stepCount: totalHits, // For display consistency
            feedback: newFeedback,
            lastHitTime,
            gameStartTime,
            beatSequence,
            currentBeatIndex,
            sequenceMode,
            sequenceScore,
            hitAnimations,
            rhythmConsistency,
            leftWristPos: { x: leftWrist.x, y: leftWrist.y }, // For rendering
            rightWristPos: { x: rightWrist.x, y: rightWrist.y }, // For rendering
            scoreDelta: scoreIncrement,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            drumPads: state.drumPads || [],
            hitsPerPad: state.hitsPerPad || {},
            totalHits: state.totalHits || 0,
            beatSequence: state.beatSequence || [],
            currentBeatIndex: state.currentBeatIndex || 0,
            sequenceScore: state.sequenceScore || 0,
            hitAnimations: state.hitAnimations || [],
            leftWristPos: state.leftWristPos || { x: 0.3, y: 0.5 },
            rightWristPos: state.rightWristPos || { x: 0.7, y: 0.5 },
            rhythmConsistency: state.rhythmConsistency || 0,
        };
    },
};

// Helper function to calculate rhythm consistency
function calculateRhythmScore(hitTimes) {
    if (hitTimes.length < 3) return 0;

    // Calculate intervals between hits
    const sortedTimes = [...hitTimes].sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < sortedTimes.length; i++) {
        intervals.push(sortedTimes[i] - sortedTimes[i - 1]);
    }

    // Calculate variance in intervals (lower = more consistent)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
        return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    // Convert to score (0-100)
    const consistency = Math.max(0, 100 - Math.sqrt(variance) / 10);
    return Math.round(consistency);
}
