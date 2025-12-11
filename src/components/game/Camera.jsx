import React, { useEffect, useRef } from 'react';
import { usePoseDetection } from '../../hooks/usePoseDetection';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

const Camera = () => {
    const { videoRef, results } = usePoseDetection();
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
        <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover opacity-0" // Hide video, show canvas
                playsInline
            />
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute top-0 left-0 w-full h-full object-contain"
            />
            {!results && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p className="text-xl animate-pulse">Initializing Camera & AI...</p>
                </div>
            )}
        </div>
    );
};

export default Camera;
