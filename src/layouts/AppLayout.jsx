import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import CreateGoalModal from '../components/modals/CreateGoalModal';
import { useStore } from '../store/useStore';

const AppLayout = () => {
  const { theme, preferences, isCreateGoalOpen, setIsCreateGoalOpen, initDemoData } = useStore();

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (preferences?.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [preferences?.compactMode]);

  useEffect(() => {
    initDemoData();
  }, []);

  return (
    <MotionConfig transition={preferences?.animationEnabled === false ? { duration: 0 } : undefined}>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden h-screen" style={{ background: 'var(--bg-main)' }}>
          <Header />
          <main className="flex-1 overflow-y-auto" style={{ padding: '24px 32px' }}>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Outlet />
              </AnimatePresence>
            </ErrorBoundary>
          </main>
          <CreateGoalModal isOpen={isCreateGoalOpen} onClose={() => setIsCreateGoalOpen(false)} />
        </div>
      </div>
    </MotionConfig>
  );
};

export default AppLayout;
