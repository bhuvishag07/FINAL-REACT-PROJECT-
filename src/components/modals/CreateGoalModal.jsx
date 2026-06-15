import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CreateGoalModal = ({ isOpen, onClose }) => {
    const { addGoal, categories } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: categories[0]?.name || 'Career',
        targetDate: '',
        priority: 'Medium',
        milestoneCount: 3,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addGoal({
            ...formData,
            progress: 0,
            milestones: [],
        });
        setFormData({
            name: '',
            description: '',
            category: categories[0]?.name || 'Career',
            targetDate: '',
            priority: 'Medium',
            milestoneCount: 3,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Create New Goal</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Goal Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            placeholder="e.g. Master React Architecture"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Target Date *</label>
                            <input
                                required
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Initial Milestones</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.milestoneCount}
                                onChange={(e) => setFormData({ ...formData, milestoneCount: parseInt(e.target.value) })}
                                className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[100px]"
                            placeholder="Describe your goal and what success looks like..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-sm border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-[var(--primary)] text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-[var(--primary-glow)]"
                        >
                            <Plus size={18} /> Create Goal
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateGoalModal;
