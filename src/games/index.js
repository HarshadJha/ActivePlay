import { happySteps } from './happySteps';
import { squats } from './squats';
import { reachHold } from './reachHold';
import { sideLeanBalance } from './sideLeanBalance';
import { overheadReachBubbles } from './overheadReachBubbles';
import { reactionTimeChallenge } from './reactionTimeChallenge';
import { virtualDrums } from './virtualDrums';
import { stepInBox } from './stepInBox';
import { poseMatch } from './poseMatch';
import { airDrawing } from './airDrawing';

export const games = {
    [happySteps.id]: happySteps,
    [squats.id]: squats,
    [reachHold.id]: reachHold,
    [sideLeanBalance.id]: sideLeanBalance,
    [overheadReachBubbles.id]: overheadReachBubbles,
    [reactionTimeChallenge.id]: reactionTimeChallenge,
    [virtualDrums.id]: virtualDrums,
    [stepInBox.id]: stepInBox,
    [poseMatch.id]: poseMatch,
    [airDrawing.id]: airDrawing,
};

export const gameList = Object.values(games);
