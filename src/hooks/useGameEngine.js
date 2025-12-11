import { useState, useEffect, useRef, useCallback } from 'react';

export const useGameEngine = (gameLogic, onGameOver) => {
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameLogic.duration);
    const [feedback, setFeedback] = useState(gameLogic.initialState.feedback);
    const [internalGameState, setInternalGameState] = useState(gameLogic.initialState);

    // Internal game state (not always needed for render)
    const internalState = useRef(gameLogic.initialState);
    const timerRef = useRef(null);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(gameLogic.duration);
        internalState.current = gameLogic.initialState;
        setInternalGameState(gameLogic.initialState);
        setFeedback('Go!');

        // Start Timer
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = useCallback(() => {
        clearInterval(timerRef.current);
        setGameState('finished');
        if (onGameOver) onGameOver(score);
    }, [score, onGameOver]);

    // Process a frame (called by the Camera component or usePoseDetection)
    const processFrame = useCallback((landmarks) => {
        if (gameState !== 'playing') return;

        const result = gameLogic.update(landmarks, internalState.current);

        // Update internal state
        internalState.current = result;
        setInternalGameState(result);

        // Update UI state if changed
        if (result.scoreDelta > 0) {
            setScore(s => s + result.scoreDelta);
        }
        if (result.feedback !== feedback) {
            setFeedback(result.feedback);
        }
    }, [gameState, gameLogic, feedback]);

    // Cleanup
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    return {
        gameState,
        score,
        timeLeft,
        feedback,
        internalGameState, // Expose for rendering
        startGame,
        processFrame
    };
};
