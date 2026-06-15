import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Target, Calendar, Trash2, Edit3, Copy, Archive, ChevronRight, X, Save, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PredictionReportModal from '../components/modals/PredictionReportModal';
import { useSearchParams } from 'react-router-dom';

const Goals = () => {
    const { goals, milestones, categories, addGoal, deleteGoal, updateGoal, archiveGoal, duplicateGoal, updateMilestone, addMilestone, deleteMilestone, reorderMilestones, searchQuery } = useStore();
    const [searchParams] = useSearchParams();
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [showPrediction, setShowPrediction] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', category: 'Engineering', targetDate: '', description: '', priority: 'Medium', status: 'Active', milestones: [] });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const targetId = searchParams.get('id');
        if (targetId) {
            const goal = goals.find(g => g.id === targetId);
            if (goal) setSelectedGoal(goal);
        }
    }, [searchParams, goals]);

    const catNames = categories.map((c) => c.name);

    const filteredGoals = goals.filter((g) => {
        const matchesFilter = filter === 'all'
            ? !g.archived
            : filter === 'archived'
                ? g.archived
                : g.category === filter && !g.archived;

        if (!matchesFilter) return false;

        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return [g.name, g.description, g.category, g.priority, g.status]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
    });

    const openCreate = () => {
        setEditingGoal(null);
        setFormData({ name: '', category: catNames[0] || 'Engineering', targetDate: '', description: '', priority: 'Medium', status: 'Active', milestones: [] });
        setIsModalOpen(true);
    };

    const openEdit = (goal) => {
        setEditingGoal(goal);
        const goalMilestones = milestones.filter((m) => m.goalId === goal.id).sort((a, b) => (a.order || 0) - (b.order || 0));
        setFormData({
            name: goal.name,
            category: goal.category,
            targetDate: goal.targetDate,
            description: goal.description || '',
            priority: goal.priority || 'Medium',
            status: goal.status || 'Active',
            milestones: goalMilestones.map((m) => ({
                id: m.id,
                name: m.name,
                description: m.description || '',
                status: m.status || 'Pending',
                priority: m.priority || 'Medium',
                dueDate: m.dueDate || '',
                category: m.category || goal.category,
                dependencies: m.dependencies || [],
                notes: m.notes || '',
            })),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingGoal) {
            updateGoal(editingGoal.id, {
                name: formData.name,
                category: formData.category,
                targetDate: formData.targetDate,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
            });

            const existingIds = milestones.filter((m) => m.goalId === editingGoal.id).map((m) => m.id);
            const updatedIds = formData.milestones.filter((m) => m.id).map((m) => m.id);
            const toDelete = existingIds.filter((id) => !updatedIds.includes(id));
            toDelete.forEach((id) => deleteMilestone(id));

            formData.milestones.forEach((milestone) => {
                if (milestone.id) {
                    updateMilestone(milestone.id, {
                        name: milestone.name,
                        description: milestone.description,
                        status: milestone.status,
                        priority: milestone.priority,
                        dueDate: milestone.dueDate,
                        category: milestone.category,
                        dependencies: milestone.dependencies,
                        notes: milestone.notes,
                    });
                } else {
                    addMilestone({
                        ...milestone,
                        goalId: editingGoal.id,
                    });
                }
            });
            reorderMilestones(editingGoal.id, formData.milestones.map((m) => m.id).filter(Boolean));
        } else {
            addGoal({
                ...formData,
                status: formData.status,
                milestones: formData.milestones.map((milestone) => ({
                    name: milestone.name,
                    description: milestone.description,
                    status: milestone.status,
                    priority: milestone.priority,
                    dueDate: milestone.dueDate,
                    category: milestone.category,
                    dependencies: milestone.dependencies,
                    notes: milestone.notes,
                })),
            });
        }
        setIsModalOpen(false);
    };

    const openGoalDetail = (goal) => {
        setSelectedGoal(goal);
    };

    const getProgress = (goalId) => {
        const gm = milestones.filter((m) => m.goalId === goalId);
        if (gm.length === 0) return 0;
        return Math.round((gm.filter((m) => m.status === 'Completed').length / gm.length) * 100);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>Goal Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Define your mission-critical objectives.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ background: 'var(--accent)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', outline: 'none' }}
                    >
                        <option value="all">All Goals</option>
                        <option value="archived">Archived</option>
                        {catNames.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={openCreate}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px var(--primary-glow)' }}
                    >
                        <Plus size={18} /> New Goal
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedGoal ? '1fr 400px' : '1fr', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {filteredGoals.map((goal, i) => {
                        const progress = getProgress(goal.id);
                        return (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="card"
                                style={{ padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s', opacity: goal.archived ? 0.6 : 1 }}
                                onClick={() => openGoalDetail(goal)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--accent)', color: 'var(--primary)' }}>
                                        <Target size={20} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => openEdit(goal)} style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }} title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => duplicateGoal(goal.id)} style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }} title="Duplicate">
                                            <Copy size={14} />
                                        </button>
                                        <button onClick={() => archiveGoal(goal.id)} style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }} title="Archive">
                                            <Archive size={14} />
                                        </button>
                                        <button onClick={() => { if (confirm('Delete this goal?')) deleteGoal(goal.id); }} style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }} title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {(() => {
                                    const cat = categories.find(c => c.name === goal.category);
                                    const catColor = cat ? cat.color : 'var(--primary)';
                                    return (
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: catColor,
                                            background: `${catColor}15`,
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            display: 'inline-block',
                                            marginBottom: '8px'
                                        }}>
                                            {goal.category}
                                        </span>
                                    );
                                })()}
                                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>{goal.name}</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '20px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {goal.description || 'No description provided.'}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</span>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '5px', background: 'var(--accent)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                                        <Calendar size={12} />
                                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{new Date(goal.targetDate).toLocaleDateString()}</span>
                                    </div>
                                    {goal.priority && (
                                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: goal.priority === 'High' ? '#fef2f2' : goal.priority === 'Critical' ? '#fef2f2' : 'var(--accent)', color: goal.priority === 'High' || goal.priority === 'Critical' ? '#ef4444' : 'var(--text-muted)' }}>
                                            {goal.priority}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredGoals.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                            <Target size={48} style={{ marginBottom: '16px', opacity: 0.15 }} />
                            <p style={{ fontWeight: 600 }}>No goals found. Create your first goal!</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-4xl bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black">{editingGoal ? 'Edit Goal' : 'Save Goal'}</h2>
                                        <p className="text-sm text-[var(--text-muted)] mt-2">{editingGoal ? 'Update the goal details and milestone roadmap.' : 'Save a new goal with optional milestones.'}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 text-[var(--text-muted)] hover:bg-[var(--accent)] rounded-xl"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Goal Title</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                placeholder="e.g. Become a React Developer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            >
                                                {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Deadline</label>
                                            <input
                                                required
                                                type="date"
                                                value={formData.targetDate}
                                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                                className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[120px]"
                                            placeholder="Describe the goal and what success looks like."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            >
                                                <option>Active</option>
                                                <option>Paused</option>
                                                <option>Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-black">Milestones</h3>
                                                <p className="text-xs text-[var(--text-muted)]">Add, update, reorder, and remove milestones for this goal.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    milestones: [...formData.milestones, {
                                                        id: crypto.randomUUID(),
                                                        name: '',
                                                        description: '',
                                                        status: 'Pending',
                                                        priority: 'Medium',
                                                        dueDate: '',
                                                        category: formData.category,
                                                        dependencies: [],
                                                        notes: '',
                                                    }],
                                                })}
                                                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--primary)] text-white font-black text-sm"
                                            >
                                                <Plus size={16} /> Add Milestone
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.milestones.map((milestone, index) => (
                                                <div key={milestone.id || index} className="rounded-3xl border border-[var(--border)] bg-[var(--accent)] p-4 space-y-4">
                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Milestone Title</label>
                                                            <input
                                                                required
                                                                type="text"
                                                                value={milestone.name}
                                                                onChange={(e) => {
                                                                    const updated = [...formData.milestones];
                                                                    updated[index].name = e.target.value;
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...formData.milestones];
                                                                    if (index > 0) {
                                                                        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                                                                        setFormData({ ...formData, milestones: updated });
                                                                    }
                                                                }}
                                                                className="p-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--primary)] text-[var(--text-muted)]"
                                                            >
                                                                <ArrowUp size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...formData.milestones];
                                                                    if (index < formData.milestones.length - 1) {
                                                                        [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
                                                                        setFormData({ ...formData, milestones: updated });
                                                                    }
                                                                }}
                                                                className="p-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--primary)] text-[var(--text-muted)]"
                                                            >
                                                                <ArrowDown size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = formData.milestones.filter((_, i) => i !== index);
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Due Date</label>
                                                            <input
                                                                type="date"
                                                                value={milestone.dueDate}
                                                                onChange={(e) => {
                                                                    const updated = [...formData.milestones];
                                                                    updated[index].dueDate = e.target.value;
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Priority</label>
                                                            <select
                                                                value={milestone.priority}
                                                                onChange={(e) => {
                                                                    const updated = [...formData.milestones];
                                                                    updated[index].priority = e.target.value;
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                            >
                                                                <option>Low</option>
                                                                <option>Medium</option>
                                                                <option>High</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</label>
                                                            <select
                                                                value={milestone.status}
                                                                onChange={(e) => {
                                                                    const updated = [...formData.milestones];
                                                                    updated[index].status = e.target.value;
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                            >
                                                                <option>Pending</option>
                                                                <option>In Progress</option>
                                                                <option>Completed</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                                                            <select
                                                                value={milestone.category}
                                                                onChange={(e) => {
                                                                    const updated = [...formData.milestones];
                                                                    updated[index].category = e.target.value;
                                                                    setFormData({ ...formData, milestones: updated });
                                                                }}
                                                                className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                            >
                                                                {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Dependencies</label>
                                                        <select
                                                            multiple
                                                            value={milestone.dependencies || []}
                                                            onChange={(e) => {
                                                                const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                                                                const updated = [...formData.milestones];
                                                                updated[index].dependencies = values;
                                                                setFormData({ ...formData, milestones: updated });
                                                            }}
                                                            className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none h-32"
                                                        >
                                                            {formData.milestones.filter((_, idx) => idx !== index).map((other) => (
                                                                <option key={other.id || idx} value={other.id || other.name}>{other.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Notes</label>
                                                        <textarea
                                                            value={milestone.notes}
                                                            onChange={(e) => {
                                                                const updated = [...formData.milestones];
                                                                updated[index].notes = e.target.value;
                                                                setFormData({ ...formData, milestones: updated });
                                                            }}
                                                            className="w-full bg-[var(--bg-card)] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[100px]"
                                                            placeholder="Additional notes for the milestone"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-6 py-4 rounded-2xl font-black text-sm border border-[var(--border)] hover:bg-[var(--accent)]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-sm hover:scale-[1.02] transition-transform"
                                        >
                                            {editingGoal ? 'Save Goal Changes' : 'Save Goal'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Goal Detail Panel */}
                <AnimatePresence>
                    {selectedGoal && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="card"
                            style={{ padding: '28px', height: 'fit-content', position: 'sticky', top: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Goal Details</h2>
                                <button onClick={() => setSelectedGoal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>Goal Name</p>
                                    <p style={{ fontWeight: 700, fontSize: '16px' }}>{selectedGoal.name}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{selectedGoal.description || 'No description'}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</p>
                                        <p style={{ fontWeight: 700, fontSize: '13px' }}>{selectedGoal.category}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>Priority</p>
                                        <p style={{ fontWeight: 700, fontSize: '13px' }}>{selectedGoal.priority || 'Medium'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Progress</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ flex: 1, height: '8px', background: 'var(--accent)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${getProgress(selectedGoal.id)}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary)' }}>{getProgress(selectedGoal.id)}%</span>
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>Milestones</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {milestones.filter((m) => m.goalId === selectedGoal.id).map((m) => (
                                            <div key={m.id} style={{ padding: '10px 14px', background: 'var(--accent)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 600, textDecoration: m.status === 'Completed' ? 'line-through' : 'none', color: m.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-main)' }}>{m.name}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: m.status === 'Completed' ? '#10b981' : m.status === 'In Progress' ? 'var(--primary)' : '#94a3b8' }}>{m.status}</span>
                                            </div>
                                        ))}
                                        {milestones.filter((m) => m.goalId === selectedGoal.id).length === 0 && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No milestones yet</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setShowPrediction(true); }}
                                    style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}
                                >
                                    View Forecast
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Prediction Modal */}
            {showPrediction && selectedGoal && (
                <PredictionReportModal
                    isOpen={showPrediction}
                    onClose={() => setShowPrediction(false)}
                    goal={selectedGoal}
                    milestones={milestones.filter((m) => m.goalId === selectedGoal.id)}
                />
            )}
        </motion.div>
    );
};

export default Goals;
