import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Calendar, Zap, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PredictionReportModal = ({ isOpen, onClose, goal, milestones }) => {
    if (!isOpen || !goal) return null;

    // Calculate prediction data
    const goalMilestones = milestones.filter(m => m.goalId === goal.id);
    const completed = goalMilestones.filter(m => m.status === 'Completed').length;
    const inProgress = goalMilestones.filter(m => m.status === 'In Progress').length;
    const pending = goalMilestones.filter(m => m.status === 'Pending').length;

    const currentProgress = goalMilestones.length > 0 ? Math.round((completed / goalMilestones.length) * 100) : 0;
    const velocity = ((completed + inProgress * 0.5) / goalMilestones.length) * 100 || 0;

    // Days calculations
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const daysAheadBehind = velocity > currentProgress ? -Math.abs(daysRemaining) : daysRemaining;

    // Health score (0-100)
    const healthScore = Math.min(100, Math.round((velocity + (goalMilestones.length > 0 ? (completed / goalMilestones.length) * 50 : 0))));

    // Forecast data
    const forecastData = [
        { week: 'W1', progress: currentProgress },
        { week: 'W2', progress: Math.min(100, currentProgress + 15) },
        { week: 'W3', progress: Math.min(100, currentProgress + 30) },
        { week: 'W4', progress: Math.min(100, currentProgress + 45) },
        { week: 'W5', progress: Math.min(100, currentProgress + 60) },
        { week: 'W6', progress: Math.min(100, currentProgress + 80) },
        { week: 'W7', progress: Math.min(100, currentProgress + 100) },
    ];

    const completionDate = new Date(targetDate);
    if (velocity > 0) {
        const weeksToCompletion = ((100 - currentProgress) / (velocity / 7));
        completionDate.setDate(today.getDate() + (weeksToCompletion * 7));
    }

    const getHealthColor = () => {
        if (healthScore >= 75) return 'text-emerald-500';
        if (healthScore >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    const getHealthBg = () => {
        if (healthScore >= 75) return 'bg-emerald-500/10';
        if (healthScore >= 50) return 'bg-amber-500/10';
        return 'bg-red-500/10';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-4xl bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] shadow-2xl my-6"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Forecast Report: {goal.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Health Score */}
                    <div className={`p-6 rounded-2xl border border-[var(--border)] ${getHealthBg()}`}>
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Goal Health Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-black ${getHealthColor()}`}>{healthScore}</span>
                            <span className="text-[var(--text-muted)] font-bold">/100</span>
                        </div>
                    </div>

                    {/* Estimated Completion */}
                    <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--accent)]">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Estimated Completion</p>
                        <p className="text-lg font-black">{completionDate.toLocaleDateString()}</p>
                        <p className="text-xs text-[var(--text-muted)] font-bold mt-2">{Math.max(0, daysRemaining)} days remaining</p>
                    </div>

                    {/* Velocity Analysis */}
                    <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--accent)]">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Current Velocity</p>
                        <p className="text-lg font-black text-[var(--primary)]">{velocity.toFixed(1)}%</p>
                        <p className="text-xs text-[var(--text-muted)] font-bold mt-2">per week</p>
                    </div>

                    {/* Days Ahead/Behind */}
                    <div className={`p-6 rounded-2xl border border-[var(--border)] ${daysAheadBehind < 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Status</p>
                        <p className={`text-lg font-black ${daysAheadBehind < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {Math.abs(daysAheadBehind)} days {daysAheadBehind < 0 ? 'ahead' : 'behind'}
                        </p>
                    </div>
                </div>

                {/* Progress Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Milestone Status</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-emerald-500">Completed</span>
                                <span className="font-black text-lg">{completed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[var(--primary)]">In Progress</span>
                                <span className="font-black text-lg">{inProgress}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-400">Pending</span>
                                <span className="font-black text-lg">{pending}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Target Info</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Target Date</p>
                                <p className="font-black text-sm mt-1">{targetDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Category</p>
                                <p className="font-black text-sm mt-1">{goal.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Current Progress</p>
                        <div className="space-y-4">
                            <div className="relative h-32 flex items-center justify-center">
                                <div className="relative w-20 h-20">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="35"
                                            stroke="var(--accent)"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="35"
                                            stroke="var(--primary)"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 35}`}
                                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - currentProgress / 100)}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-black text-xl">{currentProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Forecast Chart */}
                <div className="card p-6 mb-6">
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[var(--primary)]" />
                        Completion Forecast (7-Week Projection)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData}>
                                <defs>
                                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="week" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="progress" stroke="var(--primary)" fill="url(#colorProgress)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights */}
                <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl p-6 flex gap-4">
                    <AlertCircle size={24} className="text-[var(--primary)] flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black mb-2">Performance Insights</h4>
                        <p className="text-sm text-[var(--text-muted)] font-medium">
                            {daysAheadBehind < 0
                                ? `Great progress! Based on milestone completion rates, you're projected to finish ${Math.ceil(Math.abs(daysAheadBehind))} days early.`
                                : `You're currently behind schedule. Consider increasing milestone velocity or adjusting the target date.`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-2xl font-black text-sm border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                    >
                        Close Report
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PredictionReportModal;
