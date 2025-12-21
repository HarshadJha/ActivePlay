import { useEffect, useRef, useCallback } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { poseService } from '../services/poseService';

export const usePoseDetection = (quality = 'high') => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const resultsRef = poseService.getResultsRef();
  const startedRef = useRef(false);

  // Resolution mapping for different quality levels
  const resolutionMap = {
    high: { width: 1280, height: 720 },
    medium: { width: 640, height: 480 },
    low: { width: 480, height: 360 } // Much faster for ML processing
  };

  const { width, height } = resolutionMap[quality] || resolutionMap.high;

  const start = useCallback(() => {
    if (startedRef.current) return;
    if (!videoRef.current) return;

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        await poseService.send(videoRef.current);
      },
      width: width,   // Use dynamic width
      height: height, // Use dynamic height
    });

    startedRef.current = true;
    cameraRef.current.start().catch((err) => {
      console.error("Camera start failed", err);
      startedRef.current = false;
    });
  }, [width, height]); // Re-create camera if resolution changes

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
