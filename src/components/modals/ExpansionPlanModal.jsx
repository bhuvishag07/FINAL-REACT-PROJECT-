import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    X, Target, Calendar, GitBranch, TrendingUp, Clock,
    ChevronRight, Layers, Flag
} from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';

const safeParse = (str) => {
    try {
        if (!str) return null;
        const d = parseISO(str);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
};

const ExpansionPlanModal = ({ isOpen, onClose, goals, milestones, categories }) => {
    const today = useMemo(() => new Date(), []);

    const roadmap = useMemo(() => {
        const activeGoals = (goals || []).filter(g => !g.archived);

        const goalsWithDetails = activeGoals.map(goal => {
            const goalMilestones = (milestones || [])
                .filter(m => m.goalId === goal.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            const completed = goalMilestones.filter(m => m.status === 'Completed').length;
            const progress = goalMilestones.length
                ? Math.round((completed / goalMilestones.length) * 100)
                : goal.progress ?? 0;

            const pendingMilestones = goalMilestones.filter(m => m.status !== 'Completed');
            const upcoming = pendingMilestones
                .filter(m => {
                    const d = safeParse(m.dueDate);
                    return d && (isAfter(d, today) || format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
                })
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5);

            const dependencies = goalMilestones
                .filter(m => (m.dependencies || []).length > 0)
                .map(m => ({
                    milestone: m.name,
                    dependsOn: (m.dependencies || [])
                        .map(depId => goalMilestones.find(gm => gm.id === depId)?.name || depId)
                        .filter(Boolean),
                }));

            const targetDate = safeParse(goal.targetDate);
            const weeksRemaining = progress < 100 && targetDate
                ? Math.max(1, Math.ceil(((100 - progress) / Math.max(progress, 1)) * 4))
                : 0;
            const estimatedCompletion = progress >= 100
                ? targetDate
                : targetDate || addDays(today, weeksRemaining * 7);

            return {
                ...goal,
                goalMilestones,
                progress,
                completed,
                total: goalMilestones.length,
                upcoming,
                dependencies,
                estimatedCompletion,
            };
        });

        const categoryProgress = (categories || []).map(cat => {
            const catGoals = activeGoals.filter(g => g.category === cat.name);
            const catMilestones = (milestones || []).filter(m =>
                catGoals.some(g => g.id === m.goalId)
            );
            const completed = catMilestones.filter(m => m.status === 'Completed').length;
            const progress = catMilestones.length
                ? Math.round((completed / catMilestones.length) * 100)
                : 0;
            return {
                ...cat,
                goalCount: catGoals.length,
                milestoneCount: catMilestones.length,
                progress,
            };
        });

        const allUpcoming = (milestones || [])
            .filter(m => m.status !== 'Completed')
            .filter(m => {
                const d = safeParse(m.dueDate);
                return d && isAfter(d, addDays(today, -1));
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 8)
            .map(m => ({
                ...m,
                goalName: activeGoals.find(g => g.id === m.goalId)?.name || 'Unknown Goal',
            }));

        const timelineEntries = activeGoals
            .flatMap(g => {
                const gMilestones = (milestones || []).filter(m => m.goalId === g.id && m.status !== 'Completed');
                return gMilestones.map(m => ({
                    date: safeParse(m.dueDate),
                    label: m.name,
                    goal: g.name,
                    category: g.category,
                    priority: m.priority,
                }));
            })
            .filter(e => e.date)
            .sort((a, b) => a.date - b.date)
            .slice(0, 12);

        const overallProgress = activeGoals.length
            ? Math.round(activeGoals.reduce((sum, g) => {
                const gM = (milestones || []).filter(m => m.goalId === g.id);
                const done = gM.filter(m => m.status === 'Completed').length;
                return sum + (gM.length ? (done / gM.length) * 100 : 0);
            }, 0) / activeGoals.length)
            : 0;

        return {
            goalsWithDetails,
            categoryProgress,
            allUpcoming,
            timelineEntries,
            overallProgress,
            totalGoals: activeGoals.length,
            totalMilestones: (milestones || []).length,
            completedMilestones: (milestones || []).filter(m => m.status === 'Completed').length,
        };
    }, [goals, milestones, categories, today]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-5xl bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-2xl my-4 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 sm:p-8 border-b border-[var(--border)] shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">
                            Strategic Roadmap 2026
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
                            Expansion Plan
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-xl">
                            Live roadmap generated from your goals, milestones, and category progress.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent)] rounded-xl transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[var(--accent)] rounded-2xl p-4 border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Overall Progress</p>
                            <p className="text-2xl font-black text-[var(--primary)] mt-1">{roadmap.overallProgress}%</p>
                        </div>
                        <div className="bg-[var(--accent)] rounded-2xl p-4 border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Active Goals</p>
                            <p className="text-2xl font-black mt-1">{roadmap.totalGoals}</p>
                        </div>
                        <div className="bg-[var(--accent)] rounded-2xl p-4 border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Milestones Done</p>
                            <p className="text-2xl font-black text-emerald-500 mt-1">
                                {roadmap.completedMilestones}/{roadmap.totalMilestones}
                            </p>
                        </div>
                        <div className="bg-[var(--accent)] rounded-2xl p-4 border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Upcoming</p>
                            <p className="text-2xl font-black mt-1">{roadmap.allUpcoming.length}</p>
                        </div>
                    </div>

                    {/* Category Progress */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <Layers size={14} /> Category Progress
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {roadmap.categoryProgress.map(cat => (
                                <div key={cat.id} className="bg-[var(--accent)] rounded-2xl p-4 border border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="font-black text-sm">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-[var(--primary)]">{cat.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${cat.progress}%`, backgroundColor: cat.color || 'var(--primary)' }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-2">
                                        {cat.goalCount} goal{cat.goalCount !== 1 ? 's' : ''} · {cat.milestoneCount} milestones
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Current Goals */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <Target size={14} /> Current Goals
                        </h3>
                        <div className="space-y-4">
                            {roadmap.goalsWithDetails.map(goal => (
                                <div key={goal.id} className="bg-[var(--accent)] rounded-2xl p-5 border border-[var(--border)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                                    {goal.category}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                                                    {goal.priority} Priority
                                                </span>
                                            </div>
                                            <h4 className="font-black text-lg">{goal.name}</h4>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-black text-[var(--primary)]">{goal.progress}%</p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)]">
                                                {goal.completed}/{goal.total} milestones
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-[var(--primary)] rounded-full"
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <Calendar size={14} />
                                            <span className="font-bold">Deadline:</span>
                                            <span>{goal.targetDate ? format(parseISO(goal.targetDate), 'MMM dd, yyyy') : 'TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                            <TrendingUp size={14} />
                                            <span className="font-bold">Est. Completion:</span>
                                            <span>
                                                {goal.estimatedCompletion
                                                    ? format(goal.estimatedCompletion, 'MMM dd, yyyy')
                                                    : 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    {goal.dependencies.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1">
                                                <GitBranch size={12} /> Dependencies
                                            </p>
                                            <div className="space-y-1">
                                                {goal.dependencies.slice(0, 4).map((dep, i) => (
                                                    <p key={i} className="text-xs text-[var(--text-muted)]">
                                                        <span className="font-bold text-[var(--text-main)]">{dep.milestone}</span>
                                                        {' → requires '}
                                                        {dep.dependsOn.join(', ')}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Milestones */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <Flag size={14} /> Upcoming Milestones
                        </h3>
                        <div className="space-y-2">
                            {roadmap.allUpcoming.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)] font-medium">No upcoming milestones scheduled.</p>
                            ) : (
                                roadmap.allUpcoming.map(m => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between gap-4 bg-[var(--accent)] rounded-xl p-3 border border-[var(--border)]"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                                <Clock size={16} className="text-[var(--primary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm truncate">{m.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold truncate">{m.goalName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-black">
                                                {m.dueDate ? format(parseISO(m.dueDate), 'MMM dd') : 'TBD'}
                                            </p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)]">{m.priority}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Estimated Completion Timeline */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <Calendar size={14} /> Estimated Completion Timeline
                        </h3>
                        <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border)]">
                            {roadmap.timelineEntries.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)] font-medium">No pending milestones on the timeline.</p>
                            ) : (
                                roadmap.timelineEntries.map((entry, i) => (
                                    <div key={i} className="relative flex items-start gap-4">
                                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--bg-card)]" />
                                        <div className="flex-1 bg-[var(--accent)] rounded-xl p-3 border border-[var(--border)]">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <p className="font-black text-sm">{entry.label}</p>
                                                <p className="text-xs font-black text-[var(--primary)]">
                                                    {format(entry.date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">
                                                {entry.goal} · {entry.category} · {entry.priority} Priority
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-[var(--border)] shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-sm bg-[var(--primary)] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        Close Roadmap
                        <ChevronRight size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ExpansionPlanModal;
