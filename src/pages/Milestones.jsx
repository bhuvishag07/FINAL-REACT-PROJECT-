import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2, Circle, Lock, Trash2, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Milestones = () => {
    const { goals, categories, milestones, addMilestone, deleteMilestone, updateMilestone, recalcGoalProgress, searchQuery } = useStore();
    const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Pending',
        dueDate: '',
        priority: 'Medium',
        goalId: selectedGoalId,
        dependencies: [],
        category: goals.find((g) => g.id === selectedGoalId)?.category || categories[0]?.name || 'Personal',
        notes: '',
    });

    const filteredMilestones = milestones
        .filter((m) => (selectedGoalId ? m.goalId === selectedGoalId : true))
        .filter((m) => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Completed') return m.status === 'Completed';
            if (statusFilter === 'In Progress') return m.status === 'In Progress' || m.status === 'Pending';
            if (statusFilter === 'Overdue') {
                return m.status !== 'Completed' && m.dueDate && m.dueDate < today;
            }
            return true;
        })
        .filter((m) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return [m.name, m.description, m.status, m.priority, m.category, m.notes]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query));
        });

    const openAddModal = () => {
        setEditingMilestone(null);
        setFormData({
            name: '',
            description: '',
            status: 'Pending',
            dueDate: '',
            priority: 'Medium',
            goalId: selectedGoalId,
            dependencies: [],
            category: goals.find((g) => g.id === selectedGoalId)?.category || categories[0]?.name || 'Personal',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            name: milestone.name,
            description: milestone.description || '',
            status: milestone.status || 'Pending',
            dueDate: milestone.dueDate || '',
            priority: milestone.priority || 'Medium',
            goalId: milestone.goalId,
            dependencies: milestone.dependencies || [],
            category: milestone.category || goals.find((g) => g.id === milestone.goalId)?.category || categories[0]?.name || 'Personal',
            notes: milestone.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMilestone) {
            updateMilestone(editingMilestone.id, { ...formData });
        } else {
            addMilestone({ ...formData, goalId: selectedGoalId });
        }
        setIsModalOpen(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 style={{ color: 'var(--success)' }} size={20} />;
            case 'In Progress': return <Circle style={{ color: 'var(--primary)' }} size={20} />;
            case 'Locked': return <Lock style={{ color: 'var(--text-muted)' }} size={20} />;
            default: return <Circle style={{ color: 'var(--border)' }} size={20} />;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2">Milestones</h1>
                    <p className="text-[var(--text-muted)] font-medium">Break down goals into actionable connected steps.</p>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Overdue</option>
                    </select>
                    <select
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none min-w-[200px]"
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                    >
                        <option value="">All Missions</option>
                        {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button
                        disabled={!selectedGoalId}
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-[var(--primary-glow)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        <Plus size={20} />
                        Add Milestone
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="px-8 py-4 border-b border-[var(--border)] flex justify-between items-center" style={{ background: 'var(--accent)' }}>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Task Name</span>
                    </div>
                    <div className="hidden md:flex gap-16 mr-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-24">Status</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-24">Priority</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-24">Due Date</span>
                    </div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                    {filteredMilestones.map((m) => (
                        <div key={m.id} className="px-8 py-5 flex items-center justify-between hover:bg-[var(--accent)] transition-colors group">
                            <div className="flex items-center gap-4">
                                <button onClick={() => {
                                    const newStatus = m.status === 'Completed' ? 'Pending' : 'Completed';
                                    updateMilestone(m.id, { status: newStatus });
                                    if (m.goalId) recalcGoalProgress(m.goalId);
                                }}>
                                    {getStatusIcon(m.status)}
                                </button>
                                <div>
                                    <h4 className={`font-black text-sm ${m.status === 'Completed' ? 'line-through text-[var(--text-muted)]' : ''}`}>{m.name}</h4>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-16 mr-4">
                                <div className="w-24">
                                    <span
                                        className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                                        style={{
                                            background: m.status === 'Completed'
                                                ? 'rgba(16, 185, 129, 0.12)'
                                                : m.status === 'In Progress'
                                                    ? 'var(--primary-glow)'
                                                    : 'var(--accent)',
                                            color: m.status === 'Completed'
                                                ? 'var(--success)'
                                                : m.status === 'In Progress'
                                                    ? 'var(--primary)'
                                                    : 'var(--text-muted)',
                                        }}
                                    >
                                        {m.status}
                                    </span>
                                </div>
                                <div className="w-24">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest"
                                        style={{
                                            color: m.priority === 'High'
                                                ? 'var(--error)'
                                                : m.priority === 'Medium'
                                                    ? 'var(--warning)'
                                                    : 'var(--primary)',
                                        }}
                                    >
                                        {m.priority}
                                    </span>
                                </div>
                                <div className="w-24">
                                    <span className="text-[10px] font-black" style={{ color: 'var(--text-muted)' }}>{m.dueDate}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(m)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit3 size={14} /></button>
                                    <button onClick={() => deleteMilestone(m.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--error)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredMilestones.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                            <Plus size={40} className="mb-4 opacity-20" />
                            <p className="font-bold text-sm">
                                {selectedGoalId ? 'No milestones yet for this goal.' : 'Select a goal to view milestones.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-black">{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</h2>
                                    <p className="text-sm text-[var(--text-muted)] mt-2">{editingMilestone ? 'Update the selected milestone details.' : 'Create a new milestone and connect it to the current goal.'}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-[var(--text-muted)] hover:bg-[var(--accent)] rounded-xl"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Milestone Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Design System Phase 1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Goal</label>
                                        <select
                                            required
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.goalId}
                                            onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                                        >
                                            {goals.map((goal) => (
                                                <option key={goal.id} value={goal.id}>{goal.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Priority</label>
                                        <select
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</label>
                                        <select
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option>Pending</option>
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                                        <select
                                            className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                                    <textarea
                                        className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[120px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe how this milestone contributes to the goal."
                                    />
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
                                        {editingMilestone ? 'Save Changes' : 'Add Milestone'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Milestones;
