import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SafetyModal from './components/SafetyModal';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import DischargePage from './pages/DischargePage';
import TasksPage from './pages/TasksPage';
import TimelinePage from './pages/TimelinePage';
import ProvidersPage from './pages/ProvidersPage';
import ReviewCenterPage from './pages/ReviewCenterPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import ChangeNameModal from './components/ChangeNameModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReviewProvider, useReview } from './context/ReviewContext';

function MainLayout() {
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const { activeReviewCount, fetchReviews } = useReview();
  const { isNameModalOpen, closeNameModal } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar reviewCount={activeReviewCount} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <Header
          reviewCount={activeReviewCount}
          onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        />

        {/* Page Routing */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/discharge" element={<DischargePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/review-center" element={<ReviewCenterPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Healthcare Safety Boundary Modal */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onEscalateToReview={() => fetchReviews()}
      />

      {/* Global Change Patient Name Modal */}
      <ChangeNameModal
        isOpen={isNameModalOpen}
        onClose={closeNameModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReviewProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </ReviewProvider>
    </AuthProvider>
  );
}
