import { Pose } from '@mediapipe/pose';

class PoseService {
    constructor() {
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
    }

    onResults(callback) {
        this.pose.onResults(callback);
    }

    async send(image) {
        await this.pose.send({ image });
    }

    close() {
        this.pose.close();
    }
}

export const poseService = new PoseService();
