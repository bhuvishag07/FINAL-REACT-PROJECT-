import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    PieChart,
    Download,
    CheckCircle2,
    Target,
    Activity,
    Clock,
    Printer,
    Zap,
    Award,
    AlertCircle
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

const StatusBadge = ({ status }) => {
    const colors = {
        'Completed': 'bg-emerald-500/10 text-emerald-500',
        'In Progress': 'bg-blue-500/10 text-blue-500',
        'Pending': 'bg-amber-500/10 text-amber-500',
        'Overdue': 'bg-red-500/10 text-red-500',
    };
    return (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${colors[status] || colors.Pending}`}>
            {status}
        </span>
    );
};

const Reports = () => {
    const goals = useStore(state => state.goals);
    const milestones = useStore(state => state.milestones);
    const categories = useStore(state => state.categories);
    const user = useStore(state => state.user);

    // ──────────────────────────────────────────────────────────────
    // 1. DATA CALCULATIONS
    // ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const today = new Date();
        const activeGoals = goals.filter(g => !g.archived);
        const totalGoals = activeGoals.length;
        const completedGoalsCount = activeGoals.filter(g => g.progress >= 100).length;
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
        const pendingMilestones = milestones.filter(m => m.status === 'Pending' || m.status === 'In Progress').length;
        const overdueMilestones = milestones.filter(m => m.status !== 'Completed' && m.dueDate && isBefore(parseISO(m.dueDate), today)).length;
        const upcomingMilestones = milestones.filter(m => m.status !== 'Completed' && m.dueDate && isAfter(parseISO(m.dueDate), today)).length;

        const overallCompletion = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
        const activeCategories = categories.filter(cat => goals.some(g => g.category === cat.name)).length;

        return {
            totalGoals,
            completedGoalsCount,
            totalMilestones,
            completedMilestones,
            pendingMilestones,
            overdueMilestones,
            upcomingMilestones,
            overallCompletion,
            activeCategories,
        };
    }, [goals, milestones, categories]);

    const categoryPerformance = useMemo(() => {
        return categories
            .map(cat => {
                const catGoals = goals.filter(g => g.category === cat.name && !g.archived);
                if (catGoals.length === 0) return null;
                const avgProgress = Math.round(catGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / catGoals.length);
                return { ...cat, avgProgress, goalCount: catGoals.length };
            })
            .filter(Boolean);
    }, [goals, categories]);

    const productivityInsights = useMemo(() => {
        if (goals.length === 0) return [];
        const insights = [];
        const topCat = [...categoryPerformance].sort((a, b) => b.avgProgress - a.avgProgress)[0];
        if (topCat) insights.push({ label: 'Top Performing Area', value: topCat.name, icon: Award, color: topCat.color });
        const focusGoal = [...goals].filter(g => !g.archived).sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
        if (focusGoal) insights.push({ label: 'Lead Objective', value: focusGoal.name, icon: Target, color: 'var(--primary)' });
        const attentionGoal = [...goals].filter(g => !g.archived && g.progress < 30).sort((a, b) => (a.progress || 0) - (b.progress || 0))[0];
        if (attentionGoal) insights.push({ label: 'Requires Attention', value: attentionGoal.name, icon: AlertCircle, color: '#ef4444' });
        return insights;
    }, [goals, categoryPerformance]);

    // ──────────────────────────────────────────────────────────────
    // 2. HANDLERS
    // ──────────────────────────────────────────────────────────────
    const handleDownloadJSON = () => {
        const report = {
            user: user.name,
            generatedAt: new Date().toISOString(),
            summary: stats,
            goals: goals.map(g => ({ name: g.name, progress: g.progress, category: g.category })),
            milestones: milestones.map(m => ({ name: m.name, status: m.status, priority: m.priority })),
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Milestone_Hub_Report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen pb-20 print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 print:hidden">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight">Performance Reports</h1>
                    <p className="text-[var(--text-muted)] font-medium max-w-xl">
                        Comprehensive summary of your progress, goals, and execution metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadJSON}
                        className="flex items-center gap-2 px-5 py-3 border border-[var(--border)] rounded-2xl text-sm font-black text-[var(--text-muted)] hover:bg-[var(--accent)] transition-all"
                    >
                        <Download size={18} /> Export JSON
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] rounded-2xl text-sm font-black text-white hover:scale-105 transition-all shadow-lg"
                    >
                        <Printer size={18} /> Print Report
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                {/* 1. Executive Summary */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Executive Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Goals', value: stats.totalGoals, icon: Target, color: 'var(--primary)' },
                            { label: 'Avg Completion', value: `${stats.overallCompletion}%`, icon: TrendingUp, color: '#10b981' },
                            { label: 'Milestones Done', value: stats.completedMilestones, icon: CheckCircle2, color: '#6366f1' },
                            { label: 'Active Domains', value: stats.activeCategories, icon: PieChart, color: '#f59e0b' },
                        ].map((item, i) => (
                            <div key={i} className="card p-6 flex flex-col items-center text-center gap-3">
                                <div className="p-3 rounded-2xl bg-opacity-10" style={{ background: item.color, color: item.color }}>
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">{item.value}</h3>
                                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mt-1">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Goal Progress Overview */}
                    <div className="lg:col-span-8 card p-0 overflow-hidden">
                        <div className="px-8 py-6 border-b border-[var(--border)]">
                            <h3 className="text-sm font-black uppercase tracking-widest">Goal Progress Overview</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--accent)] text-[9px] font-black uppercase text-[var(--text-muted)]">
                                    <tr>
                                        <th className="px-8 py-4">Goal Name</th>
                                        <th className="px-8 py-4">Progress</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Target Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {goals.filter(g => !g.archived).map(goal => (
                                        <tr key={goal.id} className="text-sm hover:bg-[var(--accent)]">
                                            <td className="px-8 py-5 font-bold">{goal.name}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--primary)]" style={{ width: `${goal.progress}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-[var(--primary)]">{goal.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <StatusBadge status={goal.progress >= 100 ? 'Completed' : goal.progress > 0 ? 'In Progress' : 'Pending'} />
                                            </td>
                                            <td className="px-8 py-5 text-right text-xs text-[var(--text-muted)]">{goal.targetDate || 'TBD'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Category Performance */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category Performance</h3>
                        <div className="grid gap-4">
                            {categoryPerformance.map(cat => (
                                <div key={cat.id} className="card p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.icon}</span>
                                            <h4 className="text-sm font-black">{cat.name}</h4>
                                        </div>
                                        <p className="text-sm font-black" style={{ color: cat.color }}>{cat.avgProgress}%</p>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--accent)] rounded-full overflow-hidden">
                                        <div className="h-full" style={{ width: `${cat.avgProgress}%`, backgroundColor: cat.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 4. Milestone Statistics */}
                    <div className="card p-8">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8">Milestone Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-[var(--accent)] rounded-2xl text-center">
                                <p className="text-3xl font-black text-emerald-500">{stats.completedMilestones}</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mt-1">Completed</p>
                            </div>
                            <div className="p-6 bg-[var(--accent)] rounded-2xl text-center">
                                <p className="text-3xl font-black text-blue-500">{stats.pendingMilestones}</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mt-1">Active</p>
                            </div>
                            <div className="p-6 bg-[var(--accent)] rounded-2xl text-center">
                                <p className="text-3xl font-black text-red-500">{stats.overdueMilestones}</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mt-1">Overdue</p>
                            </div>
                            <div className="p-6 bg-[var(--accent)] rounded-2xl text-center">
                                <p className="text-3xl font-black text-amber-500">{stats.upcomingMilestones}</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mt-1">Upcoming</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Upcoming Deadlines */}
                    <div className="card p-8">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8">Upcoming Deadlines</h3>
                        <div className="space-y-4">
                            {milestones.filter(m => m.status !== 'Completed' && m.dueDate).sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate)).slice(0, 5).map(m => (
                                <div key={m.id} className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex flex-col items-center justify-center font-black">
                                            <span className="text-[8px] text-[var(--primary)] uppercase">{format(parseISO(m.dueDate), 'MMM')}</span>
                                            <span className="text-base">{format(parseISO(m.dueDate), 'dd')}</span>
                                        </div>
                                        <p className="text-sm font-bold truncate max-w-[150px]">{m.name}</p>
                                    </div>
                                    <StatusBadge status={isBefore(parseISO(m.dueDate), new Date()) ? 'Overdue' : 'Pending'} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. Productivity Insights */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Productivity Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {productivityInsights.map((insight, idx) => (
                            <div key={idx} className="card p-6 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-opacity-10" style={{ background: insight.color, color: insight.color }}>
                                    <insight.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">{insight.label}</p>
                                    <h4 className="text-sm font-black">{insight.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Reports;
