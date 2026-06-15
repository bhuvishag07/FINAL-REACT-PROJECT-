import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Plus, Trash2, Calendar as CalIcon, Flag } from 'lucide-react';

const Todos = () => {
    const { todos, addTodo, toggleTodo, deleteTodo, categories, searchQuery } = useStore();
    const [newTask, setNewTask] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Personal');
    const [priority, setPriority] = useState('Medium');

    const filteredTodos = todos.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return t.text.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTodo({
            text: newTask,
            category: selectedCategory,
            priority,
            createdAt: new Date().toISOString()
        });
        setNewTask('');
    };

    const getPriorityColor = (p) => {
        if (p === 'High') return '#ef4444';
        if (p === 'Medium') return '#f59e0b';
        return '#10b981';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>Tasks & Todos</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Manage your daily execution items.</p>
            </div>

            {/* Input Area */}
            <form onSubmit={handleAdd} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', background: 'var(--bg-card)' }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done?"
                    style={{
                        width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--accent)',
                        border: 'none', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, outline: 'none'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ background: 'var(--accent)', color: 'var(--text-main)', padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                        >
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={{ background: 'var(--accent)', color: 'var(--text-main)', padding: '8px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </form>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <AnimatePresence>
                    {filteredTodos.map(todo => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px', background: 'var(--bg-card)', borderRadius: '12px',
                                border: '1px solid var(--border)', transition: 'all 0.2s',
                                opacity: todo.completed ? 0.6 : 1
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        border: `2px solid ${todo.completed ? 'var(--primary)' : 'var(--border)'}`,
                                        background: todo.completed ? 'var(--primary)' : 'transparent',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                                    }}
                                >
                                    {todo.completed && <Check size={14} strokeWidth={4} />}
                                </button>
                                <div>
                                    <h4 style={{
                                        fontSize: '14px', fontWeight: 700, marginBottom: '2px',
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)'
                                    }}>
                                        {todo.text}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                                            {todo.category}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getPriorityColor(todo.priority) }}>
                                            <Flag size={10} />
                                            {todo.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                style={{
                                    background: 'transparent', border: 'none', padding: '8px',
                                    color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTodos.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Circle size={40} style={{ margin: '0 auto 16px', opacity: 0.1 }} strokeWidth={1} />
                        <p style={{ fontWeight: 600 }}>{searchQuery ? 'No tasks match your search.' : 'No tasks found. You\'re all caught up!'}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Todos;
