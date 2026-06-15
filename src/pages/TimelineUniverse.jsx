import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Rocket,
    Star,
    Activity,
    ZoomIn,
    ZoomOut,
    ChevronRight,
    Zap,
    Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ExpansionPlanModal from '../components/modals/ExpansionPlanModal';

const TimelineUniverse = () => {
    const { milestones, goals, categories, searchQuery } = useStore();
    const [zoom, setZoom] = useState(1);
    const [expansionPlanOpen, setExpansionPlanOpen] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [depPaths, setDepPaths] = useState([]);

    // Filter and Sort Milestones
    const timelineItems = useMemo(() => {
        return milestones
            .filter((m) => m.name && (m.goalId || m.isGlobal))
            .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
            .filter((m) => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [milestones, searchQuery]);

    // Derived Stats
    const totalMilestones = timelineItems.length;
    const completedCount = timelineItems.filter(m => m.status === 'Completed').length;
    const completionRate = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

    const velocity = completionRate;

    const getTimelineSpan = () => {
        if (timelineItems.length < 2) return 'Active Period';
        try {
            const startStr = timelineItems[0].dueDate;
            const endStr = timelineItems[timelineItems.length - 1].dueDate;
            if (!startStr || !endStr) return 'Active Period';
            const start = format(parseISO(startStr), 'MMM yyyy');
            const end = format(parseISO(endStr), 'MMM yyyy');
            return `${start} - ${end}`;
        } catch (e) {
            return 'Active Period';
        }
    };

    // Layout configuration
    const NODE_SPACING = 280;
    const AMPLITUDE = 120;
    const FREQUENCY = 0.5;
    const BASE_Y = 300;

    // Calculate node coordinates for SVGs and dependency lines
    const getNodeCoords = (index) => ({
        x: 150 + index * NODE_SPACING,
        y: BASE_Y + Math.sin(index * FREQUENCY) * AMPLITUDE
    });

    // Generate Primary Hub Path
    const pathD = useMemo(() => {
        if (timelineItems.length < 2) return '';
        let d = '';
        for (let i = 0; i < timelineItems.length; i++) {
            const { x, y } = getNodeCoords(i);
            if (i === 0) {
                d = `M ${x} ${y}`;
            } else {
                const prev = getNodeCoords(i - 1);
                const cp1x = prev.x + NODE_SPACING / 2;
                const cp2x = prev.x + NODE_SPACING / 2;
                d += ` C ${cp1x} ${prev.y}, ${cp2x} ${y}, ${x} ${y}`;
            }
        }
        return d;
    }, [timelineItems.length]);

    // Compute explicit dependency lines
    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            const newDepPaths = [];
            timelineItems.forEach((m, i) => {
                const from = getNodeCoords(i);
                (m.dependencies || []).forEach(depId => {
                    const depIndex = timelineItems.findIndex(t => t.id === depId);
                    if (depIndex !== -1) {
                        const to = getNodeCoords(depIndex);
                        const midX = (from.x + to.x) / 2;
                        newDepPaths.push(`M ${to.x} ${to.y} Q ${midX} ${to.y - 150} ${from.x} ${from.y}`);
                    }
                });
            });
            setDepPaths(newDepPaths);
        }, 100);
        return () => clearTimeout(timeout);
    }, [timelineItems]);

    return (
        <div className="min-h-screen py-8 px-6 space-y-8 overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Timeline Universe</h1>
                    <p className="text-[var(--text-muted)] max-w-2xl leading-relaxed">
                        A strategic galaxy of your past achievements, current sprint, and future aspirations.
                        Navigate the roadmap of your high-performance journey.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-4 shadow-sm min-w-[160px]">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Velocity</p>
                            <p className="font-bold text-lg">{velocity}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* main Timeline Canvas */}
            <div className="relative group">
                <div
                    ref={containerRef}
                    className="w-full h-[650px] rounded-[40px] border border-[var(--border)] shadow-xl overflow-auto relative custom-scrollbar scroll-smooth"
                    style={{
                        background: 'var(--bg-card)',
                        backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div
                        className="relative"
                        style={{
                            width: Math.max(1200, timelineItems.length * NODE_SPACING + 400),
                            height: '100%',
                            transform: `scale(${zoom})`,
                            transformOrigin: 'left top',
                            minHeight: 650
                        }}
                    >
                        {/* SVGs */}
                        <svg
                            className="absolute inset-0 pointer-events-none"
                            style={{ width: '100%', height: '100%', overflow: 'visible' }}
                        >
                            {/* Dependency Lines */}
                            {depPaths.map((d, i) => (
                                <path
                                    key={`dep-${i}`}
                                    d={d}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    opacity="0.3"
                                />
                            ))}

                            {/* Main Hub Path Glow */}
                            <motion.path
                                d={pathD}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="6"
                                opacity="0.1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            {/* Main Hub Path */}
                            <motion.path
                                d={pathD}
                                fill="none"
                                stroke="var(--border)"
                                strokeWidth="3"
                                strokeDasharray="8 8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        </svg>

                        {/* Nodes */}
                        {timelineItems.map((milestone, index) => {
                            const { x, y } = getNodeCoords(index);
                            const isCompleted = milestone.status === 'Completed';
                            const isCurrent = !isCompleted && (index === 0 || timelineItems[index - 1].status === 'Completed');
                            const isFuture = !isCompleted && !isCurrent;

                            return (
                                <motion.div
                                    key={milestone.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: x, top: y }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex flex-col items-center group/node relative">
                                        {/* Node Circle */}
                                        <div
                                            className={`
                                                w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative
                                                ${isCompleted ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] text-[var(--text-muted)]'}
                                                ${isCurrent ? 'w-28 h-28 border-4 border-solid border-[var(--primary)] bg-[var(--bg-card)] !text-[var(--primary)]' : ''}
                                                group-hover/node:scale-110 cursor-pointer z-10
                                            `}
                                            style={{
                                                boxShadow: isCurrent
                                                    ? `0 0 40px var(--primary-glow), inset 0 0 20px var(--primary-glow)`
                                                    : isCompleted
                                                        ? `0 0 20px var(--primary-glow)`
                                                        : 'none'
                                            }}
                                        >
                                            {isCompleted && <CheckCircle2 className="w-8 h-8" />}
                                            {isCurrent && (
                                                <div className="flex flex-col items-center">
                                                    <Star className="w-12 h-12 fill-current animate-pulse-glow" />
                                                </div>
                                            )}
                                            {isFuture && <Rocket className="w-6 h-6" />}

                                            {/* Status Badge for Current */}
                                            {isCurrent && (
                                                <motion.div
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className="absolute -top-8 bg-[var(--bg-card)] border border-[var(--border)] px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md"
                                                >
                                                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                                                        <Zap size={10} className="fill-current" />
                                                        Current Focus
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Node Info - Improved Contrast and Spacing */}
                                        <div
                                            className="mt-10 text-center space-y-2 max-w-[240px] px-4 py-3 rounded-2xl transition-all duration-300 group-hover/node:bg-[var(--bg-card)] group-hover/node:shadow-xl backdrop-blur-sm"
                                        >
                                            <h3 className={`font-black text-lg leading-tight transition-colors ${isCurrent ? 'text-[var(--primary)] uppercase tracking-tight' : 'text-[var(--text-main)]'}`}
                                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                {milestone.name}
                                            </h3>
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock size={12} className="text-[var(--text-muted)]" />
                                                <p className="text-sm font-black text-[var(--text-muted)]">
                                                    {milestone.dueDate ? format(parseISO(milestone.dueDate), 'MMM dd, yyyy') : 'Target TBD'}
                                                </p>
                                            </div>

                                            <AnimatePresence>
                                                {(isCurrent || isCompleted) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex flex-col items-center gap-2 mt-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/goals?id=${milestone.goalId}`); }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-[10px] font-black hover:scale-105 transition-all shadow-lg hover:shadow-[var(--primary-glow)]"
                                                            >
                                                                Details <ChevronRight size={12} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Canvas Controls */}
                <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] p-2 rounded-2xl shadow-2xl z-20 backdrop-blur-md">
                    <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="p-2 hover:bg-[var(--accent)] rounded-xl transition-colors text-[var(--text-main)]">
                        <ZoomIn size={18} />
                    </button>
                    <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-2 hover:bg-[var(--accent)] rounded-xl transition-colors text-[var(--text-main)]">
                        <ZoomOut size={18} />
                    </button>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Card */}
                <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-[32px] border border-[var(--border)] p-8 space-y-8 shadow-sm">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#024a7d]">Timeline Snapshot</h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                            <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Nodes</span>
                            <span className="text-sm font-black">{totalMilestones} Milestones</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Timeline Span</span>
                            <div className="text-right">
                                <p className="text-sm font-black">{getTimelineSpan()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vision Banner */}
                <div className="lg:col-span-8 relative overflow-hidden rounded-[40px] bg-[#020817] p-10 flex flex-col justify-end min-h-[300px] border border-white/10 group shadow-2xl">
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072"
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2000ms]"
                            alt="Earth at night"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/60 to-transparent" />
                    </div>

                    <div className="relative z-10 space-y-6 max-w-xl">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white tracking-tight">Strategic Vision 2026</h2>
                            <p className="text-blue-100/70 leading-relaxed text-sm font-medium">
                                Our next galaxy expansion begins in Q1. View the projected roadmap for cross-platform integration and AI-driven goal tracking.
                            </p>
                        </div>
                        <button onClick={() => setExpansionPlanOpen(true)} className="bg-white text-black px-8 py-4 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group/btn w-fit shadow-xl shadow-white/10">
                            Explore Expansion Plan
                            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <ExpansionPlanModal
                isOpen={expansionPlanOpen}
                onClose={() => setExpansionPlanOpen(false)}
                goals={goals}
                milestones={milestones}
                categories={categories}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
                [data-theme*="dark"] .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
            `}} />
        </div>
    );
};

export default TimelineUniverse;
