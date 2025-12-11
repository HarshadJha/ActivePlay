import { POSE_LANDMARKS } from '@mediapipe/pose';

export const airDrawing = {
    id: 'air_drawing',
    name: 'Air Drawing',
    instructions: 'Draw shapes in the air with your hand! Great for fine motor control.',
    duration: 60, // seconds

    // State specific to this game
    initialState: {
        currentShape: null,
        shapeStartTime: null,
        shapesCompleted: 0,
        stepCount: 0, // Using as shapes completed for consistency
        feedback: 'Get ready to draw!',
        gameStartTime: null,
        drawingPath: [],
        shapeProgress: 0,
        perfectShapes: 0,
        currentHand: 'right', // Which hand to use
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
        const minVisibility = 0.5;
        if (leftWrist.visibility < minVisibility || rightWrist.visibility < minVisibility) {
            return { ...state, feedback: 'Make sure your hands are visible!', scoreDelta: 0 };
        }

        // Initialize game start time
        const currentTime = Date.now();
        const gameStartTime = state.gameStartTime || currentTime;

        // Define shapes to draw
        const shapes = [
            {
                name: 'Circle',
                description: 'Draw a circle clockwise',
                icon: '⭕',
                difficulty: 'medium',
                checkCompletion: (path) => checkCircle(path),
            },
            {
                name: 'Square',
                description: 'Draw a square',
                icon: '⬜',
                difficulty: 'hard',
                checkCompletion: (path) => checkSquare(path),
            },
            {
                name: 'Line Left-Right',
                description: 'Draw a horizontal line',
                icon: '➡️',
                difficulty: 'easy',
                checkCompletion: (path) => checkHorizontalLine(path),
            },
            {
                name: 'Line Up-Down',
                description: 'Draw a vertical line',
                icon: '⬇️',
                difficulty: 'easy',
                checkCompletion: (path) => checkVerticalLine(path),
            },
            {
                name: 'Triangle',
                description: 'Draw a triangle',
                icon: '🔺',
                difficulty: 'hard',
                checkCompletion: (path) => checkTriangle(path),
            },
            {
                name: 'Wave',
                description: 'Draw a wave pattern',
                icon: '〰️',
                difficulty: 'medium',
                checkCompletion: (path) => checkWave(path),
            },
        ];

        // Select or maintain current shape
        let currentShape = state.currentShape;
        let shapeStartTime = state.shapeStartTime;
        let currentHand = state.currentHand || 'right';

        if (!currentShape) {
            // Select random shape
            currentShape = shapes[Math.floor(Math.random() * shapes.length)];
            shapeStartTime = currentTime;
            // Alternate hands
            currentHand = currentHand === 'right' ? 'left' : 'right';
        }

        // Get current hand position
        const wrist = currentHand === 'right' ? rightWrist : leftWrist;
        const shoulder = currentHand === 'right' ? rightShoulder : leftShoulder;

        // Check if hand is raised (ready to draw)
        const isHandRaised = wrist.y < shoulder.y - 0.05;

        // Track drawing path
        let drawingPath = [...(state.drawingPath || [])];

        if (isHandRaised) {
            // Add current position to path
            drawingPath.push({
                x: wrist.x,
                y: wrist.y,
                time: currentTime,
            });

            // Keep only recent points (last 3 seconds)
            drawingPath = drawingPath.filter(point =>
                currentTime - point.time < 3000
            );
        } else {
            // Hand lowered, clear path
            if (drawingPath.length > 0) {
                drawingPath = [];
            }
        }

        // Check shape completion
        let shapeProgress = 0;
        if (drawingPath.length > 10) {
            const completion = currentShape.checkCompletion(drawingPath);
            shapeProgress = completion.progress;
        }

        let scoreIncrement = 0;
        let shapesCompleted = state.shapesCompleted || 0;
        let perfectShapes = state.perfectShapes || 0;
        let newFeedback = state.feedback;

        // Check if shape is completed
        if (shapeProgress >= 100 && !state.shapeCompleted) {
            // Shape completed!
            const timeToComplete = (currentTime - shapeStartTime) / 1000;
            shapesCompleted++;

            // Score based on speed and accuracy
            let points = 15;

            if (timeToComplete < 3 && shapeProgress >= 95) {
                points = 40;
                perfectShapes++;
                newFeedback = `⭐ Perfect ${currentShape.name}! +40`;
            } else if (timeToComplete < 5) {
                points = 30;
                newFeedback = `✨ Great ${currentShape.name}! +30`;
            } else if (timeToComplete < 8) {
                points = 20;
                newFeedback = `👍 Good ${currentShape.name}! +20`;
            } else {
                points = 15;
                newFeedback = `✓ ${currentShape.name} Complete! +15`;
            }

            scoreIncrement = points;

            // Select new shape
            currentShape = shapes[Math.floor(Math.random() * shapes.length)];
            shapeStartTime = currentTime;
            drawingPath = [];
            shapeProgress = 0;
            currentHand = currentHand === 'right' ? 'left' : 'right';
        } else {
            // Provide feedback on progress
            const handName = currentHand === 'right' ? 'Right' : 'Left';

            if (!isHandRaised) {
                newFeedback = `Raise your ${handName} hand to draw!`;
            } else if (drawingPath.length < 5) {
                newFeedback = `${currentShape.icon} Start drawing ${currentShape.name}...`;
            } else if (shapeProgress > 70) {
                newFeedback = `Almost done! ${Math.round(shapeProgress)}%`;
            } else if (shapeProgress > 40) {
                newFeedback = `Keep going! ${Math.round(shapeProgress)}%`;
            } else {
                newFeedback = `${currentShape.icon} ${currentShape.description}`;
            }
        }

        return {
            ...state,
            currentShape,
            shapeStartTime,
            shapesCompleted,
            stepCount: shapesCompleted, // For display consistency
            feedback: newFeedback,
            gameStartTime,
            drawingPath,
            shapeProgress,
            perfectShapes,
            currentHand,
            shapeCompleted: shapeProgress >= 100,
            wristPos: { x: wrist.x, y: wrist.y }, // For rendering
            isHandRaised, // For rendering
            scoreDelta: scoreIncrement,
        };
    },

    // Custom render data for the game UI
    getRenderData: (state) => {
        return {
            currentShape: state.currentShape,
            shapesCompleted: state.shapesCompleted || 0,
            shapeProgress: state.shapeProgress || 0,
            perfectShapes: state.perfectShapes || 0,
            drawingPath: state.drawingPath || [],
            currentHand: state.currentHand || 'right',
            wristPos: state.wristPos || { x: 0.5, y: 0.5 },
            isHandRaised: state.isHandRaised || false,
        };
    },
};

