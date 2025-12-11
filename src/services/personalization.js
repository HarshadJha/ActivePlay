export const GAMES = {
    HAPPY_STEPS: {
        id: 'happy_steps',
        title: 'Happy Steps',
        description: 'March in place and raise your arms! Great for cardio and coordination.',
        difficulty: 'Active',
        tags: ['cardio', 'coordination'],
    },
    SQUATS: {
        id: 'squats',
        title: 'Squat Master',
        description: 'Stand and squat. Builds leg strength.',
        difficulty: 'Active',
        tags: ['strength', 'legs'],
    },
    REACH_HOLD: {
        id: 'reach_hold',
        title: 'Reach & Hold',
        description: 'Gently reach for targets and hold your balance.',
        difficulty: 'All',
        tags: ['balance', 'flexibility'],
    },
};

export const getRecommendedGames = (profile) => {
    const recommendations = [];

    // Basic filtering based on mobility
    if (profile.mobilityStatus === 'seated') {
        // recommendations.push(GAMES.SQUATS); // Squats might be too hard for seated? 
        // Let's keep it if they can do sit-to-stand.
        recommendations.push(GAMES.REACH_HOLD);
    } else if (profile.mobilityStatus === 'assisted') {
        recommendations.push(GAMES.SQUATS);
        recommendations.push(GAMES.REACH_HOLD);
        recommendations.push(GAMES.HAPPY_STEPS); // Maybe modified version
    } else {
        // Active
        recommendations.push(GAMES.HAPPY_STEPS);
        recommendations.push(GAMES.SQUATS);
        recommendations.push(GAMES.REACH_HOLD);
    }

    // Goal-based boosting (could sort or highlight, for now just simple list)
    // In a real engine, we might score games based on goals.

    return recommendations;
};
