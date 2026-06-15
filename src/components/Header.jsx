import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, X, Check, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const darkMode = useStore((state) => state.darkMode);
    const setDarkMode = useStore((state) => state.setDarkMode);
    const user = useStore((state) => state.user);
    const notifications = useStore((state) => state.notifications);
    const markNotificationRead = useStore((state) => state.markNotificationRead);
    const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);
    const deleteNotification = useStore((state) => state.deleteNotification);
    const searchQuery = useStore((state) => state.searchQuery);
    const setSearchQuery = useStore((state) => state.setSearchQuery);
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        const map = {
            '/timeline': 'Timeline Universe',
            '/milestones': 'Milestones',
            '/analytics': 'Analytics',
            '/goals': 'Goals',
            '/calendar': 'Calendar',
            '/categories': 'Categories',
            '/focus': 'Focus Mode',
            '/todos': 'Todos',
            '/settings': 'Settings',
        };
        return map[path] || 'Dashboard';
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#f59e0b';
            default: return '#10b981';
        }
    };

    return (
        <header
            style={{
                height: '68px',
                background: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border)',
                padding: '0 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexShrink: 0,
            }}
        >
            {/* Left: search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ position: 'relative', maxWidth: '360px', width: '100%' }} className="hidden md:block">
                    <Search
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }}
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search goals, milestones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'var(--accent)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 14px 10px 38px',
                            fontSize: '13px',
                            color: 'var(--text-main)',
                            outline: 'none',
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Dark mode toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.target.style.background = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '8px',
                                    height: '8px',
                                    background: '#ef4444',
                                    borderRadius: '50%',
                                    border: '2px solid var(--bg-sidebar)',
                                }}
                            />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                    onClick={() => setShowNotifications(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        marginTop: '8px',
                                        width: '340px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                                        zIndex: 50,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '14px 16px',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'var(--accent)',
                                        }}
                                    >
                                        <h3 style={{ fontWeight: 800, fontSize: '13px' }}>Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => markAllNotificationsRead()}
                                                style={{
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    color: 'var(--primary)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <Bell size={24} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                                <p style={{ fontSize: '13px', fontWeight: 600 }}>No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 8).map((n) => (
                                                <div
                                                    key={n.id}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom: '1px solid var(--border)',
                                                        cursor: 'pointer',
                                                        background: !n.read ? 'var(--accent)' : 'transparent',
                                                        transition: 'background 0.15s',
                                                        display: 'flex',
                                                        gap: '10px',
                                                        alignItems: 'flex-start',
                                                    }}
                                                    onClick={() => markNotificationRead(n.id)}
                                                >
                                                    <div
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: getPriorityColor(n.priority),
                                                            marginTop: '6px',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {n.type}
                                                        </p>
                                                        <p style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>{n.title}</p>
                                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingLeft: '12px',
                        borderLeft: '1px solid var(--border)',
                        marginLeft: '4px',
                    }}
                >
                    <div className="hidden sm:block" style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{user.name}</p>
                        <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.profession}</p>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px var(--primary-glow)',
                            transition: 'transform 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {user.avatar}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
