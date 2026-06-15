import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Demo starter workspace data (only used to initialize when localStorage is empty)
const demoGoals = [
    { id: 'g1', name: 'Become a React Developer', category: 'Education', targetDate: '2026-08-31', description: 'Master React and build production-ready apps.', progress: 62, archived: false, priority: 'High', createdAt: '2026-06-01T08:00:00Z' },
    { id: 'g2', name: 'Master Python for Data Science', category: 'Education', targetDate: '2026-09-15', description: 'Gain practical data science skills with Python.', progress: 28, archived: false, priority: 'High', createdAt: '2026-06-01T08:00:00Z' },
    { id: 'g3', name: 'Save ₹50,000', category: 'Finance', targetDate: '2026-09-30', description: 'Structured savings plan to reach a financial goal.', progress: 50, archived: false, priority: 'Medium', createdAt: '2026-06-01T08:00:00Z' },
    { id: 'g4', name: 'Fitness Transformation', category: 'Health', targetDate: '2026-08-31', description: 'Improve fitness and reach target weight.', progress: 40, archived: false, priority: 'High', createdAt: '2026-06-01T08:00:00Z' },
    { id: 'g5', name: 'Build Strong DSA Foundation', category: 'Education', targetDate: '2026-09-15', description: 'Core data structures & algorithms mastery.', progress: 57, archived: false, priority: 'High', createdAt: '2026-06-01T08:00:00Z' },
    { id: 'g6', name: 'Personal Growth Journey', category: 'Personal', targetDate: '2026-09-30', description: 'Habits and personal development.', progress: 33, archived: false, priority: 'Medium', createdAt: '2026-06-01T08:00:00Z' },
];

