import { useEffect, useRef, useCallback } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { poseService } from '../services/poseService';

export const usePoseDetection = () => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const resultsRef = poseService.getResultsRef();
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    if (!videoRef.current) return;

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        await poseService.send(videoRef.current);
      },
      width: 1280,
      height: 720,
    });

    startedRef.current = true;
    cameraRef.current.start().catch((err) => {
      console.error("Camera start failed", err);
      startedRef.current = false;
    });
  }, []);

  const stop = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    startedRef.current = false;
  }, []);

  const setFps = useCallback((fps) => {
    poseService.setTargetFps(fps);
  }, []);

  useEffect(() => {
    poseService.init();
    return () => {
      stop();
      poseService.close();
    };
  }, [stop]);

  return { videoRef, resultsRef, start, stop, setFps };
};
