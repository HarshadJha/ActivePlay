import React, { useEffect, useRef } from 'react';

import { CALIBRATION_CONFIG, checkCalibration, CALIBRATION_TYPES } from '../../utils/calibrationUtils';

const Calibration = ({ resultsRef, onComplete, calibrationType = CALIBRATION_TYPES.FULL_BODY }) => {
  const textRef = useRef(null);
  const btnRef = useRef(null);
  const passedRef = useRef(false);
  const rafRef = useRef(null);

  // Get config for UI content
  const config = CALIBRATION_CONFIG[calibrationType] || CALIBRATION_CONFIG[CALIBRATION_TYPES.FULL_BODY];

  useEffect(() => {
    let calibrationFrames = 0;
    const REQUIRED_FRAMES = 15; // Reduced from 30 for faster calibration (~0.5s)

    function loop() {
      const res = resultsRef.current;
      let status = { ok: false, message: 'Waiting for camera...' };

      if (res && res.poseLandmarks) {
        status = checkCalibration(res.poseLandmarks, calibrationType);
      }

      if (status.ok) {
        calibrationFrames++;
      } else {
        calibrationFrames = 0;
      }

      const isStable = calibrationFrames >= REQUIRED_FRAMES;
      passedRef.current = isStable;

      if (textRef.current) {
        textRef.current.textContent = isStable
          ? 'Perfect! You are ready.'
          : status.message;

        // Visual feedback color
        textRef.current.className = `text-lg mb-6 font-medium ${status.ok ? 'text-green-400' : 'text-white'}`;
      }

      if (btnRef.current) {
        btnRef.current.disabled = !isStable;
        // Pulse effect on button when ready
        if (isStable) {
          btnRef.current.classList.add('animate-pulse', 'ring-4', 'ring-green-500/50');
        } else {
          btnRef.current.classList.remove('animate-pulse', 'ring-4', 'ring-green-500/50');
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resultsRef, calibrationType]);

  function handleContinue() {
    if (passedRef.current && onComplete) onComplete();
  }

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-8 z-20">
      <h1 className="text-4xl font-extrabold mb-2">{config.title}</h1>
      <p className="text-sm text-blue-300 mb-4">{config.instructions}</p>
      <p ref={textRef} className="text-lg mb-6" />
      <button
        ref={btnRef}
        onClick={handleContinue}
        className="px-6 py-3 rounded-full bg-blue-600 disabled:bg-gray-500 text-white text-xl font-bold transition-all"
      >
        Continue
      </button>
    </div>
  );
};

export default Calibration;
