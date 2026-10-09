import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CareFlowProvider } from './context/CareFlowContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { DischargeUploadPage } from './pages/DischargeUploadPage';
import { TasksPage } from './pages/TasksPage';
import { TimelinePage } from './pages/TimelinePage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ReviewCenterPage } from './pages/ReviewCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIActivityPage } from './pages/AIActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <CareFlowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="discharge" element={<DischargeUploadPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="reviews" element={<ReviewCenterPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="activity" element={<AIActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CareFlowProvider>
  );
}

export default App;
