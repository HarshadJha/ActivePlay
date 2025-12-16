import { Pose } from '@mediapipe/pose';

class PoseService {
  constructor() {
    this.pose = null;
    this.resultsRef = { current: null };
    this.targetFps = 30; // default to 30 FPS for smoother gameplay
    this._lastSend = 0;
    this._initialized = false;
    this._closed = false;
  }

  init() {
    if (this._initialized) return;
    this.pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.pose.onResults((res) => {
      this.resultsRef.current = res;
    });

    this._initialized = true;
    this._closed = false;
  }

  onResults(callback) {
    if (!this._initialized) this.init();
    // Wrap user callback while still maintaining resultsRef
    this.pose.onResults((res) => {
      this.resultsRef.current = res;
      callback && callback(res);
    });
  }

  async send(image) {
    if (!this._initialized || this._closed) return;
    const now = performance.now();
    const minInterval = 1000 / this.targetFps;
    if (now - this._lastSend < minInterval) return;
    this._lastSend = now;
    await this.pose.send({ image });
  }

  getResultsRef() {
    if (!this._initialized) this.init();
    return this.resultsRef;
  }

  setTargetFps(fps) {
    this.targetFps = Math.max(8, Math.min(60, fps));
  }

  close() {
    if (this.pose) this.pose.close();
    this._closed = true;
    this._initialized = false;
    this.resultsRef.current = null;
    this._lastSend = 0;
  }
}

export const poseService = new PoseService();
