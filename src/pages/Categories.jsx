import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Target, Heart, Briefcase, GraduationCap, DollarSign, User, ChevronRight, Activity, Plus, X, Edit3, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#6366f1', '#a855f7', '#ef4444', '#8b5cf6', '#f59e0b'];

const CategoryCard = ({ category, count, progress, goalsInCategory, onEdit, onDelete }) => (
    <div className="card p-8 group hover:border-[var(--primary)] transition-all">
        <div className="flex justify-between items-start mb-8">
            <div style={{ width: 56, height: 56, borderRadius: '20px', backgroundColor: `${category.color}20`, display: 'grid', placeItems: 'center', color: category.color }}>
                <span className="text-2xl">{category.icon || '📌'}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(category)} className="p-2 hover:bg-[var(--accent)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"><Edit3 size={16} /></button>
                <button onClick={() => onDelete(category.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-500"><Trash2 size={16} /></button>
            </div>
        </div>

        <h3 className="text-xl font-black mb-2">{category.name}</h3>
        <p className="text-xs text-[var(--text-muted)] font-bold mb-8 leading-relaxed">{count} active goal{count !== 1 ? 's' : ''}</p>

        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Completion</span>
                <span className="text-xs font-black text-[var(--primary)]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--accent)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    </div>
);

const Categories = () => {
    const { goals, categories, addCategory, updateCategory, deleteCategory, searchQuery } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: '#3b82f6', icon: '📚' });
    const [selectedCategory, setSelectedCategory] = useState(null);

    const colors = ['#3b82f6', '#10b981', '#f97316', '#6366f1', '#a855f7', '#ef4444', '#ec4899', '#06b6d4'];

    const getGoalsForCategory = (catName) => goals.filter(g => g.category === catName && !g.archived);

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const catGoals = getGoalsForCategory(cat.name);
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return cat.name.toLowerCase().includes(query) || catGoals.some(g => g.name.toLowerCase().includes(query));
        });
    }, [categories, goals, searchQuery]);

    const getCategoryProgress = useMemo(() => (catName) => {
        const catGoals = getGoalsForCategory(catName);
        if (catGoals.length === 0) return 0;
        const totalProgress = catGoals.reduce((sum, g) => sum + (g.progress || 0), 0);
        return Math.round(totalProgress / catGoals.length);
    }, [goals]);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingId(category.id);
            setFormData({ name: category.name, color: category.color, icon: category.icon || '📚' });
        } else {
            setEditingId(null);
            setFormData({ name: '', color: '#3b82f6', icon: '🚀' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateCategory(editingId, formData);
        } else {
            addCategory(formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this category? This action cannot be undone.')) {
            deleteCategory(id);
        }
    };

    return (
        <div className="space-y-12 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black mb-2">Categories</h1>
                    <p className="text-[var(--text-muted)] font-medium">Organize your goals by area of focus.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-[var(--primary-glow)] hover:scale-105 transition-transform"
                >
                    <Plus size={20} /> New Category
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCategories.map((cat) => {
                        const catGoals = getGoalsForCategory(cat.name);
                        return (
                            <motion.div
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className="cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <CategoryCard
                                    category={cat}
                                    count={catGoals.length}
                                    progress={getCategoryProgress(cat.name)}
                                    goalsInCategory={catGoals}
                                    onEdit={() => handleOpenModal(cat)}
                                    onDelete={handleDelete}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Category Details Sidebar */}
                <AnimatePresence>
                    {selectedCategory && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="card p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${selectedCategory.color}15`, display: 'grid', placeItems: 'center', fontSize: '24px' }}>
                                            {selectedCategory.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black">{selectedCategory.name}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Management</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="p-2 hover:bg-[var(--accent)] rounded-lg"
                                    >
                                        <X size={20} className="text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {(() => {
                                        const catGoals = getGoalsForCategory(selectedCategory.name);
                                        const completedGoals = catGoals.filter(g => g.progress === 100).length;

                                        return (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-[var(--accent)] p-4 rounded-2xl">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Active</p>
                                                        <p className="text-2xl font-black">{catGoals.length}</p>
                                                    </div>
                                                    <div className="bg-[var(--accent)] p-4 rounded-2xl">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Success</p>
                                                        <p className="text-2xl font-black text-emerald-500">{completedGoals}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 px-1">Goal Distribution</p>
                                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                                        {catGoals.length === 0 ? (
                                                            <p className="text-sm text-[var(--text-muted)] font-medium p-4 bg-[var(--accent)] rounded-2xl border border-dashed border-[var(--border)] text-center">No goals assigned yet</p>
                                                        ) : (
                                                            catGoals.map((goal) => (
                                                                <div key={goal.id} className="p-4 bg-[var(--accent)] rounded-xl border border-transparent hover:border-[var(--border)] transition-all">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <p className="text-xs font-black line-clamp-1">{goal.name}</p>
                                                                        <span className="text-[10px] font-bold text-[var(--primary)]">{goal.progress}%</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-[var(--primary)] transition-all duration-700"
                                                                            style={{ width: `${goal.progress || 0}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Category Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-[var(--bg-card)] rounded-[32px] p-10 border border-[var(--border)] shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black">{editingId ? 'Edit' : 'Create'} Category</h2>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${formData.color}15`, color: formData.color, display: 'grid', placeItems: 'center', fontSize: '24px' }}>
                                    {formData.icon}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--accent)] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]"
                                        placeholder="e.g. Health, Wealth, Wisdom"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Symbol</label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {['💻', '💰', '🏋️', '🌱', '📚', '🚀', '🎯', '🧠', '🎨', '🔥', '💎', '🌍'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: emoji })}
                                                className={`h-12 rounded-xl border text-2xl transition-all ${formData.icon === emoji ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-110 shadow-lg' : 'border-[var(--border)] hover:bg-[var(--accent)]'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Theme Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {colors.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: c })}
                                                style={{ backgroundColor: c }}
                                                className={`w-10 h-10 rounded-full transition-all ${formData.color === c ? 'ring-4 ring-offset-4 ring-offset-[var(--bg-card)] ring-[var(--primary)] scale-110' : 'hover:scale-110'}`}
                                            />
                                        ))}
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                                            />
                                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">+</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-[var(--text-muted)] hover:bg-[var(--accent)] transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-[var(--primary)] text-white px-6 py-4 rounded-2xl font-black text-sm shadow-[var(--primary-glow)] hover:scale-[1.02] transition-transform">Save Category</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
