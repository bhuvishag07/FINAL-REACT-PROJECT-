import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
    Palette, User, Database, Download, Upload, Trash2, Check, Save,
    Settings as SettingsIcon, Info, AlertTriangle, X, FileJson, RefreshCw, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeOption = ({ id, name, active, onClick, gradient }) => (
    <button
        onClick={() => onClick(id)}
        className={`card p-4 text-left group relative transition-all ${active ? 'border-[var(--text-main)] ring-2 ring-[var(--text-main)] ring-opacity-20' : 'hover:border-[var(--text-muted)]'}`}
        style={{ cursor: 'pointer' }}
    >
        <div className="h-24 rounded-xl mb-4 p-3 flex flex-col justify-between" style={{ background: gradient }}>
            <div className="flex gap-1">
                <div className="w-4 h-1 rounded-full bg-white bg-opacity-40"></div>
                <div className="w-2 h-1 rounded-full bg-white bg-opacity-40"></div>
            </div>
            <div className="space-y-1">
                <div className="w-12 h-1.5 rounded-full bg-white bg-opacity-40"></div>
                <div className="w-8 h-1.5 rounded-full bg-white bg-opacity-40"></div>
            </div>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest">{name}</span>
            {active && <div className="w-5 h-5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] flex items-center justify-center"><Check size={12} /></div>}
        </div>
    </button>
);

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl p-4 flex flex-col gap-1 shadow-lg"
            style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${type === 'error' ? '#ef4444' : 'var(--success)'}`
            }}
        >
            <div className="flex items-center gap-3">
                {type === 'error' ? <AlertTriangle size={18} color="#ef4444" /> : <Check size={18} color="var(--success)" />}
                <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{message}</p>
                <button onClick={onClose} className="ml-4 p-1 hover:bg-[var(--accent)] rounded-lg">
                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
            </div>
        </motion.div>
    );
};

const Settings = () => {
    const {
        themeBase, setThemeBase,
        goals, milestones, todos, calendarTasks, focusSessions, user, updateUser,
        preferences, setPreferences,
        importData, clearWorkspaceData, resetSettings, getExportData
    } = useStore();

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState(user);
    const [activeTab, setActiveTab] = useState('appearance');

    // Modals & Toasts
    const [toast, setToast] = useState(null);
    const [showResetModal, setShowResetModal] = useState({ isOpen: false, type: null }); // 'data' | 'settings'

    const showToast = (message, type = 'success') => setToast({ message, type });

    const themes = [
        { id: 'royal-purple', name: 'Royal Purple', gradient: 'linear-gradient(to bottom right, #7c3aed, #5b21b6)' },
        { id: 'pink-blossom', name: 'Pink Blossom', gradient: 'linear-gradient(to bottom right, #ec4899, #be185d)' },
        { id: 'ocean-blue', name: 'Ocean Blue', gradient: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' },
        { id: 'emerald-green', name: 'Emerald Green', gradient: 'linear-gradient(to bottom right, #10b981, #059669)' }
    ];

    const handleSaveProfile = () => {
        updateUser(profileForm);
        setEditingProfile(false);
        showToast('Profile updated successfully');
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data && data.version && Array.isArray(data.goals)) {
                    importData(data);
                    showToast(`Workspace imported: ${data.goals.length} Goals, ${data.milestones?.length || 0} Milestones`);
                } else {
                    throw new Error('Invalid schema');
                }
            } catch (err) {
                showToast('Invalid workspace file structure. Must be valid JSON.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const downloadFile = (dataObj, filename) => {
        const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    const handleExport = () => downloadFile(getExportData(), `milestone-hub-export-${new Date().toISOString().split('T')[0]}.json`);

    const handleDownloadSample = () => {
        const sample = {
            version: '2.0.0', goals: [], milestones: [], todos: [], calendarTasks: [], categories: useStore.getState().categories, user: useStore.getState().user
        };
        downloadFile(sample, 'blank-workspace.json');
        showToast('Sample workspace downloaded');
    };

    const confirmAction = () => {
        if (showResetModal.type === 'data') {
            clearWorkspaceData();
            showToast('Workspace data has been cleared');
        } else if (showResetModal.type === 'settings') {
            resetSettings();
            showToast('Application settings reset to default');
        }
        setShowResetModal({ isOpen: false, type: null });
    };

    const getStorageSize = () => {
        try {
            const data = localStorage.getItem('milestone-hub-storage');
            return data ? (new Blob([data]).size / 1024).toFixed(2) + ' KB' : '0 KB';
        } catch { return 'Unknown'; }
    };

    const tabs = [
        { name: 'Appearance', icon: Palette, id: 'appearance' },
        { name: 'Preferences', icon: SettingsIcon, id: 'preferences' },
        { name: 'Data Management', icon: Database, id: 'data' },
        { name: 'Profile', icon: User, id: 'profile' },
        { name: 'App Info', icon: Info, id: 'info' }
    ];

    const Toggle = ({ label, checked, onChange, info }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{label}</span>
                {info && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{info}</span>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '44px', padding: '3px', borderRadius: '22px', border: 'none', cursor: 'pointer',
                    background: checked ? 'var(--success)' : 'var(--text-muted)',
                    display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
                    transition: 'all 0.2s', opacity: checked ? 1 : 0.4
                }}
            >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </button>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '40px' }} className="max-w-6xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-black mb-2">System Settings</h1>
                <p className="text-[var(--text-muted)] font-medium">Customize your environment and milestone tracking preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-3 flex flex-col gap-2">
                    {tabs.map((item) => (
                        <button
                            key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all
                                ${activeTab === item.id ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--text-main)]'}
                            `}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-9 space-y-12">

                    {activeTab === 'appearance' && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h2 className="text-2xl font-black">Appearance</h2>
                                <p className="text-sm text-[var(--text-muted)] font-bold mt-1">Customize the visual language and workspace interface.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {themes.map((t) => (
                                            <ThemeOption key={t.id} id={t.id} name={t.name} gradient={t.gradient} active={themeBase === t.id} onClick={(id) => { setThemeBase(id); showToast(`${t.name} theme applied!`); }} />
                                        ))}
                                    </div>
                        </section>
                    )}

                    {activeTab === 'preferences' && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h2 className="text-2xl font-black">System Preferences</h2>
                                <p className="text-sm text-[var(--text-muted)] font-bold mt-1">Control your interface behaviour.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>Default Dashboard Page</label>
                                    <select
                                        value={preferences?.defaultPage || '/'}
                                        onChange={(e) => setPreferences({ defaultPage: e.target.value })}
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        <option value="/">Overview (Dashboard)</option>
                                        <option value="/goals">Goals List</option>
                                        <option value="/calendar">Calendar</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>Default Calendar View</label>
                                    <select
                                        value={preferences?.defaultCalendarView || 'Month'}
                                        onChange={(e) => setPreferences({ defaultCalendarView: e.target.value })}
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        <option value="Month">Month View</option>
                                        <option value="Week">Week View</option>
                                        <option value="Day">Day View</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Toggle label="Enable Animations" info="Allows Framer Motion layout transitions" checked={preferences?.animationEnabled ?? true} onChange={(v) => { setPreferences({ animationEnabled: v }); window.location.reload(); }} />
                                <Toggle label="Compact UI Mode" info="Reduces padding constraints slightly" checked={preferences?.compactMode ?? false} onChange={(v) => { setPreferences({ compactMode: v }); window.location.reload(); }} />
                                <Toggle label="Auto-Save Data" info="Continuously sync state to localStorage" checked={preferences?.autoSave ?? true} onChange={(v) => { setPreferences({ autoSave: v }); showToast(v ? 'Auto-save enabled' : 'Auto-save disabled (Persist may still trigger)'); }} />
                            </div>
                        </section>
                    )}

                    {activeTab === 'profile' && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h2 className="text-2xl font-black">User Profile</h2>
                                <p className="text-sm text-[var(--text-muted)] font-bold mt-1">Manage your profile information and identity.</p>
                            </div>

                            {!editingProfile ? (
                                <div className="card p-8 bg-[var(--bg-card)]">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-main)] font-black text-2xl shadow-lg">
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black">{user.name}</h3>
                                                <p className="text-[var(--text-muted)] font-bold">{user.profession}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setEditingProfile(true)} className="px-6 py-3 bg-[var(--accent)] text-[var(--text-main)] rounded-xl font-black text-sm hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all">
                                            Edit Profile
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Bio</p>
                                            <p className="text-sm font-medium">{user.bio}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card p-8 space-y-6 bg-[var(--bg-card)]">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Full Name</label>
                                        <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--text-main)] outline-none text-[var(--text-main)]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Profession</label>
                                        <input type="text" value={profileForm.profession} onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--text-main)] outline-none text-[var(--text-main)]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Bio</label>
                                        <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="w-full bg-[var(--accent)] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[var(--text-main)] outline-none min-h-[100px] text-[var(--text-main)]" />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button onClick={() => { setEditingProfile(false); setProfileForm(user); }} className="flex-1 px-6 py-4 rounded-2xl font-black text-sm border border-[var(--border)] hover:bg-[var(--accent)]">Cancel</button>
                                        <button onClick={handleSaveProfile} className="flex-1 bg-[var(--success)] text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2"><Save size={16} /> Save Changes</button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'data' && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h2 className="text-2xl font-black">Data Management</h2>
                                <p className="text-sm text-[var(--text-muted)] font-bold mt-1">Export, import or clear your mission data and local storage.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card p-8 space-y-6 flex flex-col justify-between bg-[var(--bg-card)]">
                                    <div>
                                        <div className="flex items-center gap-3 text-[var(--text-main)] mb-2">
                                            <Upload size={24} />
                                            <h4 className="font-black text-lg">Import Workspace</h4>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] font-bold leading-relaxed mb-4">Restore workspace from a .json or .txt export file. Validates schema before overwriting.</p>
                                    </div>
                                    <label className="block w-full py-4 border-2 border-dashed border-[var(--text-main)] text-[var(--text-main)] font-black text-sm rounded-2xl cursor-pointer text-center hover:bg-[var(--accent)] transition-colors">
                                        Select .JSON / .TXT File
                                        <input type="file" className="hidden" accept=".json,.txt" onChange={handleImport} />
                                    </label>
                                </div>

                                <div className="card p-8 space-y-6 flex flex-col justify-between bg-[var(--bg-card)]">
                                    <div>
                                        <div className="flex items-center gap-3 text-[var(--success)] mb-2">
                                            <Download size={24} />
                                            <h4 className="font-black text-lg">Export Workspace</h4>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] font-bold leading-relaxed mb-4">Download a complete snapshot of your goals, milestones, and settings.</p>
                                    </div>
                                    <button onClick={handleExport} className="w-full py-4 bg-[var(--success)] text-white font-black text-sm rounded-2xl hover:scale-[1.02] shadow-lg transition-transform">
                                        Generate Export File
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <button onClick={handleDownloadSample} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--text-main)]">
                                    <FileText size={16} /> Blank Sample
                                </button>
                                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--text-main)]">
                                    <FileJson size={16} /> Current Backup (Demo)
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="card p-6 border border-orange-500/20 bg-[var(--bg-card)]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <RefreshCw size={24} className="text-orange-500" />
                                        <div>
                                            <h4 className="font-black text-orange-500">Reset Settings</h4>
                                            <p className="text-xs text-[var(--text-muted)] font-bold">Resets theme and preferences. Keeps data.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowResetModal({ isOpen: true, type: 'settings' })} className="w-full py-3 bg-orange-500/10 text-orange-500 font-black text-sm rounded-xl hover:bg-orange-500 hover:text-white transition-colors">
                                        Reset Preferences
                                    </button>
                                </div>

                                <div className="card p-6 border border-red-500/20 bg-[var(--bg-card)]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Trash2 size={24} className="text-red-500" />
                                        <div>
                                            <h4 className="font-black text-red-500">Clear Workspace</h4>
                                            <p className="text-xs text-[var(--text-muted)] font-bold">Irreversibly deletes all tasks and milestones.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowResetModal({ isOpen: true, type: 'data' })} className="w-full py-3 bg-red-500/10 text-red-500 font-black text-sm rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                        Purge All Data
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'info' && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h2 className="text-2xl font-black">Application Information</h2>
                                <p className="text-sm text-[var(--text-muted)] font-bold mt-1">Platform telemetry and workspace statistics.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[
                                    { label: 'Total Goals', value: goals.length },
                                    { label: 'Total Milestones', value: milestones.length },
                                    { label: 'Completed Milestones', value: milestones.filter(m => m.status === 'Completed').length },
                                    { label: 'Completion Rate', value: `${Math.round((milestones.filter(m => m.status === 'Completed').length / Math.max(1, milestones.length)) * 100)}%` },
                                    { label: 'Current Theme', value: themeBase },
                                    { label: 'Storage Used', value: getStorageSize() },
                                ].map((stat, i) => (
                                    <div key={i} className="card p-6 text-center bg-[var(--bg-card)]">
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.label}</p>
                                        <h3 className="text-2xl font-black">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-black mb-2">Advanced</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="card p-6 bg-[var(--bg-card)]">
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Last Modified</p>
                                        <p className="font-black">{(() => {
                                            try {
                                                const raw = localStorage.getItem('milestone-hub-storage');
                                                if (!raw) return 'Never';
                                                const parsed = JSON.parse(raw);
                                                // try common fields
                                                if (parsed?.state?.exportDate) return new Date(parsed.state.exportDate).toLocaleString();
                                                if (parsed?.exportDate) return new Date(parsed.exportDate).toLocaleString();
                                                return 'Unknown';
                                            } catch { return 'Unknown'; }
                                        })()}</p>
                                    </div>
                                    <div className="card p-6 bg-[var(--bg-card)]">
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">LocalStorage Key</p>
                                        <p className="font-black">milestone-hub-storage</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showResetModal.isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetModal({ isOpen: false, type: null })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} className="card relative w-full max-w-sm p-8 z-10 mx-auto text-center bg-[var(--bg-card)]">
                            <div className={`w-16 h-16 ${showResetModal.type === 'data' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-xl font-black mb-2 text-[var(--text-main)]">Are you sure?</h2>
                            <p className="text-sm font-medium text-[var(--text-muted)] mb-8">
                                {showResetModal.type === 'data' ? 'This immediately deletes your tracked goals, milestones, and tasks.' : 'This resets visual themes and toggles to default.'} This cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowResetModal({ isOpen: false, type: null })} className="flex-1 py-3 px-4 font-bold border border-[var(--border)] text-[var(--text-main)] rounded-xl hover:bg-[var(--accent)]">Cancel</button>
                                <button onClick={confirmAction} className={`flex-1 py-3 px-4 font-bold text-white rounded-xl ${showResetModal.type === 'data' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                                    {showResetModal.type === 'data' ? 'Clear Data' : 'Reset Settings'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default Settings;
