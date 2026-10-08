import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { SourceEvidenceDrawer } from './SourceEvidenceDrawer';
import { ReviewDetailModal } from './ReviewDetailModal';
import { TaskDetailModal } from './TaskDetailModal';
import { EditPatientModal } from './EditPatientModal';
import { AIProcessingWorkflow } from './AIProcessingWorkflow';
import { Toast } from './Toast';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Drawers and Modals */}
      <SourceEvidenceDrawer />
      <ReviewDetailModal />
      <TaskDetailModal />
      <EditPatientModal />
      <AIProcessingWorkflow />
      <Toast />
    </div>
  );
};
