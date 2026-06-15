import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
    TrendingUp, Target, Clock, Zap, AlertCircle,
    Plus, Eye, ChevronRight, ShieldCheck, Calendar as CalendarIconLucide,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import CreateGoalModal from '../components/modals/CreateGoalModal';
import PredictionReportModal from '../components/modals/PredictionReportModal';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon size={20} />
            </div>
            <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : 'var(--text-muted)',
            }}>
                {trend > 0 ? '+' : ''}{trend}%
            </span>
        </div>
        <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{value}</h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { goals, milestones, user, isCreateGoalOpen, setIsCreateGoalOpen } = useStore();
    const [selectedGoalForReport, setSelectedGoalForReport] = useState(null);
    const [isPredictionOpen, setIsPredictionOpen] = useState(false);

    const activeGoals = goals.filter((g) => !g.archived);
    const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;
    const inProgressCount = milestones.filter((m) => m.status === 'In Progress').length;
    const overdueMilestones = milestones.filter((m) => m.status !== 'Completed' && new Date(m.dueDate) < new Date());
    const overdueCount = overdueMilestones.length;

    const chartData = [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 600 },
        { name: 'Thu', value: 800 },
        { name: 'Fri', value: 500 },
        { name: 'Sat', value: 900 },
        { name: 'Sun', value: 1000 },
    ];

    const handleViewPrediction = (goal) => {
        setSelectedGoalForReport(goal);
        setIsPredictionOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}
        >
            {/* Welcome Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                        Welcome back, {user.name.split(' ')[0]}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                        Manage and track your high-impact objectives.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateGoalOpen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '14px',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px var(--primary-glow)',
                        transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <Plus size={18} /> Create Goal
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <StatCard icon={Target} label="Total Goals" value={activeGoals.length} trend={0} color="#3b82f6" />
                <StatCard icon={ShieldCheck} label="Completed" value={completedMilestones} trend={0} color="#10b981" />
                <StatCard icon={TrendingUp} label="In Progress" value={inProgressCount} trend={0} color="var(--primary)" />
                <StatCard icon={AlertCircle} label="Overdue" value={overdueCount} trend={0} color="#ef4444" />
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                {/* Goals Grid */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        {activeGoals.slice(0, 4).map((goal, i) => {
                            const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
                            const completedCount = goalMilestones.filter((m) => m.status === 'Completed').length;
                            const progress = goalMilestones.length > 0 ? Math.round((completedCount / goalMilestones.length) * 100) : 0;

                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="card"
                                    style={{ padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    onClick={() => handleViewPrediction(goal)}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        {(() => {
                                            const cat = useStore.getState().categories.find(c => c.name === goal.category);
                                            const catColor = cat ? cat.color : 'var(--primary)';
                                            return (
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    background: `${catColor}15`,
                                                    color: catColor,
                                                    fontSize: '10px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                }}>
                                                    {goal.category}
                                                </span>
                                            );
                                        })()}
                                        {goal.priority && (
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                color: goal.priority === 'High' ? '#ef4444' : goal.priority === 'Critical' ? '#dc2626' : 'var(--text-muted)',
                                            }}>
                                                {goal.priority}
                                            </span>
                                        )}
                                    </div>
                                    <h4 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', lineHeight: 1.3 }}>{goal.name}</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '20px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {goal.description || 'No description provided'}
                                    </p>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--accent)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600 }}>
                                                <CalendarIconLucide size={12} />
                                                {new Date(goal.targetDate).toLocaleDateString()}
                                            </div>
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>View →</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {activeGoals.length === 0 && (
                        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
                            <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>No goals yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Start by creating your first goal.</p>
                            <button
                                onClick={() => setIsCreateGoalOpen(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                            >
                                <Plus size={16} /> Create First Goal
                            </button>
                        </div>
                    )}

                    {/* Predictive Insights */}
                    {activeGoals.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                                borderRadius: '20px',
                                padding: '32px',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', maxWidth: '340px' }}>Strategy & Execution</h2>
                                <p style={{ opacity: 0.8, fontSize: '13px', marginBottom: '24px', maxWidth: '420px', fontWeight: 500, lineHeight: 1.6 }}>
                                    You have {overdueCount} overdue milestone{overdueCount !== 1 ? 's' : ''} across {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}. {overdueCount === 0 ? 'Great progress — you\'re on track!' : 'Consider prioritizing completion.'}
                                </p>
                                <button
                                    onClick={() => handleViewPrediction(activeGoals[0])}
                                    style={{
                                        background: 'white',
                                        color: 'var(--primary)',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontWeight: 800,
                                        fontSize: '13px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'transform 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <Eye size={16} /> View Forecast
                                </button>
                            </div>
                            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.08 }}>
                                <TrendingUp size={240} strokeWidth={1} />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Milestone Status */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Milestone Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Completed', count: completedMilestones, color: '#10b981' },
                                { label: 'In Progress', count: inProgressCount, color: 'var(--primary)' },
                                { label: 'Pending', count: milestones.filter((m) => m.status === 'Pending').length, color: '#94a3b8' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: `2px solid ${item.color}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '13px',
                                        color: item.color,
                                    }}>
                                        {item.count}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</p>
                                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            {item.label === 'Completed' ? 'Great progress' : item.label === 'In Progress' ? 'Currently active' : 'Not started'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', height: '100px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Goals */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Recent Goals
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeGoals.slice(0, 3).map((goal) => {
                                const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
                                const progress = goalMilestones.length > 0 ? Math.round((goalMilestones.filter((m) => m.status === 'Completed').length / goalMilestones.length) * 100) : 0;
                                return (
                                    <div
                                        key={goal.id}
                                        onClick={() => handleViewPrediction(goal)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            background: 'var(--accent)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '4px',
                                                height: '24px',
                                                borderRadius: '2px',
                                                background: progress >= 66 ? '#10b981' : progress >= 33 ? '#f59e0b' : '#ef4444',
                                            }} />
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.name}</p>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{progress}% Complete</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alerts */}
                    {(overdueCount > 0 || inProgressCount > 0) && (
                        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Zap size={16} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Alerts</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {overdueCount > 0 && (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <AlertCircle size={14} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 700 }}>Overdue Alert</p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{overdueCount} milestone{overdueCount !== 1 ? 's' : ''} past due.</p>
                                        </div>
                                    </div>
                                )}
                                {inProgressCount > 0 && (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Clock size={14} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 700 }}>On Track</p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{inProgressCount} milestone{inProgressCount !== 1 ? 's' : ''} in progress.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isPredictionOpen && selectedGoalForReport && (
                <PredictionReportModal
                    isOpen={isPredictionOpen}
                    onClose={() => setIsPredictionOpen(false)}
                    goal={selectedGoalForReport}
                    milestones={milestones.filter((m) => m.goalId === selectedGoalForReport.id)}
                />
            )}
        </motion.div>
    );
};

export default Dashboard;
