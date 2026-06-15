import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, ArrowRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    format, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
    isSameDay, isToday, parseISO, isAfter
} from 'date-fns';

const CreateTaskModal = ({ isOpen, onClose, addCalendarTask, categories, editingTask, updateCalendarTask, deleteCalendarTask }) => {
    const initial = editingTask ? { ...editingTask } : { title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '12:00', category: categories[0]?.name || 'Personal', priority: 'Medium' };
    const [formData, setFormData] = useState(initial);

    React.useEffect(() => {
        setFormData(editingTask ? { ...editingTask } : initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingTask, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateCalendarTask(editingTask.id, { ...formData });
        } else {
            addCalendarTask({ ...formData });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} className="card relative w-full max-w-lg p-8 z-10 mx-auto">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{editingTask ? 'Edit Event' : 'Create Event'}</h2>
                    <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:bg-[var(--accent)] rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]" placeholder="e.g. Deep Work Session" />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[80px] text-[var(--text-main)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Date</label>
                            <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]" />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Time</label>
                            <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]">
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Priority</label>
                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)] outline-none text-[var(--text-main)]">
                                <option>Low</option><option>Medium</option><option>High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="flex-1 py-4 bg-[var(--primary)] text-white font-black text-sm rounded-2xl hover:scale-[1.02] shadow-[var(--primary-glow)] transition-all">
                            {editingTask ? 'Save Changes' : 'Save to Calendar'}
                        </button>
                        {editingTask && (
                            <button type="button" onClick={() => { deleteCalendarTask(editingTask.id); onClose(); }} className="py-4 px-4 bg-red-500 text-white font-black text-sm rounded-2xl hover:scale-[1.02] transition-all">
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const EventDetailModal = ({ isOpen, onClose, evt, categories, goals, milestones }) => {
    if (!isOpen || !evt) return null;

    const { goalName, milestoneName } = (() => {
        let gName = '';
        let mName = '';
        if (evt.goalId) {
            gName = goals.find(g => g.id === evt.goalId)?.name || '';
        }
        if (evt.milestoneId) {
            mName = milestones.find(m => m.id === evt.milestoneId)?.name || '';
        }
        if (evt.id?.startsWith('ms-') && evt.isDerived) {
            const mId = evt.id.replace('ms-', '');
            const m = milestones.find(x => x.id === mId);
            if (m) {
                mName = m.name;
                gName = goals.find(g => g.id === m.goalId)?.name || '';
            }
        }
        if (evt.id?.startsWith('goal-') && evt.isDerived) {
            const gId = evt.id.replace('goal-', '');
            const g = goals.find(x => x.id === gId);
            if (g) gName = g.name;
        }
        return { goalName: gName, milestoneName: mName };
    })();

    const getCategoryColor = (catName) => {
        const cat = categories.find(c => c.name === catName);
        return cat ? cat.color : 'var(--primary)';
    };

    const color = getCategoryColor(evt.category);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} className="card relative w-full max-w-xl p-0 z-10 mx-auto overflow-hidden">
                <div style={{ background: color, height: '6px', width: '100%' }} />
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ background: `${color}15`, color }}>
                                    {evt.category}
                                </span>
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[var(--accent)] text-[var(--text-muted)]">
                                    {evt.priority} Priority
                                </span>
                            </div>
                            <h2 className="text-2xl font-black">{evt.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:bg-[var(--accent)] rounded-xl transition-colors"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">Date & Time</label>
                            <p className="font-bold text-sm">{format(parseISO(evt.date), 'MMMM d, yyyy')} • {evt.time}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">Status</label>
                            <p className="font-bold text-sm text-[var(--primary)]">{evt.status || 'Active'}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {(goalName || milestoneName) && (
                            <div className="p-5 bg-[var(--accent)] rounded-2xl space-y-4">
                                {goalName && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Parent Goal</label>
                                        <p className="font-bold text-[var(--primary)]">{goalName}</p>
                                    </div>
                                )}
                                {milestoneName && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-0.5">Associated Milestone</label>
                                        <p className="font-bold">{milestoneName}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {evt.description && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">Description</label>
                                <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed">
                                    {evt.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 pt-6 border-t border-[var(--border)] flex justify-end">
                        <button onClick={onClose} className="px-8 py-3 bg-[var(--accent)] text-[var(--text-main)] font-black text-xs rounded-xl hover:bg-[var(--border)] transition-colors">
                            Close Details
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Calendar = () => {
    const { goals, milestones, calendarTasks, addCalendarTask, categories, preferences, updateCalendarTask, deleteCalendarTask, searchQuery } = useStore();
    const [view, setView] = useState(preferences?.defaultCalendarView || 'Month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [modalTask, setModalTask] = useState(null); // null => create, object => edit
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Derived events from goals and milestones
    const derivedEvents = useMemo(() => {
        const goalEvents = goals
            .filter(g => g.targetDate)
            .map(g => ({
                id: `goal-${g.id}`,
                title: g.name,
                date: g.targetDate,
                time: '09:00',
                category: g.category || 'Strategic',
                priority: g.priority || 'High',
                description: g.description || '',
                isDerived: true
            }));

        const milestoneEvents = milestones
            .filter(m => m.dueDate)
            .map(m => {
                const goal = goals.find(g => g.id === m.goalId);
                return {
                    id: `ms-${m.id}`,
                    title: m.name,
                    date: m.dueDate,
                    time: '17:00',
                    category: m.category || goal?.category || 'Mission',
                    priority: m.priority || 'Medium',
                    description: m.description || '',
                    isDerived: true,
                    status: m.status
                };
            });

        return [...goalEvents, ...milestoneEvents];
    }, [goals, milestones]);

    const allEvents = useMemo(() => [...calendarTasks, ...derivedEvents], [calendarTasks, derivedEvents]);

    const filteredTasks = useMemo(() => {
        if (!searchQuery) return allEvents;
        const q = searchQuery.toLowerCase();
        return allEvents.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
        );
    }, [allEvents, searchQuery]);

    const velocity = useMemo(() => {
        if (milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === 'Completed').length;
        return Math.round((completed / milestones.length) * 100);
    }, [milestones]);

    // Build real calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const next = () => {
        if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'Week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'Week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const getCategoryColor = (catName) => {
        const cat = categories.find(c => c.name === catName);
        return cat ? cat.color : 'var(--primary)';
    };

    // Filter today's tasks
    const todaySchedule = filteredTasks
        .filter(t => isSameDay(parseISO(t.date), new Date()))
        .sort((a, b) => a.time.localeCompare(b.time));

    // Upcoming deadlines from tasks
    const upcomingDeadlines = filteredTasks
        .filter(t => isAfter(parseISO(t.date), new Date()) && !isSameDay(parseISO(t.date), new Date()))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Helper to get associated names
    const getAssociatedContext = (evt) => {
        let goalName = '';
        let milestoneName = '';

        if (evt.goalId) {
            goalName = goals.find(g => g.id === evt.goalId)?.name || '';
        }
        if (evt.milestoneId) {
            milestoneName = milestones.find(m => m.id === evt.milestoneId)?.name || '';
        }

        // If it's a derived milestone event, the "milestone" is the event itself
        if (evt.id?.startsWith('ms-') && evt.isDerived) {
            const mId = evt.id.replace('ms-', '');
            const m = milestones.find(x => x.id === mId);
            if (m) {
                milestoneName = m.name;
                goalName = goals.find(g => g.id === m.goalId)?.name || '';
            }
        }

        // If it's a derived goal event
        if (evt.id?.startsWith('goal-') && evt.isDerived) {
            const gId = evt.id.replace('goal-', '');
            const g = goals.find(x => x.id === gId);
            if (g) goalName = g.name;
        }

        return { goalName, milestoneName };
    };

    const EventTooltip = ({ evt, side = 'left' }) => {
        const { goalName, milestoneName } = getAssociatedContext(evt);
        const color = getCategoryColor(evt.category);

        return (
            <div className={`absolute z-[100] ${side === 'left' ? 'left-full ml-4' : 'right-full mr-4'} top-0 w-72 p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform scale-95 group-hover:scale-100 backdrop-blur-md`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{evt.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter" style={{ background: `${color}15`, color }}>
                        {evt.priority}
                    </span>
                </div>

                <h4 className="text-sm font-black mb-1 leading-tight">{evt.title}</h4>
                <p className="text-[10px] font-bold text-[var(--text-muted)] mb-4">{evt.date} • {evt.time}</p>

                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                    {goalName && (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Goal</span>
                            <span className="text-[11px] font-bold text-[var(--primary)]">{goalName}</span>
                        </div>
                    )}
                    {milestoneName && (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Milestone</span>
                            <span className="text-[11px] font-bold">{milestoneName}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center bg-[var(--accent)] p-2 rounded-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</span>
                        <span className="text-[10px] font-black text-[var(--primary)]">{evt.status || 'Active'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const handleEventClick = (e, evt) => {
        e.stopPropagation();
        setSelectedDetail(evt);
        setIsDetailOpen(true);
    };

    // View Renders
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const grid = [];
        for (let i = 0; i < days.length; i += 7) grid.push(days.slice(i, i + 7));

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>{day}</div>
                    ))}
                </div>
                {grid.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {week.map((day, dIdx) => {
                            const outOfRange = !isSameMonth(day, currentDate);
                            const active = isToday(day);
                            const events = filteredTasks.filter(t => t.date === format(day, 'yyyy-MM-dd'));

                            return (
                                <div key={dIdx} style={{
                                    minHeight: '120px', padding: '8px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', opacity: outOfRange ? 0.4 : 1, transition: 'all 0.2s',
                                }} className="hover:border-[var(--primary)] group/day cursor-pointer" onClick={() => { setModalTask({ title: '', description: '', date: format(day, 'yyyy-MM-dd'), time: '12:00', category: categories[0]?.name || 'Personal', priority: 'Medium' }); setIsModalOpen(true); }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: active ? 'var(--primary)' : 'transparent', color: active ? 'white' : 'var(--text-main)', fontWeight: 800, fontSize: '12px', marginBottom: '8px'
                                    }}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {events.slice(0, 4).map((evt, idx) => {
                                            const color = getCategoryColor(evt.category);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => handleEventClick(e, evt)}
                                                    className="relative group p-1.5 rounded-lg text-[9px] font-black overflow-hidden transition-all hover:ring-1 hover:ring-[var(--primary)]"
                                                    style={{ color: color, background: `${color}15` }}
                                                >
                                                    <span className="truncate block">{evt.title}</span>
                                                    <EventTooltip evt={evt} side={dIdx > 3 ? 'right' : 'left'} />
                                                </div>
                                            );
                                        })}
                                        {events.length > 4 && (
                                            <div className="text-[8px] font-black text-[var(--text-muted)] mt-1 px-1">
                                                + {events.length - 4} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const renderWeekView = () => {
        const startDate = startOfWeek(currentDate);
        const endDate = endOfWeek(currentDate);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                {days.map((day, dIdx) => {
                    const active = isToday(day);
                    const events = filteredTasks.filter(t => t.date === format(day, 'yyyy-MM-dd'));
                    return (
                        <div key={dIdx} className="card p-4 min-h-[450px] hover:border-[var(--primary)] cursor-pointer" onClick={() => { setModalTask({ title: '', description: '', date: format(day, 'yyyy-MM-dd'), time: '12:00', category: categories[0]?.name || 'Personal', priority: 'Medium' }); setIsModalOpen(true); }}>
                            <div className="text-center mb-6">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">{format(day, 'EEE')}</p>
                                <div style={{ width: '32px', height: '32px', margin: '0 auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--primary)' : 'var(--accent)', color: active ? 'white' : 'var(--text-main)', fontSize: '14px', fontWeight: 800 }}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {events.map((evt, idx) => {
                                    const color = getCategoryColor(evt.category);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={(e) => handleEventClick(e, evt)}
                                            className="p-3 rounded-xl border border-[var(--border)] group relative transition-all hover:scale-[1.02]"
                                            style={{
                                                background: `${color}12`,
                                                borderLeft: `4px solid ${color}`,
                                                borderColor: `${color}30`
                                            }}
                                        >
                                            <p className="text-[11px] font-black truncate" style={{ color }}>{evt.title}</p>
                                            <p className="text-[9px] font-bold mt-1" style={{ color: `${color}aa` }}>{evt.time}</p>
                                            <EventTooltip evt={evt} side={dIdx > 3 ? 'right' : 'left'} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const events = filteredTasks.filter(t => t.date === format(currentDate, 'yyyy-MM-dd'));
        return (
            <div className="card p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black">{format(currentDate, 'EEEE')}</h2>
                        <p className="text-sm font-bold text-[var(--text-muted)]">{format(currentDate, 'MMMM d, yyyy')}</p>
                    </div>
                    <div style={{ width: 60, height: 60, borderRadius: '20px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 800 }}>
                        {format(currentDate, 'd')}
                    </div>
                </div>
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="py-20 text-center text-[var(--text-muted)] font-black">No events scheduled today.</div>
                    ) : events.map((evt, idx) => {
                        const color = getCategoryColor(evt.category);
                        return (
                            <div
                                key={idx}
                                className="flex gap-6 p-6 rounded-2xl transition-all cursor-pointer group relative border"
                                style={{
                                    background: `${color}08`,
                                    borderColor: `${color}20`
                                }}
                                onClick={(e) => handleEventClick(e, evt)}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${color}12` }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = `${color}08` }}
                            >
                                <div className="text-sm font-black w-16" style={{ color }}>{evt.time}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                        <span className="text-[10px] font-black uppercase" style={{ color: `${color}bb` }}>{evt.category}</span>
                                    </div>
                                    <h4 className="text-lg font-black" style={{ color }}>{evt.title}</h4>
                                    <p className="text-sm font-medium line-clamp-2" style={{ color: `${color}aa` }}>{evt.description}</p>
                                </div>
                                <EventTooltip evt={evt} side="right" />
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 bg-[var(--bg-card)] rounded-xl font-black text-xs shadow-sm"
                                        style={{ color }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setModalTask(evt);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '32px' }}>

            {/* Left Main View */}
            <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>
                                {view === 'Day' ? format(currentDate, 'MMMM d, yyyy') : format(currentDate, 'MMMM yyyy')}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Visualize milestones, deadlines and goal progress.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <button onClick={prev} className="p-2 hover:bg-[var(--accent)] rounded-lg"><ChevronLeft size={20} /></button>
                            <button onClick={next} className="p-2 hover:bg-[var(--accent)] rounded-lg"><ChevronRight size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '9999px', padding: '4px', border: '1px solid var(--border)' }}>
                            {['Month', 'Week', 'Day'].map((v) => (
                                <button
                                    key={v} onClick={() => setView(v)}
                                    style={{ padding: '8px 20px', borderRadius: '9999px', background: view === v ? 'var(--primary)' : 'transparent', color: view === v ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => { setModalTask(null); setIsModalOpen(true); }}
                            className="bg-[var(--primary)] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] hover:scale-110 transition-transform"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Content Grid */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view + currentDate.toISOString()}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {view === 'Month' && renderMonthView()}
                            {view === 'Week' && renderWeekView()}
                            {view === 'Day' && renderDayView()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Legend (only for Month/Week) */}
                    {view !== 'Day' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', marginTop: '24px', paddingLeft: '8px' }}>
                            {categories.map(c => (
                                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{c.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar Stats & Schedule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="card" style={{ padding: '16px', background: 'var(--primary-glow)', border: 'none' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>Scheduled Today</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', mt: '4px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{todaySchedule.length}</h3>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Total Tasks</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', mt: '4px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{filteredTasks.length}</h3>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Today's Schedule</h3>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {todaySchedule.length === 0 ? (
                            <div className="p-6 text-center text-sm font-bold text-[var(--text-muted)]">No tasks scheduled for today.</div>
                        ) : todaySchedule.map((ts, i) => (
                            <div key={i} style={{ padding: '16px', borderBottom: i < todaySchedule.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ borderLeft: `3px solid ${getCategoryColor(ts.category)}`, paddingLeft: '12px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{ts.title}</p>
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{ts.category}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Upcoming Deadlines</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {upcomingDeadlines.length === 0 ? (
                            <div className="text-sm font-bold text-[var(--text-muted)]">No upcoming tasks found.</div>
                        ) : upcomingDeadlines.map((ud, i) => {
                            const d = parseISO(ud.date);
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>{format(d, 'MMM')}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 800 }}>{format(d, 'dd')}</span>
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: '16px', borderBottom: '2px solid var(--border)', position: 'relative' }}>
                                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{ud.title}</p>
                                        <div style={{ position: 'absolute', bottom: '-2px', left: 0, width: '40%', height: '2px', background: 'var(--primary)' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))', borderRadius: '16px', padding: '24px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '140px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Goal Velocity: +{velocity}%</h4>
                        <p style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>System Status: Optimal</p>
                    </div>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.2)', filter: 'blur(30px)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)', borderRadius: '50%' }} />
                </div>
            </div>

            <AnimatePresence>
                <CreateTaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setModalTask(null); }} addCalendarTask={addCalendarTask} categories={categories} editingTask={modalTask} updateCalendarTask={updateCalendarTask} deleteCalendarTask={deleteCalendarTask} />
                <EventDetailModal isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setSelectedDetail(null); }} evt={selectedDetail} categories={categories} goals={goals} milestones={milestones} />
            </AnimatePresence>
        </motion.div>
    );
};

export default Calendar;
