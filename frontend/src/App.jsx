import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CareFlowProvider } from './context/CareFlowContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadSummaryPage } from './pages/UploadSummaryPage';
import { DischargeSummaryPage } from './pages/DischargeSummaryPage';
import { TasksPage } from './pages/TasksPage';
import { TimelinePage } from './pages/TimelinePage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ReviewCenterPage } from './pages/ReviewCenterPage';
import { AIActivityPage } from './pages/AIActivityPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <CareFlowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<UploadSummaryPage />} />
            <Route path="discharge-summary" element={<DischargeSummaryPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="reviews" element={<ReviewCenterPage />} />
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
