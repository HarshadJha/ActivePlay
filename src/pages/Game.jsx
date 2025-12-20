import React, { useEffect, useState, useRef } from 'react';
import Camera from '../components/game/Camera';
import GameRenderer from '../components/game/GameRenderer';
import Calibration from '../components/game/Calibration';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useGameEngine } from '../hooks/useGameEngine';
import { happySteps } from '../games/happySteps';
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

    // Set higher FPS for smoother gameplay
    const { videoRef, resultsRef, start, stop, setFps } = usePoseDetection();
    const [calibrated, setCalibrated] = useState(false);
    useEffect(() => { setFps(15); }, [setFps]);

    const {
        gameState,
        score,
        timeLeft,
        feedback,
        startGame,
        renderDataRef,
    } = useGameEngine(gameConfig || happySteps, resultsRef, (finalScore) => {
        console.log("Game Over! Score:", finalScore);
    });

    const gestureRafRef = useRef(null);
    useEffect(() => {
        if (!calibrated || gameState !== 'intro') {
            if (gestureRafRef.current) {
                cancelAnimationFrame(gestureRafRef.current);
                gestureRafRef.current = null;
            }
            return;
        }
        const loop = () => {
            const res = resultsRef.current;
            if (res && res.poseLandmarks) {
                const lm = res.poseLandmarks;
                const lw = lm[15]; // LEFT_WRIST
                const rw = lm[16]; // RIGHT_WRIST
                const ls = lm[11]; // LEFT_SHOULDER
                const rs = lm[12]; // RIGHT_SHOULDER
                const visOk = [lw, rw, ls, rs].every(p => (p?.visibility ?? 0) > 0.5);
                const handsUp = visOk && lw.y < ls.y && rw.y < rs.y;
                if (handsUp) {
                    startGame();
                    cancelAnimationFrame(gestureRafRef.current);
                    gestureRafRef.current = null;
                    return;
                }
            }
            gestureRafRef.current = requestAnimationFrame(loop);
        };
        gestureRafRef.current = requestAnimationFrame(loop);
        return () => {
            if (gestureRafRef.current) {
                cancelAnimationFrame(gestureRafRef.current);
                gestureRafRef.current = null;
            }
        };
    }, [calibrated, gameState, startGame, resultsRef]);

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
                            {Math.ceil(timeLeft)}s
                        </p>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <Camera videoRef={videoRef} resultsRef={resultsRef} start={start} stop={stop} />
                <GameRenderer gameId={gameConfig?.id} renderDataRef={renderDataRef} />
                {!calibrated && (
                    <Calibration
                        resultsRef={resultsRef}
                        onComplete={() => setCalibrated(true)}
                        calibrationType={gameConfig?.calibrationType}
                    />
                )}

                {/* Overlays */}
                {calibrated && gameState === 'intro' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm z-10">
                        <h1 className="text-5xl font-bold mb-4">Ready to Move?</h1>
                        <p className="text-xl mb-8 max-w-md">{gameConfig?.instructions}</p>
                        <button
                            onClick={startGame}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-3xl font-bold flex items-center space-x-3 transition-transform hover:scale-105"
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
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
                        <p className="text-2xl font-bold text-white animate-bounce">{feedback}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Game;
