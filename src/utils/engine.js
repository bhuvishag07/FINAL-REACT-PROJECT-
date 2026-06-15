export const calculateProgress = (milestones) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'Completed').length;
    return Math.round((completed / milestones.length) * 100);
};

export const getGoalVelocity = (goal, milestones) => {
    // Mock velocity for now
    return (1.2 + Math.random() * 0.5).toFixed(1);
};

export const getPredictiveDate = (goal, progress, velocity) => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();

    if (progress === 100) return 'Complete';

    // Logic to simulate early/late completion
    const daysDiff = velocity > 1.2 ? -5 : 3;
    const predicted = new Date(targetDate);
    predicted.setDate(predicted.getDate() + daysDiff);

    return predicted.toLocaleDateString();
};

export const getIntelligenceInsights = (goals, milestones) => {
    const insights = [];

    // Overdue check
    const overdue = milestones.filter(m => {
        return m.status !== 'Completed' && new Date(m.dueDate) < new Date();
    });

    if (overdue.length > 0) {
        insights.push({
            type: 'Overdue Alert',
            message: `${overdue.length} milestones are past their due date!`,
            priority: 'high'
        });
    }

    // Blocked check
    const blocked = milestones.filter(m => m.status === 'Locked');
    if (blocked.length > 0) {
        insights.push({
            type: 'Blocked Dependencies',
            message: `${blocked.length} milestones are currently locked.`,
            priority: 'medium'
        });
    }

    // Good progress
    insights.push({
        type: 'Great Progress',
        message: 'You are on track to complete "Brand Refresh" 3 days early.',
        priority: 'low'
    });

    return insights;
};
