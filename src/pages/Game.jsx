import React, { useEffect } from 'react';
import Camera from '../components/game/Camera';
import GameRenderer from '../components/game/GameRenderer';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useGameEngine } from '../hooks/useGameEngine';
import { happySteps } from '../games/happySteps'; // Keep for fallback, or better, remove and handle null safely
import { Play, RotateCcw } from 'lucide-react';

import { useParams, useNavigate } from 'react-router-dom';
import { games } from '../games';

const Game = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameConfig = games[gameId];

    // Redirect if game not found
    useEffect(() => {
        if (!gameConfig) {
            navigate('/dashboard');
        }
    }, [gameConfig, navigate]);

    // We need access to results here to pass to the game engine
    // But Camera component handles usePoseDetection internally.
    // We should lift usePoseDetection up or expose a callback from Camera.
    // For simplicity, let's use usePoseDetection here and pass videoRef/results to Camera (or just results).
    // Actually, Camera is designed to be self-contained for display.
    // Let's modify Camera to accept an onFrame callback or expose results via context/callback.

    // Better approach: Game page manages the "Brain" (usePoseDetection + useGameEngine), 
    // and Camera is just the "Eyes" (Display).

    const { videoRef, results } = usePoseDetection();

    const {
        gameState,
        score,
        timeLeft,
        feedback,
        internalGameState,
        startGame,
        processFrame
    } = useGameEngine(gameConfig || happySteps, (finalScore) => { // Fallback to happySteps to prevent crash before redirect
        console.log("Game Over! Score:", finalScore);
    });

    useEffect(() => {
        if (results && results.poseLandmarks) {
            processFrame(results.poseLandmarks);
        }
    }, [results, processFrame]);

    return (
        <div className="relative w-full max-w-6xl mx-auto p-4 flex flex-col items-center">

            {/* Header / HUD */}
            <div className="w-full flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{gameConfig?.name}</h2>
                    <p className="text-gray-500 text-sm">{gameConfig?.instructions}</p>
                </div>
                <div className="flex space-x-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 uppercase font-bold">Score</p>
                        <p className="text-4xl font-black text-blue-600">{score}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 uppercase font-bold">Time</p>
                        <p className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500' : 'text-gray-800'}`}>
                            {timeLeft}s
                        </p>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                {/* We need to pass videoRef to Camera or modify Camera to accept it. 
            Let's modify Camera to take props. */}
                <CameraExternalControl videoRef={videoRef} results={results} />

                {/* Game-specific visual elements (bubbles, drums, targets, etc.) */}
                {gameState === 'playing' && (
                    <GameRenderer gameConfig={gameConfig} gameState={internalGameState} />
                )}

                {/* Overlays */}
                {gameState === 'intro' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm z-10">
                        <h1 className="text-5xl font-bold mb-4">Ready to Move?</h1>
                        <p className="text-xl mb-8 max-w-md">{gameConfig?.instructions}</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-2xl font-bold flex items-center space-x-2 transition-transform hover:scale-105"
                        >
                            <Play className="w-8 h-8" />
                            <span>Start Game</span>
                        </button>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm z-10">
                        <h1 className="text-5xl font-bold mb-2">Game Over!</h1>
                        <p className="text-2xl mb-6">Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-xl font-bold flex items-center space-x-2 transition-transform hover:scale-105"
                        >
                            <RotateCcw className="w-6 h-6" />
                            <span>Play Again</span>
                        </button>
                    </div>
                )}

                {/* Feedback Overlay (In-Game) */}
                {gameState === 'playing' && feedback && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full backdrop-blur-md z-20">
                        <p className="text-2xl font-bold text-white animate-bounce">{feedback}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Modified Camera component that accepts refs/results from parent
// We'll define it here for now or update the original file. 
// Let's update the original file to be flexible.
// For this step, I'll inline a wrapper or just import the original and modify it in next step.
// Actually, I can't pass refs to the existing Camera component easily if it creates its own.
// I will modify the existing Camera component to be "dumb" if props are provided.

import { useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

const CameraExternalControl = ({ videoRef, results }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!results || !canvasRef.current || !videoRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        const { width, height } = canvasRef.current;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, width, height);

        // Mirror horizontally
        canvasCtx.translate(width, 0);
        canvasCtx.scale(-1, 1);

        // Draw video frame (mirrored)
        canvasCtx.drawImage(results.image, 0, 0, width, height);

        // Draw skeleton (mirrored)
        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4,
            });
            drawLandmarks(canvasCtx, results.poseLandmarks, {
                color: '#FF0000',
                lineWidth: 2,
            });
        }
        canvasCtx.restore();
    }, [results, videoRef]);

    return (
        <>
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover opacity-0"
                playsInline
            />
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute top-0 left-0 w-full h-full object-contain"
            />
            {!results && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-0">
                    <p className="text-xl animate-pulse">Initializing Camera & AI...</p>
                </div>
            )}
        </>
    );
};

export default Game;
