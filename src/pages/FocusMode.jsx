import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const FocusMode = () => {
    const { goals, focusSettings, setFocusSettings, addFocusSession, searchQuery } = useStore();

    const filteredGoals = goals.filter(g => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
    });

    const [customDuration, setCustomDuration] = useState(focusSettings.duration || 25);
    const [breakDuration, setBreakDuration] = useState(focusSettings.breakDuration || 5);
    const [timeLeft, setTimeLeft] = useState((focusSettings.duration || 25) * 60);
    const [isActive, setIsActive] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    const durations = [15, 25, 45, 60];
    const [selectedGoalId, setSelectedGoalId] = useState(focusSettings.selectedGoalId || (goals[0] && goals[0].id) || null);
    const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0] || { name: 'Deep Work Session', category: 'Focus' };

    useEffect(() => {
        if (focusSettings.selectedGoalId) {
            setSelectedGoalId(focusSettings.selectedGoalId);
        } else if (!selectedGoalId && goals[0]?.id) {
            setSelectedGoalId(goals[0].id);
        }
    }, [focusSettings.selectedGoalId, goals, selectedGoalId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setIsStarted(false);
            addFocusSession({ duration: customDuration });
            alert('Focus session complete! Great work!');
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startSession = () => {
        if (!isStarted) setTimeLeft(customDuration * 60);
        setIsActive(true);
        setIsStarted(true);
    };
    const pauseSession = () => setIsActive(false);
    const resumeSession = () => { setIsActive(true); setIsStarted(true); };
    const resetTimer = () => {
        setIsActive(false);
        setIsStarted(false);
        setTimeLeft(customDuration * 60);
    };

    const setDuration = (duration) => {
        setCustomDuration(duration);
        setFocusSettings({ duration });
        setTimeLeft(duration * 60);
        setIsActive(false);
        setIsStarted(false);
    };

    const saveGoalSelection = () => {
        setFocusSettings({ selectedGoalId });
    };

    const saveTimerPreferences = () => {
        setFocusSettings({ duration: customDuration, breakDuration });
        setTimeLeft(customDuration * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-12 pb-10 px-4">
            <div className="w-full max-w-5xl text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] text-xs font-black uppercase tracking-widest">
                    <Zap size={14} /> Focus Session
                </div>
                <h1
                    className="text-4xl md:text-5xl font-black tracking-tight leading-tight break-words max-w-full mx-auto px-4"
                    title={currentGoal.name}
                >
                    {currentGoal.name}
                </h1>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] items-center justify-center">
                    <select
                        value={selectedGoalId || ''}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        className="w-full min-w-0 bg-[var(--bg-card)] p-3 rounded-2xl font-black text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    >
                        {filteredGoals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button
                        onClick={saveGoalSelection}
                        className="w-full md:w-auto px-4 py-3 bg-[var(--primary)] text-white rounded-2xl font-black"
                    >
                        Save Goal
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-12 w-full max-w-xl">

                {/* Timer Display */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="160" cy="160" r="140"
                            stroke="var(--accent)" strokeWidth="12" fill="none"
                        />
                        <motion.circle
                            cx="160" cy="160" r="140"
                            stroke="var(--primary)" strokeWidth="12" fill="none"
                            strokeDasharray="880"
                            initial={{ strokeDashoffset: 880 }}
                            animate={{ strokeDashoffset: 880 - (880 * (progressPercent / 100)) }}
                            transition={{ duration: 1, ease: "linear" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-7xl font-black font-mono tracking-tighter" style={{ color: 'var(--text-main)' }}>{formatTime(timeLeft)}</span>
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">
                            {isActive ? 'In Progress' : 'Paused'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button onClick={startSession} className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-black">Start Session</button>
                    <button onClick={pauseSession} className="px-4 py-3 bg-[var(--accent)] text-[var(--text-main)] rounded-xl font-black">Pause</button>
                    <button onClick={resumeSession} className="px-4 py-3 bg-[var(--accent)] text-[var(--text-main)] rounded-xl font-black">Resume</button>
                    <button onClick={resetTimer} className="px-4 py-3 border border-[var(--border)] rounded-xl font-black">Reset</button>
                </div>

                {/* Duration Selector */}
                <div className="w-full card p-6 bg-[var(--bg-card)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1 text-center mb-4">Session Duration</p>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {durations.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDuration(d)}
                                className={`py-3 rounded-xl font-black text-sm transition-all border border-[var(--border)]
                                    ${customDuration === d ? 'bg-[var(--primary)] text-white scale-105 border-[var(--primary)]' : 'bg-transparent text-[var(--text-main)] hover:bg-[var(--accent)]'}`}
                            >
                                {d}m
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="text-xs font-black text-[var(--text-muted)]">Hours</label>
                            <input type="number" min={0} value={Math.floor(customDuration / 60)} onChange={(e) => { const h = Math.max(0, parseInt(e.target.value || '0')); const total = h * 60 + (customDuration % 60); setCustomDuration(total); }} className="w-full p-2 rounded-lg bg-[var(--accent)]" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[var(--text-muted)]">Minutes</label>
                            <input type="number" min={0} max={59} value={customDuration % 60} onChange={(e) => { const m = Math.max(0, Math.min(59, parseInt(e.target.value || '0'))); const total = Math.floor(customDuration / 60) * 60 + m; setCustomDuration(total); }} className="w-full p-2 rounded-lg bg-[var(--accent)]" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[var(--text-muted)]">Break (mins)</label>
                            <input type="number" min={0} value={breakDuration} onChange={(e) => setBreakDuration(Math.max(0, parseInt(e.target.value || '0')))} className="w-full p-2 rounded-lg bg-[var(--accent)]" />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button onClick={saveTimerPreferences} className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-black">Save Preferences</button>
                        <div className="text-sm font-bold text-[var(--text-muted)] self-center">Current: {customDuration} mins • Break: {breakDuration} mins</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FocusMode;
