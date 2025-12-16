import { useState, useEffect, useRef, useCallback } from 'react';
import { smoothLandmarks } from '../utils/poseUtils';

export const useGameEngine = (gameLogic, resultsRef, onGameOver) => {
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameLogic.duration);
  const [feedback, setFeedback] = useState(gameLogic.initialState.feedback);

  // Refs to hold latest state for the game loop (avoids stale closures)
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const gameLogicRef = useRef(gameLogic);
  const onGameOverRef = useRef(onGameOver);
  const feedbackRef = useRef(feedback);

  const internalStateRef = useRef(gameLogic.initialState);
  const prevSmoothedRef = useRef(null);
  const renderDataRef = useRef({});
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);
  const lastUiUpdateRef = useRef(0);
  const loopRef = useRef(null);

  const UI_UPDATE_INTERVAL_MS = 33; // ~30 FPS for smoother UI updates

  // Sync refs with state/props
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameLogicRef.current = gameLogic;
  }, [gameLogic]);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    gameStateRef.current = 'intro';
    scoreRef.current = 0;
    internalStateRef.current = gameLogic.initialState;
    renderDataRef.current = {};
    prevSmoothedRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    requestAnimationFrame(() => {
      setGameState('intro');
      setScore(0);
      setTimeLeft(gameLogic.duration);
      setFeedback(gameLogic.initialState.feedback);
    });
  }, [gameLogic.id, gameLogic.duration, gameLogic.initialState]);


  const endGame = useCallback(() => {
    setGameState('finished');
    gameStateRef.current = 'finished'; // Update ref immediately
    if (onGameOverRef.current) onGameOverRef.current(scoreRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    loopRef.current = (now) => {
      if (gameStateRef.current !== 'playing') {
        rafRef.current = null;
        return;
      }

      if (!lastTickRef.current) lastTickRef.current = now;
      lastTickRef.current = now;

      const res = resultsRef.current;
      const landmarks = res && res.poseLandmarks ? res.poseLandmarks : null;
      const smoothed = smoothLandmarks(prevSmoothedRef.current, landmarks, 0.6);
      prevSmoothedRef.current = smoothed || prevSmoothedRef.current;

      const currentGameLogic = gameLogicRef.current;
      const nextState = currentGameLogic.update(smoothed, internalStateRef.current);
      internalStateRef.current = nextState;

      if (typeof currentGameLogic.getRenderData === 'function') {
        renderDataRef.current = currentGameLogic.getRenderData(nextState);
      }

      const uiNow = now;
      if (uiNow - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
        const timeSinceLastUpdate = (uiNow - lastUiUpdateRef.current) / 1000;
        lastUiUpdateRef.current = uiNow;

        if (nextState.scoreDelta && nextState.scoreDelta > 0) {
          setScore(s => s + nextState.scoreDelta);
        }

        if (nextState.feedback && nextState.feedback !== feedbackRef.current) {
          setFeedback(nextState.feedback);
        }

        setTimeLeft(t => {
          const newTime = Math.max(0, t - timeSinceLastUpdate);
          if (newTime <= 0) {
            endGame();
          }
          return newTime;
        });
      }

      rafRef.current = requestAnimationFrame(loopRef.current);
    };
  }, [resultsRef, endGame, UI_UPDATE_INTERVAL_MS]);

  const startGame = useCallback(() => {
    setGameState('playing');
    gameStateRef.current = 'playing'; // FORCE SYNC to avoid race condition with loop

    setScore(0);
    scoreRef.current = 0;

    setTimeLeft(gameLogicRef.current.duration);
    internalStateRef.current = gameLogicRef.current.initialState;
    setFeedback('Go!');

    lastTickRef.current = null;
    lastUiUpdateRef.current = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, []);

  // Use Effect to clean up
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    gameState,
    score,
    timeLeft,
    feedback,
    startGame,
    renderDataRef,
  };
};
