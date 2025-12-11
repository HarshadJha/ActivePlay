import React from 'react';

/**
 * GameRenderer - Renders game-specific visual elements on top of the camera feed
 * Each game can provide render data via getRenderData() method
 */
const GameRenderer = ({ gameConfig, gameState }) => {
    if (!gameConfig || !gameConfig.getRenderData) {
        return null; // Game doesn't have custom rendering
    }

    const renderData = gameConfig.getRenderData(gameState);
    const gameId = gameConfig.id;

    // Convert normalized coordinates (0-1) to pixel coordinates
    const toPixelX = (x) => `${x * 100}%`;
    const toPixelY = (y) => `${y * 100}%`;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Side Lean Balance - Ball and Coins */}
            {gameId === 'side_lean_balance' && (
                <>
                    {/* Ball */}
                    <div
                        className="absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                        style={{
                            left: toPixelX(renderData.ballX),
                            top: toPixelY(renderData.ballY),
                        }}
                    >
                        <div className="absolute inset-2 bg-white/30 rounded-full"></div>
                    </div>

                    {/* Coins */}
                    {renderData.coins?.map((coin) => (
                        <div
                            key={coin.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{
                                left: toPixelX(coin.x),
                                top: toPixelY(coin.y),
                                width: `${coin.radius * 200}%`,
                                height: `${coin.radius * 200}%`,
                            }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-xl flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    ))}

                    {/* Lean Indicator */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 px-4 py-2 rounded-full">
                        <div className={`w-3 h-3 rounded-full ${renderData.leanDirection === -1 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                        <span className="text-white font-bold">LEFT</span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-100"
                                style={{
                                    width: `${Math.abs(renderData.leanDirection) * renderData.leanStrength * 100}%`,
                                    marginLeft: renderData.leanDirection === 1 ? '50%' : '0',
                                    marginRight: renderData.leanDirection === -1 ? '50%' : '0',
                                }}
                            ></div>
                        </div>
                        <span className="text-white font-bold">RIGHT</span>
                        <div className={`w-3 h-3 rounded-full ${renderData.leanDirection === 1 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    </div>
                </>
            )}

            {/* Overhead Reach Bubbles */}
            {gameId === 'overhead_reach_bubbles' && (
                <>
                    {/* Bubbles */}
                    {renderData.bubbles?.map((bubble) => {
                        const colors = [
                            'from-pink-400 to-pink-600',
                            'from-purple-400 to-purple-600',
                            'from-blue-400 to-blue-600',
                            'from-green-400 to-green-600',
                            'from-yellow-400 to-yellow-600',
                        ];
                        return (
                            <div
                                key={bubble.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                                style={{
                                    left: toPixelX(bubble.x),
                                    top: toPixelY(bubble.y),
                                    width: `${bubble.radius * 200}%`,
                                    height: `${bubble.radius * 200}%`,
                                    animationDuration: '2s',
                                }}
                            >
                                <div className={`w-full h-full bg-gradient-to-br ${colors[bubble.color]} rounded-full shadow-2xl opacity-80`}>
                                    <div className="absolute inset-2 bg-white/40 rounded-full"></div>
                                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/60 rounded-full"></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Hand Indicators */}
                    <div
                        className="absolute w-12 h-12 border-4 border-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.leftWristPos.x),
                            top: toPixelY(renderData.leftWristPos.y),
                        }}
                    ></div>
                    <div
                        className="absolute w-12 h-12 border-4 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.rightWristPos.x),
                            top: toPixelY(renderData.rightWristPos.y),
                        }}
                    ></div>

                    {/* Combo Display */}
                    {renderData.combo > 1 && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full shadow-xl">
                            <span className="text-white font-bold text-2xl">COMBO x{renderData.combo}!</span>
                        </div>
                    )}
                </>
            )}

            {/* Reaction Time Challenge */}
            {gameId === 'reaction_time_challenge' && (
                <>
                    {/* Current Target */}
                    {renderData.currentTarget && (
                        <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-ping"
                            style={{
                                left: toPixelX(renderData.currentTarget.x),
                                top: toPixelY(renderData.currentTarget.y),
                                width: `${renderData.currentTarget.radius * 200}%`,
                                height: `${renderData.currentTarget.radius * 200}%`,
                            }}
                        >
                            {renderData.currentTarget.shape === 0 && (
                                <div className="w-full h-full bg-red-500 rounded-full shadow-2xl flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">TAP!</span>
                                </div>
                            )}
                            {renderData.currentTarget.shape === 1 && (
                                <div className="w-full h-full bg-orange-500 shadow-2xl flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">TAP!</span>
                                </div>
                            )}
                            {renderData.currentTarget.shape === 2 && (
                                <div className="w-full h-full bg-yellow-500 shadow-2xl flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
                                    <span className="text-white font-bold text-xl">TAP!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hand Indicators */}
                    <div
                        className="absolute w-10 h-10 border-4 border-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.leftWristPos.x),
                            top: toPixelY(renderData.leftWristPos.y),
                        }}
                    ></div>
                    <div
                        className="absolute w-10 h-10 border-4 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.rightWristPos.x),
                            top: toPixelY(renderData.rightWristPos.y),
                        }}
                    ></div>

                    {/* Stats Display */}
                    {renderData.bestReactionTime && (
                        <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg">
                            <p className="text-white text-sm">Best: {renderData.bestReactionTime}ms</p>
                            <p className="text-white text-sm">Avg: {Math.round(renderData.averageReactionTime)}ms</p>
                        </div>
                    )}
                </>
            )}

            {/* Virtual Drums */}
            {gameId === 'virtual_drums' && (
                <>
                    {/* Drum Pads */}
                    {renderData.drumPads?.map((pad) => {
                        const colors = [
                            'from-red-500 to-red-700',
                            'from-blue-500 to-blue-700',
                            'from-green-500 to-green-700',
                            'from-yellow-500 to-yellow-700',
                            'from-purple-500 to-purple-700',
                        ];
                        const isHighlighted = renderData.beatSequence?.[renderData.currentBeatIndex] === pad.id;

                        return (
                            <div
                                key={pad.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isHighlighted ? 'scale-110' : ''}`}
                                style={{
                                    left: toPixelX(pad.x),
                                    top: toPixelY(pad.y),
                                    width: `${pad.radius * 200}%`,
                                    height: `${pad.radius * 200}%`,
                                }}
                            >
                                <div className={`w-full h-full bg-gradient-to-br ${colors[pad.color]} rounded-full shadow-2xl flex flex-col items-center justify-center ${isHighlighted ? 'ring-4 ring-white' : ''}`}>
                                    <span className="text-white font-bold text-sm">{pad.label}</span>
                                    <span className="text-white/70 text-xs">{renderData.hitsPerPad?.[pad.id] || 0}</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Hit Animations */}
                    {renderData.hitAnimations?.map((anim) => (
                        <div
                            key={anim.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-ping"
                            style={{
                                left: toPixelX(anim.x),
                                top: toPixelY(anim.y),
                            }}
                        >
                            <div className="w-24 h-24 border-4 border-white rounded-full"></div>
                        </div>
                    ))}

                    {/* Hand Indicators */}
                    <div
                        className="absolute w-8 h-8 bg-green-400/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.leftWristPos.x),
                            top: toPixelY(renderData.leftWristPos.y),
                        }}
                    ></div>
                    <div
                        className="absolute w-8 h-8 bg-blue-400/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: toPixelX(renderData.rightWristPos.x),
                            top: toPixelY(renderData.rightWristPos.y),
                        }}
                    ></div>

                    {/* Sequence Display */}
                    {renderData.beatSequence?.length > 0 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-3 rounded-full">
                            <p className="text-white font-bold">
                                Sequence: {renderData.sequenceScore}/{renderData.beatSequence.length}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Step-In-Box */}
            {gameId === 'step_in_box' && (
                <>
                    {/* Direction Boxes */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-64 h-64">
                            {/* UP */}
                            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${renderData.currentDirection === 'UP' ? 'bg-green-500 text-white scale-110' : 'bg-gray-700/50 text-gray-400'} ${renderData.userDirection === 'UP' ? 'ring-4 ring-blue-400' : ''}`}>
                                ⬆️
                            </div>
                            {/* DOWN */}
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${renderData.currentDirection === 'DOWN' ? 'bg-green-500 text-white scale-110' : 'bg-gray-700/50 text-gray-400'} ${renderData.userDirection === 'DOWN' ? 'ring-4 ring-blue-400' : ''}`}>
                                ⬇️
                            </div>
                            {/* LEFT */}
                            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${renderData.currentDirection === 'LEFT' ? 'bg-green-500 text-white scale-110' : 'bg-gray-700/50 text-gray-400'} ${renderData.userDirection === 'LEFT' ? 'ring-4 ring-blue-400' : ''}`}>
                                ⬅️
                            </div>
                            {/* RIGHT */}
                            <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${renderData.currentDirection === 'RIGHT' ? 'bg-green-500 text-white scale-110' : 'bg-gray-700/50 text-gray-400'} ${renderData.userDirection === 'RIGHT' ? 'ring-4 ring-blue-400' : ''}`}>
                                ➡️
                            </div>
                            {/* CENTER */}
                            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${renderData.userDirection === 'CENTER' ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-500'}`}>
                                ⭕
                            </div>
                        </div>
                    </div>

                    {/* Streak Display */}
                    {renderData.streak > 1 && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-full shadow-xl">
                            <span className="text-white font-bold text-2xl">🔥 STREAK x{renderData.streak}!</span>
                        </div>
                    )}
                </>
            )}

            {/* Pose Match */}
            {gameId === 'pose_match' && (
                <>
                    {/* Current Pose Display */}
                    {renderData.currentPose && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-8 py-4 rounded-2xl text-center">
                            <p className="text-6xl mb-2">{renderData.currentPose.icon}</p>
                            <p className="text-white font-bold text-2xl">{renderData.currentPose.name}</p>
                            <p className="text-white/70 text-sm">{renderData.currentPose.description}</p>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 bg-gray-700 h-8 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                            style={{ width: `${renderData.matchProgress}%` }}
                        ></div>
                        <p className="absolute inset-0 flex items-center justify-center text-white font-bold">
                            {Math.round(renderData.matchProgress)}%
                        </p>
                    </div>

                    {/* Perfect Matches Counter */}
                    {renderData.perfectMatches > 0 && (
                        <div className="absolute top-4 right-4 bg-yellow-500 px-4 py-2 rounded-lg">
                            <p className="text-white font-bold">⭐ Perfect: {renderData.perfectMatches}</p>
                        </div>
                    )}
                </>
            )}

            {/* Air Drawing */}
            {gameId === 'air_drawing' && (
                <>
                    {/* Current Shape Display */}
                    {renderData.currentShape && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-8 py-4 rounded-2xl text-center">
                            <p className="text-6xl mb-2">{renderData.currentShape.icon}</p>
                            <p className="text-white font-bold text-2xl">{renderData.currentShape.name}</p>
                            <p className="text-white/70 text-sm">Use {renderData.currentHand} hand</p>
                        </div>
                    )}

                    {/* Drawing Path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {renderData.drawingPath?.length > 1 && (
                            <polyline
                                points={renderData.drawingPath.map(p => `${p.x * 100}%,${p.y * 100}%`).join(' ')}
                                fill="none"
                                stroke="#00ff00"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>

                    {/* Hand Indicator */}
                    {renderData.isHandRaised && (
                        <div
                            className="absolute w-12 h-12 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{
                                left: toPixelX(renderData.wristPos.x),
                                top: toPixelY(renderData.wristPos.y),
                            }}
                        >
                            <span className="absolute inset-0 flex items-center justify-center text-white font-bold">✏️</span>
                        </div>
                    )}

                    {/* Progress Display */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-3 rounded-full">
                        <p className="text-white font-bold">Progress: {Math.round(renderData.shapeProgress)}%</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default GameRenderer;