const demoMilestones = [
    { id: 'g1-m1', goalId: 'g1', name: 'Learn HTML & CSS', status: 'Completed', priority: 'Medium', dueDate: '2026-03-01', dependencies: [], order: 0 },
    { id: 'g1-m2', goalId: 'g1', name: 'Learn JavaScript ES6', status: 'Completed', priority: 'Medium', dueDate: '2026-04-01', dependencies: [], order: 1 },
    { id: 'g1-m3', goalId: 'g1', name: 'Learn React Fundamentals', status: 'Completed', priority: 'High', dueDate: '2026-06-01', dependencies: [], order: 2 },
    { id: 'g1-m4', goalId: 'g1', name: 'Build FAQify Project', status: 'Pending', priority: 'High', dueDate: '2026-07-10', dependencies: ['g1-m3'], order: 3 },
    { id: 'g1-m5', goalId: 'g1', name: 'Build Milestone Hub Project', status: 'Pending', priority: 'High', dueDate: '2026-08-15', dependencies: ['g1-m4'], order: 4 },
    { id: 'g1-m6', goalId: 'g1', name: 'Learn React Router', status: 'Completed', priority: 'Medium', dueDate: '2026-05-10', dependencies: ['g1-m3'], order: 5 },
    { id: 'g1-m7', goalId: 'g1', name: 'Learn Zustand', status: 'Completed', priority: 'Medium', dueDate: '2026-05-25', dependencies: ['g1-m3'], order: 6 },
    { id: 'g1-m8', goalId: 'g1', name: 'Deploy Portfolio Website', status: 'Pending', priority: 'Medium', dueDate: '2026-09-01', dependencies: ['g1-m5'], order: 7 },

    // Goal 2
    { id: 'g2-m1', goalId: 'g2', name: 'Python Basics', status: 'Completed', priority: 'Medium', dueDate: '2026-03-15', dependencies: [], order: 0 },
    { id: 'g2-m2', goalId: 'g2', name: 'Functions and OOP', status: 'Completed', priority: 'Medium', dueDate: '2026-04-15', dependencies: [], order: 1 },
    { id: 'g2-m3', goalId: 'g2', name: 'NumPy', status: 'Pending', priority: 'Medium', dueDate: '2026-06-20', dependencies: [], order: 2 },
    { id: 'g2-m4', goalId: 'g2', name: 'Pandas', status: 'Pending', priority: 'High', dueDate: '2026-07-05', dependencies: ['g2-m3'], order: 3 },
    { id: 'g2-m5', goalId: 'g2', name: 'Matplotlib', status: 'Pending', priority: 'Low', dueDate: '2026-07-20', dependencies: [], order: 4 },
    { id: 'g2-m6', goalId: 'g2', name: 'Data Analysis Project', status: 'Pending', priority: 'High', dueDate: '2026-08-15', dependencies: ['g2-m4'], order: 5 },
    { id: 'g2-m7', goalId: 'g2', name: 'Machine Learning Basics', status: 'Pending', priority: 'High', dueDate: '2026-09-01', dependencies: ['g2-m6'], order: 6 },

    // Goal 3 savings milestones
    { id: 'g3-m1', goalId: 'g3', name: 'Save ₹5,000', status: 'Completed', priority: 'Medium', dueDate: '2026-02-01', dependencies: [], order: 0 },
    { id: 'g3-m2', goalId: 'g3', name: 'Save ₹10,000', status: 'Completed', priority: 'Medium', dueDate: '2026-04-01', dependencies: [], order: 1 },
    { id: 'g3-m3', goalId: 'g3', name: 'Save ₹20,000', status: 'Completed', priority: 'High', dueDate: '2026-06-10', dependencies: [], order: 2 },
    { id: 'g3-m4', goalId: 'g3', name: 'Save ₹30,000', status: 'Pending', priority: 'High', dueDate: '2026-07-30', dependencies: [], order: 3 },
    { id: 'g3-m5', goalId: 'g3', name: 'Save ₹40,000', status: 'Pending', priority: 'High', dueDate: '2026-08-30', dependencies: [], order: 4 },
    { id: 'g3-m6', goalId: 'g3', name: 'Save ₹50,000', status: 'Pending', priority: 'High', dueDate: '2026-09-30', dependencies: [], order: 5 },

    // Goal 4 fitness
    { id: 'g4-m1', goalId: 'g4', name: 'Join Gym', status: 'Completed', priority: 'Medium', dueDate: '2026-02-10', dependencies: [], order: 0 },
    { id: 'g4-m2', goalId: 'g4', name: 'Complete First Month', status: 'Completed', priority: 'Medium', dueDate: '2026-03-15', dependencies: ['g4-m1'], order: 1 },
    { id: 'g4-m3', goalId: 'g4', name: 'Lose 3kg', status: 'Pending', priority: 'High', dueDate: '2026-06-30', dependencies: ['g4-m2'], order: 2 },
    { id: 'g4-m4', goalId: 'g4', name: 'Lose 5kg', status: 'Pending', priority: 'High', dueDate: '2026-07-30', dependencies: ['g4-m3'], order: 3 },
    { id: 'g4-m5', goalId: 'g4', name: 'Reach Target Weight', status: 'Pending', priority: 'High', dueDate: '2026-08-31', dependencies: ['g4-m4'], order: 4 },

    // Goal 5 DSA
    { id: 'g5-m1', goalId: 'g5', name: 'Arrays', status: 'Completed', priority: 'Medium', dueDate: '2026-03-01', dependencies: [], order: 0 },
    { id: 'g5-m2', goalId: 'g5', name: 'Strings', status: 'Completed', priority: 'Medium', dueDate: '2026-04-01', dependencies: ['g5-m1'], order: 1 },
    { id: 'g5-m3', goalId: 'g5', name: 'Linked Lists', status: 'Completed', priority: 'High', dueDate: '2026-06-05', dependencies: ['g5-m2'], order: 2 },
    { id: 'g5-m4', goalId: 'g5', name: 'Stacks and Queues', status: 'Completed', priority: 'High', dueDate: '2026-06-12', dependencies: ['g5-m3'], order: 3 },
    { id: 'g5-m5', goalId: 'g5', name: 'Trees', status: 'Pending', priority: 'High', dueDate: '2026-08-01', dependencies: ['g5-m4'], order: 4 },
    { id: 'g5-m6', goalId: 'g5', name: 'Graphs', status: 'Pending', priority: 'High', dueDate: '2026-08-20', dependencies: ['g5-m5'], order: 5 },
    { id: 'g5-m7', goalId: 'g5', name: 'Dynamic Programming', status: 'Pending', priority: 'High', dueDate: '2026-09-10', dependencies: ['g5-m6'], order: 6 },

    // Goal 6 personal growth
    { id: 'g6-m1', goalId: 'g6', name: 'Daily Reading Habit', status: 'Completed', priority: 'Low', dueDate: '2026-02-01', dependencies: [], order: 0 },
    { id: 'g6-m2', goalId: 'g6', name: 'Wake Up Before 7 AM', status: 'Completed', priority: 'Low', dueDate: '2026-03-01', dependencies: [], order: 1 },
    { id: 'g6-m3', goalId: 'g6', name: 'Read 10 Books', status: 'Completed', priority: 'Medium', dueDate: '2026-04-20', dependencies: [], order: 2 },
    { id: 'g6-m4', goalId: 'g6', name: '30 Days Meditation', status: 'Pending', priority: 'Medium', dueDate: '2026-06-20', dependencies: [], order: 3 },
    { id: 'g6-m5', goalId: 'g6', name: 'Maintain Journal', status: 'Pending', priority: 'Low', dueDate: '2026-07-10', dependencies: [], order: 4 },
    { id: 'g6-m6', goalId: 'g6', name: 'Complete Personal Development Course', status: 'Pending', priority: 'High', dueDate: '2026-08-01', dependencies: [], order: 5 },
];

