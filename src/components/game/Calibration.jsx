import React, { useEffect, useRef } from 'react';

const Calibration = ({ resultsRef, onComplete }) => {
  const textRef = useRef(null);
  const btnRef = useRef(null);
  const passedRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    function loop() {
      const res = resultsRef.current;
      let ok = false;
      if (res && res.poseLandmarks) {
        const lm = res.poseLandmarks;
        const ls = lm[11];
        const rs = lm[12];
        const lh = lm[23];
        const rh = lm[24];
        const visOk = [ls, rs, lh, rh].every(p => (p?.visibility ?? 0) > 0.5);
        const centerX = (ls.x + rs.x) * 0.5;
        const centered = centerX > 0.35 && centerX < 0.65;
        ok = visOk && centered;
      }
      passedRef.current = ok;
      if (textRef.current) {
        textRef.current.textContent = ok ? 'Calibration passed. You are centered and visible.' : 'Please stand where camera can see you and center yourself.';
      }
      if (btnRef.current) {
        btnRef.current.disabled = !ok;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resultsRef]);

  function handleContinue() {
    if (passedRef.current && onComplete) onComplete();
  }

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-8 z-20">
      <h1 className="text-4xl font-extrabold mb-4">Calibration</h1>
      <p ref={textRef} className="text-lg mb-6" />
      <button
        ref={btnRef}
        onClick={handleContinue}
        className="px-6 py-3 rounded-full bg-blue-600 disabled:bg-gray-500 text-white text-xl font-bold"
      >
        Continue
      </button>
    </div>
  );
};

export default Calibration;
