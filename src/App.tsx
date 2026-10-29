import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthRbacProvider, useAuthRbac } from './context/AuthRbacContext';
import { CandidateProvider } from './context/CandidateContext';
import { TopHeader } from './components/layout/TopHeader';
import { RequisitionBar } from './components/layout/RequisitionBar';
import { Sidebar } from './components/layout/Sidebar';
import { OracleSyncModal } from './components/modals/OracleSyncModal';

// Views
import { RecruiterView } from './views/recruiter/RecruiterView';
import { ManagerView } from './views/manager/ManagerView';
import { AdminView } from './views/admin/AdminView';
import { ReviewerView } from './views/reviewer/ReviewerView';
import { ComplianceView } from './views/compliance/ComplianceView';
import { CandidateView } from './views/candidate/CandidateView';
import { SysAdminView } from './views/sysadmin/SysAdminView';

const MainContentRouter: React.FC = () => {
  const { role, activeNavTab } = useAuthRbac();

  // Route Recruitment Hub, Virtual Interview, and Jobs AI Rankings directly to RecruiterView for any authorized role
  if (
    activeNavTab === 'recruiter_hub' || 
    activeNavTab === 'virtual_interview' || 
    activeNavTab === 'interview_evaluations' || 
    activeNavTab === 'jobs_ai_rankings'
  ) {
    return <RecruiterView />;
  }

  switch (role) {
    case 'recruiter':
      return <RecruiterView />;
    case 'manager':
      return <ManagerView />;
    case 'admin':
      return <AdminView />;
    case 'reviewer':
      return <ReviewerView />;
    case 'compliance':
      return <ComplianceView />;
    case 'candidate':
      return <CandidateView />;
    case 'sysadmin':
      return <SysAdminView />;
    default:
      return <RecruiterView />;
  }
};

export function App() {
  return (
    <LanguageProvider>
      <AuthRbacProvider>
        <CandidateProvider>
          <div className="app-container">
            {/* Corporate Top Header with Persona Dropdown and Language Switcher */}
            <TopHeader />

            {/* Oracle Fusion HCM Requisition Sub-Bar */}
            <RequisitionBar />

            {/* Main Application Body */}
            <div className="main-body">
              {/* Persona-Adaptive Sidebar */}
              <Sidebar />

              {/* Dynamic Content Pane for the Active Persona */}
              <main className="content-pane">
                <MainContentRouter />
              </main>
            </div>

            {/* Global Oracle Sync Modal */}
            <OracleSyncModal />
          </div>
        </CandidateProvider>
      </AuthRbacProvider>
    </LanguageProvider>
  );
}

export default App;
