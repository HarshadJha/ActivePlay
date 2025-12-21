import React, { useEffect, useRef } from 'react';

// High-FPS visual layer that reads from renderDataRef.current via RAF
// and updates DOM transforms / canvas without triggering React re-renders

const GameRenderer = ({ gameId, renderDataRef }) => {
  const containerRef = useRef(null);
  const overlayCanvasRef = useRef(null); // Reserved for future canvas-based games
  const rafRef = useRef(null);
  const poolsRef = useRef({});

  useEffect(() => {
    function ensurePool(name, count) {
      const pools = poolsRef.current;
      if (!pools[name]) pools[name] = [];
      const pool = pools[name];
      const container = containerRef.current;
      while (pool.length < count) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.willChange = 'transform';
        container.appendChild(el);
        pool.push(el);
      }
      while (pool.length > count) {
        const el = pool.pop();
        el.remove();
      }
      return pool;
    }

    function draw() {
      const data = renderDataRef.current || {};
      const container = containerRef.current;
      if (!container) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Side Lean Balance (ball + coins)
      if (gameId === 'side_lean_balance') {
        const coins = Array.isArray(data.coins) ? data.coins : [];
        const pool = ensurePool('coins', coins.length + 1);
        // Ball at index 0
        const ball = pool[0];
        ball.style.width = '40px';
        ball.style.height = '40px';
        ball.style.borderRadius = '50%';
        ball.style.background = '#2dd4bf';
        const cx = (data.ballX || 0.5) * container.clientWidth;
        const cy = (data.ballY || 0.5) * container.clientHeight;
        ball.style.transform = `translate3d(${cx - 20}px, ${cy - 20}px, 0)`;

        // Coins start at index 1
        for (let i = 0; i < coins.length; i++) {
          const coin = pool[i + 1];
          coin.style.width = '24px';
          coin.style.height = '24px';
          coin.style.borderRadius = '50%';
          coin.style.background = '#f59e0b';
          const x = coins[i].x * container.clientWidth;
          const y = coins[i].y * container.clientHeight;
          coin.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
        }
      }

      // Overhead Reach Bubbles
      if (gameId === 'overhead_reach_bubbles') {
        const bubbles = Array.isArray(data.bubbles) ? data.bubbles : [];
        const pool = ensurePool('bubbles', bubbles.length);
        for (let i = 0; i < bubbles.length; i++) {
          const el = pool[i];
          const size = (bubbles[i].radius || 0.06) * container.clientWidth * 2;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.borderRadius = '50%';
          el.style.background = 'rgba(59,130,246,0.4)';
          const x = bubbles[i].x * container.clientWidth;
          const y = bubbles[i].y * container.clientHeight;
          el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
        }
      }

      // Virtual Drums: pads static, hits via pool elements
      if (gameId === 'virtual_drums') {
        const pads = Array.isArray(data.drumPads) ? data.drumPads : [];
        const pool = ensurePool('pads', pads.length);
        for (let i = 0; i < pads.length; i++) {
          const el = pool[i];
          const size = pads[i].radius * container.clientWidth * 2;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.borderRadius = '50%';
          el.style.background = 'rgba(34,197,94,0.4)';
          const x = pads[i].x * container.clientWidth;
          const y = pads[i].y * container.clientHeight;
          el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
        }
      }

      // Reaction Time Challenge
      if (gameId === 'reaction_time_challenge') {
        const target = data.currentTarget;
        const pool = ensurePool('targets', target ? 1 : 0);

        if (target) {
          const el = pool[0];
          const size = (target.radius || 0.08) * container.clientWidth * 2;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.border = '4px solid white';
          el.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)';

          // Shape handling
          if (target.shape === 1) {
            el.style.borderRadius = '10%'; // Square
            el.style.clipPath = 'none';
          } else if (target.shape === 2) {
            // Star
            el.style.borderRadius = '0';
            el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
          } else {
            el.style.borderRadius = '50%'; // Circle
            el.style.clipPath = 'none';
          }

          // Color based on type
          if (target.type === 'distractor') {
            el.style.borderColor = '#ef4444'; // Red
            el.style.background = 'rgba(239, 68, 68, 0.6)';
          } else {
            el.style.borderColor = '#ffffff';
            el.style.background = 'rgba(34, 197, 94, 0.6)'; // Green
          }

          const x = target.x * container.clientWidth;
          const y = target.y * container.clientHeight;
          el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const pools = poolsRef.current;
      Object.keys(pools).forEach((k) => pools[k].forEach((el) => el.remove()));
      poolsRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
  );
};

export default GameRenderer;
