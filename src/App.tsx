import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthRbacProvider, useAuthRbac } from './context/AuthRbacContext';
import { CandidateProvider } from './context/CandidateContext';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { OracleSyncModal } from './components/modals/OracleSyncModal';

// Views
import { EmployerWorkspace } from './views/employer/EmployerWorkspace';
import { CandidateView } from './views/candidate/CandidateView';

const MainContentRouter: React.FC = () => {
  const { role } = useAuthRbac();

  if (role === 'candidate') {
    return <CandidateView />;
  }

  // All other roles (HR Specialist, Requirement Specialist, Manager, Admin, Reviewer, Compliance, Sysadmin)
  // are unified into the exact same minimalist EmployerWorkspace!
  return <EmployerWorkspace />;
};

export function App() {
  return (
    <LanguageProvider>
      <AuthRbacProvider>
        <CandidateProvider>
          <div className="app-container">
            {/* Corporate Top Header with Persona Dropdown and Language Switcher */}
            <TopHeader />

            {/* Main Application Body */}
            <div className="main-body" style={{ minHeight: 'calc(100vh - 65px)' }}>
              {/* Persona-Adaptive Sidebar */}
              <Sidebar />

              {/* Dynamic Content Pane */}
              <main className="content-pane" style={{ width: '100%', maxWidth: '100%', padding: '24px 28px' }}>
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
