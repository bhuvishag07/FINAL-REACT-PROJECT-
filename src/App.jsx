import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TimelineUniverse from './pages/TimelineUniverse';
import Milestones from './pages/Milestones';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Categories from './pages/Categories';
import FocusMode from './pages/FocusMode';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Todos from './pages/Todos';
import Reports from './pages/Reports';
import AppLayout from './layouts/AppLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="timeline" element={<TimelineUniverse />} />
          <Route path="milestones" element={<Milestones />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="goals" element={<Goals />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="categories" element={<Categories />} />
          <Route path="focus" element={<FocusMode />} />
          <Route path="todos" element={<Todos />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