const demoCategories = [
    { id: 'cat-edu', name: 'Education', color: '#6366F1', icon: '📚' },
    { id: 'cat-health', name: 'Health', color: '#EF4444', icon: '🏋️' },
    { id: 'cat-fin', name: 'Finance', color: '#10B981', icon: '💰' },
    { id: 'cat-personal', name: 'Personal', color: '#8B5CF6', icon: '🌱' },
];

const demoTodos = [
    { id: 'dt1', text: 'Start React Router guide', completed: false, priority: 'High', category: 'Education', goalId: 'g1', createdAt: '2026-06-05T10:00:00Z' },
    { id: 'dt2', text: 'Plan FAQify project sprint', completed: false, priority: 'High', category: 'Education', goalId: 'g1', createdAt: '2026-06-06T10:00:00Z' },
    { id: 'dt3', text: 'Set monthly savings transfer', completed: true, priority: 'Medium', category: 'Finance', goalId: 'g3', createdAt: '2026-06-01T10:00:00Z' },
];

// Demo calendar events (realistic study/sprint/workout sessions)
const demoCalendarTasks = [
    { id: 'cal-1', title: 'React Router Study Session', description: 'Routing deep-dive with hands-on exercises', date: '2026-07-12', time: '18:00', category: 'Education', priority: 'High', goalId: 'g1' },
    { id: 'cal-2', title: 'FAQify Development Sprint', description: 'Build core features for FAQify', date: '2026-07-20', time: '10:00', category: 'Education', priority: 'High', goalId: 'g1' },
    { id: 'cal-3', title: 'Milestone Hub Development Sprint', description: 'Work on Milestone Hub features', date: '2026-08-10', time: '09:00', category: 'Education', priority: 'High', goalId: 'g1' },
    { id: 'cal-4', title: 'Portfolio Deployment', description: 'Deploy portfolio to production', date: '2026-09-02', time: '14:00', category: 'Education', priority: 'Medium', goalId: 'g1' },
    { id: 'cal-5', title: 'DSA Practice Session', description: 'Linked lists and stacks practice', date: '2026-06-18', time: '20:00', category: 'Education', priority: 'High', goalId: 'g5' },
    { id: 'cal-6', title: 'NumPy Workshop', description: 'Hands-on NumPy examples', date: '2026-06-20', time: '16:00', category: 'Education', priority: 'Medium', goalId: 'g2' },
    { id: 'cal-7', title: 'Pandas Learning Session', description: 'Dataframes deep-dive', date: '2026-07-06', time: '16:00', category: 'Education', priority: 'High', goalId: 'g2' },
    { id: 'cal-8', title: 'Gym Workout', description: 'Full body workout', date: '2026-06-13', time: '07:00', category: 'Health', priority: 'Medium', goalId: 'g4' },
    { id: 'cal-9', title: 'Budget Planning Session', description: 'Monthly savings planning', date: '2026-06-25', time: '19:00', category: 'Finance', priority: 'Medium', goalId: 'g3' },
    { id: 'cal-10', title: 'Weekly Goal Review', description: 'Review progress on goals', date: '2026-06-14', time: '09:00', category: 'Personal', priority: 'Low' },
];

