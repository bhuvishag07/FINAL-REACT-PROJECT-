import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import {
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, Download, BarChart2, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    format, subDays, subMonths, startOfMonth, endOfMonth,
    parseISO, isSameDay, isAfter, isBefore
} from 'date-fns';

/* ─────────────────────────────────────────────────
   Safe helpers – never throw, always return fallback
───────────────────────────────────────────────── */
const safeParseISO = (str) => {
    try {
        if (!str) return null;
        const d = parseISO(str);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
};

const safeFormat = (str, fmt, fallback = '—') => {
    try {
        const d = safeParseISO(str);
        return d ? format(d, fmt) : fallback;
    } catch {
        return fallback;
    }
};

/* ─────────────────────────────────────────────────
   Empty-state placeholder component
───────────────────────────────────────────────── */
const EmptyChart = ({ label = 'No data available' }) => (
    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
        <BarChart2 size={32} />
        <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
);

/* ─────────────────────────────────────────────────
   Analytics page
───────────────────────────────────────────────── */
const Analytics = () => {
    const [pageError, setPageError] = useState(null);

    // Pull raw data from store with safe defaults
    const rawGoals = useStore(s => s.goals ?? []);
    const rawMilestones = useStore(s => s.milestones ?? []);
    const rawCategories = useStore(s => s.categories ?? []);
    const searchQuery = useStore(s => s.searchQuery ?? '');

    // Stable today reference: memo with no deps so it is computed once per mount
    const today = useMemo(() => new Date(), []);

    // ── Search / filter ──
    const { goals, milestones, categories } = useMemo(() => {
        try {
            const safeGoals = Array.isArray(rawGoals) ? rawGoals : [];
            const safeMilestones = Array.isArray(rawMilestones) ? rawMilestones : [];
            const safeCategories = Array.isArray(rawCategories) ? rawCategories : [];

            if (!searchQuery) return { goals: safeGoals, milestones: safeMilestones, categories: safeCategories };

            const q = searchQuery.toLowerCase();
            const filteredGoals = safeGoals.filter(g =>
                (g.name ?? '').toLowerCase().includes(q) ||
                (g.description ?? '').toLowerCase().includes(q) ||
                (g.category ?? '').toLowerCase().includes(q)
            );
            const goalIds = new Set(filteredGoals.map(g => g.id));
            const filteredMilestones = safeMilestones.filter(m =>
                (m.name ?? '').toLowerCase().includes(q) ||
                (m.description ?? '').toLowerCase().includes(q) ||
                goalIds.has(m.goalId)
            );
            return { goals: filteredGoals, milestones: filteredMilestones, categories: safeCategories };
        } catch {
            return { goals: [], milestones: [], categories: [] };
        }
    }, [rawGoals, rawMilestones, rawCategories, searchQuery]);

    // ── Core metrics ──
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (g.progress ?? 0) >= 100).length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
    const milestoneCompletionRate = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    // ── Upcoming deadlines (safe) ──
    const upcomingDeadlines = useMemo(() => {
        try {
            return milestones
                .filter(m => {
                    if (m.status === 'Completed' || !m.dueDate) return false;
                    const d = safeParseISO(m.dueDate);
                    return d && isAfter(d, today);
                })
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5);
        } catch {
            return [];
        }
    }, [milestones, today]);

    // ── Overdue items (safe) ──
    const overdueItems = useMemo(() => {
        try {
            return milestones.filter(m => {
                if (m.status === 'Completed' || !m.dueDate) return false;
                const d = safeParseISO(m.dueDate);
                return d && isBefore(d, today);
            });
        } catch {
            return [];
        }
    }, [milestones, today]);

    // ── Weekly chart data ──
    const weeklyData = useMemo(() => {
        try {
            return Array.from({ length: 7 }).map((_, idx) => {
                const date = subDays(today, 6 - idx);
                const count = milestones.filter(m => {
                    if (m.status !== 'Completed' || !m.dueDate) return false;
                    const d = safeParseISO(m.dueDate);
                    return d && isSameDay(d, date);
                }).length;
                return { name: format(date, 'EEE'), count };
            });
        } catch {
            return [];
        }
    }, [milestones, today]);

    // ── Monthly trend data ──
    const monthlyData = useMemo(() => {
        try {
            return Array.from({ length: 6 }).map((_, idx) => {
                const mDate = subMonths(today, 5 - idx);
                const count = milestones.filter(m => {
                    if (m.status !== 'Completed' || !m.dueDate) return false;
                    const d = safeParseISO(m.dueDate);
                    return d && d >= startOfMonth(mDate) && d <= endOfMonth(mDate);
                }).length;
                return { name: format(mDate, 'MMM'), count };
            });
        } catch {
            return [];
        }
    }, [milestones, today]);

    // ── Forecast ──
    const forecast = useMemo(() => {
        try {
            const cutoff = subDays(today, 30);
            const last30 = milestones.filter(m => {
                if (m.status !== 'Completed' || !m.dueDate) return false;
                const d = safeParseISO(m.dueDate);
                return d && isAfter(d, cutoff);
            }).length;
            const velocity = last30 / 30;
            const remaining = Math.max(0, totalMilestones - completedMilestones);
            const daysToFinish = velocity > 0 ? Math.ceil(remaining / velocity) : null;
            return { velocity: velocity.toFixed(2), daysToFinish };
        } catch {
            return { velocity: '0.00', daysToFinish: null };
        }
    }, [milestones, totalMilestones, completedMilestones, today]);

    // ── Health score ──
    const healthScore = useMemo(() => {
        try {
            if (!totalGoals) return 0;
            const avgProgress = goals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / totalGoals;
            const overduePenalty = overdueItems.length * 5;
            return Math.max(0, Math.min(100, Math.round(avgProgress - overduePenalty)));
        } catch {
            return 0;
        }
    }, [goals, totalGoals, overdueItems]);

    // ── Category pie chart data ──
    const categoryBreakdown = useMemo(() => {
        try {
            return categories
                .map(cat => ({
                    name: cat.name ?? 'Unnamed',
                    value: goals.filter(g => g.category === cat.name && !g.archived).length,
                    color: cat.color ?? '#8b5cf6'
                }))
                .filter(c => c.value > 0);
        } catch {
            return [];
        }
    }, [categories, goals]);

    // ── Export handler ──
    const handleExport = useCallback(() => {
        try {
            const report = {
                healthScore,
                goalCompletionRate,
                milestoneCompletionRate,
                overdueCount: overdueItems.length,
                velocity: forecast.velocity,
                exportDate: new Date().toISOString(),
                categoryBreakdown,
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `milestone-hub-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            // silently fail – never crash the page
        }
    }, [healthScore, goalCompletionRate, milestoneCompletionRate, overdueItems.length, forecast.velocity, categoryBreakdown]);

    // ── Render error fallback ──
    if (pageError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <AlertTriangle size={48} className="text-red-500 opacity-70" />
                <h2 className="text-2xl font-black">Analytics encountered an error</h2>
                <p className="text-sm text-[var(--text-muted)] max-w-md">{pageError}</p>
                <button
                    onClick={() => setPageError(null)}
                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ── Tooltip style ──
    const tooltipStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        fontWeight: 700,
        color: 'var(--text-main)',
        fontSize: '12px',
    };

    return (
        <div className="min-h-screen pb-20 space-y-12">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
                        <Activity size={12} /> System Analytics
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Mission Control</h1>
                    <p className="text-[var(--text-muted)] font-medium max-w-xl">
                        A real-time overview of your productivity trends, completion velocities, and strategic health.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] rounded-xl text-xs font-black text-[var(--text-main)] hover:bg-[var(--border)] transition-all"
                    >
                        <Download size={14} /> Export Report
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Global Health</p>
                            <p className="text-2xl font-black text-[var(--primary)]">{healthScore}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)]">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── No-data state ── */}
            {totalGoals === 0 && (
                <div className="card p-12 flex flex-col items-center justify-center gap-4 text-center">
                    <BarChart2 size={48} className="opacity-20" />
                    <h3 className="text-xl font-black">No Goals Yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm">
                        Create your first goal to start seeing analytics and insights here.
                    </p>
                </div>
            )}

            {/* ── Quick Metrics Grid ── */}
            {totalGoals > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Goal Velocity', value: `${goalCompletionRate}%`, sub: `${completedGoals} missions completed`, color: 'var(--primary)' },
                            { label: 'Milestone Execution', value: `${milestoneCompletionRate}%`, sub: `${completedMilestones} tasks finished`, color: '#10b981' },
                            { label: 'Overdue Impact', value: overdueItems.length, sub: 'Requires immediate action', color: '#ef4444' },
                            { label: 'Avg Strategy Focus', value: Math.round(healthScore * 0.8), sub: 'Overall system health', color: '#f59e0b' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="card p-6 group hover:border-[var(--primary)] transition-all"
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">{stat.label}</p>
                                <h2 className="text-4xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</h2>
                                <p className="text-xs font-bold text-[var(--text-muted)]">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Main Data View ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Weekly Volume Chart */}
                        <div className="xl:col-span-2 card p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)]">
                                    <BarChart2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">Weekly Execution Volume</h3>
                                    <p className="text-xs font-bold text-[var(--text-muted)]">Milestones completed per day (by due date)</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                {weeklyData.every(d => d.count === 0) ? (
                                    <EmptyChart label="No completions this week" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weeklyData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                                            />
                                            <YAxis hide allowDecimals={false} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="var(--primary)"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorCount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Forecast & Category */}
                        <div className="space-y-8">
                            <div className="card p-8 space-y-6">
                                <h3 className="text-lg font-black">Strategic Forecast</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[var(--accent)] border border-[var(--border)]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Average Velocity</p>
                                        <p className="text-2xl font-black">
                                            {forecast.velocity}
                                            <span className="text-xs text-[var(--text-muted)] ml-1">tasks/day</span>
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-[var(--accent)] border border-[var(--border)]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Estimated Completion</p>
                                        <p className="text-2xl font-black">
                                            {forecast.daysToFinish != null ? `${forecast.daysToFinish} Days` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                    Based on your last 30 days of activity. Maintain this pace to reach your next milestone cluster.
                                </p>
                            </div>

                            <div className="card p-8">
                                <h3 className="text-lg font-black mb-6">Category Allocation</h3>
                                <div className="h-[200px] w-full">
                                    {categoryBreakdown.length === 0 ? (
                                        <EmptyChart label="No category data" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    isAnimationActive={false}
                                                >
                                                    {categoryBreakdown.map((entry, idx) => (
                                                        <Cell key={`cell-${idx}`} fill={entry.color ?? '#8b5cf6'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {categoryBreakdown.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] truncate">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Deadlines & Growth ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                        {/* Upcoming Deadlines */}
                        <div className="card p-8">
                            <h3 className="text-lg font-black mb-6">High Priority Deadlines</h3>
                            <div className="space-y-4">
                                {upcomingDeadlines.length === 0 ? (
                                    <div className="p-6 rounded-2xl bg-[var(--accent)] border border-dashed border-[var(--border)] text-center">
                                        <p className="text-sm font-bold text-[var(--text-muted)]">No upcoming deadlines — great job!</p>
                                    </div>
                                ) : upcomingDeadlines.map((m, i) => (
                                    <div key={m.id ?? i} className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-[9px] font-black text-red-500 uppercase leading-tight">{safeFormat(m.dueDate, 'MMM')}</span>
                                                <span className="text-sm font-black">{safeFormat(m.dueDate, 'dd')}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black line-clamp-1">{m.name}</p>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)]">{m.priority ?? 'Medium'} Priority</p>
                                            </div>
                                        </div>
                                        <div className="text-right pl-2">
                                            <p className="text-[10px] font-black uppercase text-[var(--primary)]">Target</p>
                                            <p className="text-xs font-black">{m.dueDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Growth Trend */}
                        <div className="card p-8">
                            <h3 className="text-lg font-black mb-6">Strategic Growth Trend</h3>
                            <div className="h-[250px] w-full">
                                {monthlyData.every(d => d.count === 0) ? (
                                    <EmptyChart label="No monthly data yet" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                                            />
                                            <YAxis hide allowDecimals={false} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="var(--primary)"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }}
                                                isAnimationActive={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="mt-6 p-4 rounded-2xl border" style={{ background: 'var(--accent)', borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
                                    <Zap size={14} />
                                    <span className="text-xs font-black uppercase tracking-widest">Growth Insight</span>
                                </div>
                                <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed">
                                    {milestoneCompletionRate >= 50
                                        ? `Strong execution at ${milestoneCompletionRate}% milestone completion. Keep up the momentum!`
                                        : `${completedMilestones} of ${totalMilestones} milestones done. Focus on completing more to increase your velocity.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;