// Helper functions to check shape completion
function checkCircle(path) {
    if (path.length < 20) return { progress: 0 };

    // Calculate center of path
    const centerX = path.reduce((sum, p) => sum + p.x, 0) / path.length;
    const centerY = path.reduce((sum, p) => sum + p.y, 0) / path.length;

    // Calculate average radius
    const avgRadius = path.reduce((sum, p) => {
        return sum + Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    }, 0) / path.length;

    // Check if points are roughly equidistant from center
    const radiusVariance = path.reduce((sum, p) => {
        const radius = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
        return sum + Math.abs(radius - avgRadius);
    }, 0) / path.length;

    // Lower variance = better circle
    const progress = Math.max(0, 100 - (radiusVariance * 1000));
    return { progress: Math.min(progress, 100) };
}

function checkHorizontalLine(path) {
    if (path.length < 10) return { progress: 0 };

    const startX = path[0].x;
    const endX = path[path.length - 1].x;
    const distance = Math.abs(endX - startX);

    // Check if line is mostly horizontal
    const avgY = path.reduce((sum, p) => sum + p.y, 0) / path.length;
    const yVariance = path.reduce((sum, p) => sum + Math.abs(p.y - avgY), 0) / path.length;

    const progress = Math.min((distance * 500) - (yVariance * 1000), 100);
    return { progress: Math.max(0, progress) };
}

function checkVerticalLine(path) {
    if (path.length < 10) return { progress: 0 };

    const startY = path[0].y;
    const endY = path[path.length - 1].y;
    const distance = Math.abs(endY - startY);

    // Check if line is mostly vertical
    const avgX = path.reduce((sum, p) => sum + p.x, 0) / path.length;
    const xVariance = path.reduce((sum, p) => sum + Math.abs(p.x - avgX), 0) / path.length;

    const progress = Math.min((distance * 500) - (xVariance * 1000), 100);
    return { progress: Math.max(0, progress) };
}

function checkSquare(path) {
    if (path.length < 30) return { progress: 0 };

    // Simple approximation: check for 4 direction changes
    let directionChanges = 0;
    let lastDx = 0, lastDy = 0;

    for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;

        if (Math.abs(dx - lastDx) > 0.02 || Math.abs(dy - lastDy) > 0.02) {
            directionChanges++;
        }

        lastDx = dx;
        lastDy = dy;
    }

    const progress = Math.min((directionChanges / 4) * 100, 100);
    return { progress };
}

function checkTriangle(path) {
    if (path.length < 25) return { progress: 0 };

    // Simple approximation: check for 3 direction changes
    let directionChanges = 0;
    let lastDx = 0, lastDy = 0;

    for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;

        if (Math.abs(dx - lastDx) > 0.03 || Math.abs(dy - lastDy) > 0.03) {
            directionChanges++;
        }

        lastDx = dx;
        lastDy = dy;
    }

    const progress = Math.min((directionChanges / 3) * 100, 100);
    return { progress };
}

function checkWave(path) {
    if (path.length < 20) return { progress: 0 };

    // Check for alternating up/down movement
    let peaks = 0;
    let valleys = 0;

    for (let i = 1; i < path.length - 1; i++) {
        if (path[i].y < path[i - 1].y && path[i].y < path[i + 1].y) {
            peaks++;
        }
        if (path[i].y > path[i - 1].y && path[i].y > path[i + 1].y) {
            valleys++;
        }
    }

    const totalWaves = peaks + valleys;
    const progress = Math.min((totalWaves / 4) * 100, 100);
    return { progress };
}