export const useStore = create(
    persist(
        (set, get) => ({
            // ======== USER PROFILE ========
            user: {
                name: 'Bhuvisha Gohil',
                profession: 'STUDENT',
                bio: 'Mastering the art of product development and building exceptional project management tools.',
                studyFocus: 'React & Data Science',
                careerGoal: 'Founding Engineer at a high-growth startup',
                avatar: 'BG',
            },

            // ======== GOALS ========
            goals: demoGoals,
            milestones: demoMilestones,
            categories: demoCategories,

            // ======== THEME ========
            // Default to Royal Purple (light) on first load
            themeBase: 'royal-purple',
            darkMode: false,
            theme: 'royal-purple-light',

            // ======== TODOS ========
            todos: demoTodos,

            // ======== NOTIFICATIONS ========
            notifications: [
                { id: 'n1', type: 'deadline', title: 'Zero-Downtime Migration due soon', message: 'Complete migration before July 15th deadline', priority: 'high', read: false, timestamp: '2026-06-12T10:00:00Z' },
                { id: 'n2', type: 'overdue', title: 'Milestone approaching deadline', message: 'Load Testing Phase 1 is due August 1st', priority: 'medium', read: false, timestamp: '2026-06-12T08:00:00Z' },
                { id: 'n3', type: 'progress', title: 'Weekly Summary', message: 'You completed 2 milestones this week. Great progress!', priority: 'low', read: true, timestamp: '2026-06-11T18:00:00Z' },
            ],

            // ======== FOCUS MODE ========
            focusSettings: {
                duration: 25,
                selectedGoalId: null,
                selectedMilestoneId: null,
            },
            focusSessions: [],
            dailyFocusMinutes: 0,

            // ======== CALENDAR TASKS ========
            calendarTasks: demoCalendarTasks,

            // ======== NOTIFICATION PREFERENCES ========
            notificationPrefs: {
                deadlineAlerts: true,
                milestoneAlerts: true,
                goalCompletionAlerts: true,
            },

            // ======== SEARCH STATE ========
            searchQuery: '',

            // ======== PREFERENCES ========
            preferences: {
                defaultPage: '/',
                defaultCalendarView: 'Month',
                autoSave: true,
                animationEnabled: true,
                compactMode: false,
            },

            // ======== UI STATE ========
            isCreateGoalOpen: false,

            // ========================
            //   USER PROFILE ACTIONS
            // ========================
            updateUser: (updates) => set((state) => ({
                user: { ...state.user, ...updates },
            })),

            // ========================
            //   GOAL ACTIONS
            // ========================
            // Recalculate goal progress based on milestone completion
            recalcGoalProgress: (goalId) => set((state) => {
                const related = state.milestones.filter((m) => m.goalId === goalId);
                const completed = related.filter((m) => m.status === 'Completed').length;
                const progress = related.length ? Math.round((completed / related.length) * 100) : 0;
                return { goals: state.goals.map((g) => (g.id === goalId ? { ...g, progress } : g)) };
            }),

            // Initialize demo workspace only when nothing is persisted yet.
            initDemoData: () => {
                try {
                    const key = 'milestone-hub-storage';
                    const existing = localStorage.getItem(key);
                    if (existing) return; // don't overwrite existing user data
                } catch (e) {
                    // ignore localStorage errors
                }
                // Apply demo data
                set(() => ({
                    goals: demoGoals,
                    milestones: demoMilestones,
                    categories: demoCategories,
                    todos: demoTodos,
                    calendarTasks: demoCalendarTasks,
                }));
                // Recalculate progress for all demo goals
                demoGoals.forEach((g) => get().recalcGoalProgress(g.id));
            },

            addGoal: (goal) => {
                const id = crypto.randomUUID();
                const created = { ...goal, id, progress: 0, archived: false, createdAt: new Date().toISOString() };
                set((state) => ({ goals: [...state.goals, created] }));
                // create a calendar deadline for the goal if provided
                if (goal.targetDate) {
                    get().addCalendarTask({ title: `${goal.name} Deadline`, description: `Deadline for ${goal.name}`, date: goal.targetDate, time: '09:00', category: goal.category || 'Personal', priority: 'High', goalId: id, type: 'goal-deadline' });
                }
                // if milestones provided, add them
                if (Array.isArray(goal.milestones)) {
                    goal.milestones.forEach((m) => get().addMilestone({ ...m, goalId: id }));
                }
            },

            updateGoal: (id, updates) => {
                set((state) => ({ goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
                // if targetDate changed, update goal deadline calendar task
                if (updates.targetDate) {
                    const tasks = get().calendarTasks.filter((t) => t.goalId === id && t.type === 'goal-deadline');
                    tasks.forEach((t) => get().updateCalendarTask(t.id, { date: updates.targetDate }));
                }
            },

            deleteGoal: (id) => {
                const relatedMilestones = get().milestones.filter((m) => m.goalId === id).map((m) => m.id);
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                    milestones: state.milestones.filter((m) => m.goalId !== id),
                    todos: state.todos.filter((t) => t.goalId !== id),
                    calendarTasks: state.calendarTasks.filter((c) => c.goalId !== id && !relatedMilestones.includes(c.milestoneId)),
                }));
            },

            archiveGoal: (id) => set((state) => ({
                goals: state.goals.map((g) => (g.id === id ? { ...g, archived: true } : g)),
            })),

            duplicateGoal: (id) => set((state) => {
                const original = state.goals.find((g) => g.id === id);
                if (!original) return {};
                const newId = crypto.randomUUID();
                const newGoal = { ...original, id: newId, name: `${original.name} (Copy)`, progress: 0, createdAt: new Date().toISOString() };
                const originalMilestones = state.milestones.filter((m) => m.goalId === id);
                const newMilestones = originalMilestones.map((m) => ({
                    ...m,
                    id: crypto.randomUUID(),
                    goalId: newId,
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                }));
                // duplicate calendar tasks linked to the goal
                const newCalendar = state.calendarTasks.filter((c) => c.goalId === id).map((c) => ({ ...c, id: crypto.randomUUID(), goalId: newId }));
                return {
                    goals: [...state.goals, newGoal],
                    milestones: [...state.milestones, ...newMilestones],
                    calendarTasks: [...state.calendarTasks, ...newCalendar],
                };
            }),

            // ========================
            //   MILESTONE ACTIONS
            // ========================
            addMilestone: (milestone) => {
                const id = crypto.randomUUID();
                const created = { ...milestone, id, dependencies: milestone.dependencies || [], createdAt: new Date().toISOString(), status: milestone.status || 'Pending' };
                set((state) => ({ milestones: [...state.milestones, created] }));
                // create calendar event for milestone deadline
                if (created.dueDate) {
                    get().addCalendarTask({ title: `${created.name} (Milestone)`, description: created.description || '', date: created.dueDate, time: '09:00', category: get().goals.find(g => g.id === created.goalId)?.category || 'Personal', priority: created.priority || 'Medium', goalId: created.goalId, milestoneId: id, type: 'milestone-deadline' });
                }
                // recalc progress for the goal
                if (created.goalId) get().recalcGoalProgress(created.goalId);
            },

            updateMilestone: (id, updates) => {
                const prev = get().milestones.find((m) => m.id === id);
                set((state) => ({ milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)) }));
                const updated = { ...prev, ...updates };
                if (updates.dueDate || updates.name) {
                    const tasks = get().calendarTasks.filter((t) => t.milestoneId === id);
                    tasks.forEach((t) => get().updateCalendarTask(t.id, {
                        date: updates.dueDate || t.date,
                        title: updates.name ? `${updates.name} (Milestone)` : t.title
                    }));
                }
                if (updated.goalId) {
                    get().recalcGoalProgress(updated.goalId);
                }
            },

            deleteMilestone: (id) => {
                const m = get().milestones.find((x) => x.id === id);
                set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id), calendarTasks: state.calendarTasks.filter((c) => c.milestoneId !== id) }));
                if (m?.goalId) get().recalcGoalProgress(m.goalId);
            },

            reorderMilestones: (goalId, milestoneIds) => set((state) => {
                const reordered = state.milestones.map((m) =>
                    m.goalId === goalId ? { ...m, order: milestoneIds.indexOf(m.id) } : m
                );
                return { milestones: reordered };
            }),

            // ========================
            //   CATEGORY ACTIONS
            // ========================
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, id: crypto.randomUUID() }],
            })),

            updateCategory: (id, updates) => set((state) => ({
                categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            })),

            deleteCategory: (id) => set((state) => {
                const catToDelete = state.categories.find(c => c.id === id);
                if (!catToDelete) return state;

                const remaining = state.categories.filter((c) => c.id !== id);
                const fallback = remaining[0]?.name || 'Personal';

                return {
                    categories: remaining,
                    goals: state.goals.map(g => g.category === catToDelete.name ? { ...g, category: fallback } : g),
                    milestones: state.milestones.map(m => m.category === catToDelete.name ? { ...m, category: fallback } : m),
                    todos: state.todos.map(t => t.category === catToDelete.name ? { ...t, category: fallback } : t),
                    calendarTasks: state.calendarTasks.map(c => c.category === catToDelete.name ? { ...c, category: fallback } : c)
                };
            }),

            // ========================
            //   TODO ACTIONS
            // ========================
            addTodo: (todo) => set((state) => ({
                todos: [...state.todos, {
                    ...todo,
                    id: crypto.randomUUID(),
                    completed: false,
                    createdAt: new Date().toISOString(),
                }],
            })),

            updateTodo: (id, updates) => set((state) => ({
                todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),

            deleteTodo: (id) => set((state) => ({
                todos: state.todos.filter((t) => t.id !== id),
            })),

            toggleTodo: (id) => set((state) => ({
                todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
            })),

            // ========================
            //   NOTIFICATION ACTIONS
            // ========================
            addNotification: (notification) => set((state) => ({
                notifications: [{
                    ...notification,
                    id: crypto.randomUUID(),
                    read: false,
                    timestamp: new Date().toISOString(),
                }, ...state.notifications],
            })),

            markNotificationRead: (id) => set((state) => ({
                notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            })),

            markAllNotificationsRead: () => set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
            })),

            deleteNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            })),

            clearAllNotifications: () => set({ notifications: [] }),

            // ========================
            //   FOCUS MODE ACTIONS
            // ========================
            setFocusSettings: (settings) => set((state) => ({
                focusSettings: { ...state.focusSettings, ...settings },
            })),

            addFocusSession: (session) => set((state) => ({
                focusSessions: [{ ...session, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...state.focusSessions],
                dailyFocusMinutes: state.dailyFocusMinutes + (session.duration || 0),
            })),

            // ========================
            //   CALENDAR TASK ACTIONS
            // ========================
            addCalendarTask: (task) => {
                // preserve provided id (useful for demo records), otherwise generate
                const id = task.id || crypto.randomUUID();
                const created = { ...task, id, completed: task.completed || false };
                set((state) => ({ calendarTasks: [...state.calendarTasks, created] }));
                return id;
            },

            updateCalendarTask: (id, updates) => {
                const prev = get().calendarTasks.find((t) => t.id === id);
                set((state) => ({ calendarTasks: state.calendarTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
                const updated = { ...prev, ...updates };
                // If a calendar event is marked completed and links to a milestone/goal, propagate the completion
                if (updates.completed) {
                    if (updated.milestoneId) {
                        get().updateMilestone(updated.milestoneId, { status: 'Completed' });
                    } else if (updated.goalId) {
                        // recalc goal progress - some flows may derive completion from linked milestones
                        get().recalcGoalProgress(updated.goalId);
                    }
                }
                return updated;
            },

            deleteCalendarTask: (id) => {
                const t = get().calendarTasks.find((x) => x.id === id);
                set((state) => ({ calendarTasks: state.calendarTasks.filter((t) => t.id !== id) }));
                // if this event was a milestone-deadline or goal-deadline, no stale references remain
                if (t?.milestoneId) {
                    // nothing else to do other than remove the calendar link
                }
            },

            // ========================
            //   THEME ACTIONS
            // ========================
            setTheme: (themeId) => {
                set((state) => {
                    // Accept a base like 'royal-purple'
                    const bases = ['royal-purple', 'pink-blossom', 'ocean-blue', 'emerald-green'];
                    if (bases.includes(themeId)) {
                        const applied = `${themeId}-${state.darkMode ? 'dark' : 'light'}`;
                        document.documentElement.setAttribute('data-theme', applied);
                        return { themeBase: themeId, theme: applied };
                    }
                    // full id provided
                    const parts = themeId.split('-');
                    const variant = parts.pop();
                    const base = parts.join('-');
                    const isDark = variant === 'dark';
                    document.documentElement.setAttribute('data-theme', themeId);
                    return { themeBase: base, darkMode: isDark, theme: themeId };
                });
            },

            setThemeBase: (base) => {
                set((state) => {
                    const applied = `${base}-${state.darkMode ? 'dark' : 'light'}`;
                    document.documentElement.setAttribute('data-theme', applied);
                    return { themeBase: base, theme: applied };
                });
            },

            setDarkMode: (val) => {
                set((state) => {
                    const dark = typeof val === 'boolean' ? val : !state.darkMode;
                    const applied = `${state.themeBase}-${dark ? 'dark' : 'light'}`;
                    document.documentElement.setAttribute('data-theme', applied);
                    return { darkMode: dark, theme: applied };
                });
            },

            setPreferences: (newPrefs) => set((state) => ({
                preferences: { ...state.preferences, ...newPrefs },
            })),
            setNotificationPrefs: (prefs) => set((state) => ({
                notificationPrefs: { ...state.notificationPrefs, ...prefs },
            })),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setIsCreateGoalOpen: (val) => set({ isCreateGoalOpen: val }),

            // ========================
            //   DATA MANAGEMENT
            // ========================
            clearWorkspaceData: () => set({
                goals: [],
                milestones: [],
                todos: [],
                calendarTasks: [],
                focusSessions: [],
                notifications: [],
                dailyFocusMinutes: 0
            }),

            resetSettings: () => set({
                theme: 'royal-purple-light',
                themeBase: 'royal-purple',
                darkMode: false,
                preferences: { defaultPage: '/', defaultCalendarView: 'Month', autoSave: true, animationEnabled: true, compactMode: false },
                notificationPrefs: { deadlineAlerts: true, milestoneAlerts: true, goalCompletionAlerts: true }
            }),

            resetAll: () => {
                get().clearWorkspaceData();
                get().resetSettings();
            },

            clearCompletedGoals: () => set((state) => ({
                goals: state.goals.filter((g) => g.progress < 100 && !g.archived),
            })),

            clearCompletedMilestones: () => set((state) => ({
                milestones: state.milestones.filter((m) => m.status !== 'Completed'),
            })),

            importData: (data) => set((state) => ({
                goals: data.goals || state.goals,
                milestones: data.milestones || state.milestones,
                categories: data.categories || state.categories,
                todos: data.todos || state.todos,
                user: data.user || state.user,
                calendarTasks: data.calendarTasks || state.calendarTasks,
            })),

            getExportData: () => {
                const state = get();
                return {
                    goals: state.goals,
                    milestones: state.milestones,
                    categories: state.categories,
                    todos: state.todos,
                    user: state.user,
                    calendarTasks: state.calendarTasks,
                    focusSessions: state.focusSessions,
                    notificationPrefs: state.notificationPrefs,
                    preferences: state.preferences,
                    themeBase: state.themeBase,
                    darkMode: state.darkMode,
                    version: '2.0.0',
                    exportDate: new Date().toISOString(),
                };
            },
        }),
        {
            name: 'milestone-hub-storage',
        }
    )
);
