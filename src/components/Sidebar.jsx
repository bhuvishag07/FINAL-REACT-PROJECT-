import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    BarChart3,
    Target,
    Map,
    CheckCircle2,
    LayoutDashboard,
    Calendar as CalendarIcon,
    Settings as SettingsIcon,
    Maximize2,
    ListChecks,
    ListTodo,
    Plus,
    FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';

const MilestoneHubLogo = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx="10" fill="var(--primary)" />
        <path d="M10 12H8.5C7.67 12 7 12.67 7 13.5V14.5C7 16.99 9.01 19 11.5 19H12M24 12H25.5C26.33 12 27 12.67 27 13.5V14.5C27 16.99 24.99 19 22.5 19H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19C12 21.76 14.24 24 17 24C19.76 24 22 21.76 22 19V9H12V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 24V28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 28H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Sidebar = () => {
    const setIsCreateGoalOpen = useStore((state) => state.setIsCreateGoalOpen);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Timeline Universe', icon: Map, path: '/timeline' },
        { name: 'Milestones', icon: CheckCircle2, path: '/milestones' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'Calendar', icon: CalendarIcon, path: '/calendar' },
        { name: 'Goals', icon: Target, path: '/goals' },
        { name: 'Categories', icon: ListChecks, path: '/categories' },
        { name: 'Todos', icon: ListTodo, path: '/todos' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'Focus Mode', icon: Maximize2, path: '/focus' },
    ];

    return (
        <div
            style={{
                width: '260px',
                minWidth: '260px',
                height: '100vh',
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                overflow: 'hidden',
            }}
            className="hidden lg:flex"
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
                <MilestoneHubLogo />
                <div>
                    <h1 style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1.2 }}>Milestone Hub</h1>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>Premium Productivity</p>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div style={{
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                <button
                    onClick={() => setIsCreateGoalOpen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, opacity 0.15s',
                        marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.opacity = '0.95'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                >
                    <Plus size={18} /> Create New Goal
                </button>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'active' : ''}`
                    }
                >
                    <SettingsIcon size={18} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
