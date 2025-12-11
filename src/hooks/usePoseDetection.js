import { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { poseService } from '../services/poseService';

export const usePoseDetection = () => {
    const videoRef = useRef(null);
    const [results, setResults] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        console.log("Initializing usePoseDetection");
        const onResults = (res) => {
            setResults(res);
        };

        poseService.onResults(onResults);

        if (videoRef.current) {
            console.log("Video ref found, setting up Camera");
            try {
                cameraRef.current = new Camera(videoRef.current, {
                    onFrame: async () => {
                        await poseService.send(videoRef.current);
                    },
                    width: 1280,
                    height: 720,
                });

                cameraRef.current.start()
                    .then(() => console.log("Camera started successfully"))
                    .catch(err => console.error("Error starting camera:", err));
            } catch (error) {
                console.error("Error initializing Camera utility:", error);
            }
        } else {
            console.warn("Video ref is null during initialization");
        }

        return () => {
            if (cameraRef.current) {
                console.log("Stopping camera");
                cameraRef.current.stop();
            }
        };
    }, []);

    return { videoRef, results };
};
