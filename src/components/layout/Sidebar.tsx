import React from 'react';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  FileUp,
  Sparkles,
  Mic,
  ShieldCheck,
  ClockAlert,
  Users,
  GitCompare,
  Headphones,
  CheckCircle2,
  Sliders,
  BookOpen,
  BellRing,
  Building2,
  BrainCircuit,
  Quote,
  FileCheck,
  Target,
  FileSpreadsheet,
  Flag,
  Lock,
  Compass,
  Fingerprint,
  Video,
  FileBadge,
  Server,
  Activity,
  Database,
  Key,
  Briefcase
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Briefcase,
  LayoutDashboard,
  FileUp,
  Sparkles,
  Mic,
  ShieldCheck,
  ClockAlert,
  Users,
  GitCompare,
  Headphones,
  CheckCircle2,
  Sliders,
  BookOpen,
  BellRing,
  Building2,
  BrainCircuit,
  Quote,
  FileCheck,
  Target,
  FileSpreadsheet,
  Flag,
  Lock,
  Compass,
  Fingerprint,
  Video,
  FileBadge,
  Server,
  Activity,
  Database,
  Key
};

export const Sidebar: React.FC = () => {
  const { navItems, activeNavTab, setActiveNavTab, activePersona, role } = useAuthRbac();
  const { language, t } = useLanguage();

  return (
    <aside className="side-nav">
      {/* Active Role Indicator Box */}
      <div className="sidebar-role-indicator">
        <strong>{language === 'ar' ? activePersona.titleAr : activePersona.title}</strong>
        <span>{language === 'ar' ? activePersona.departmentAr : activePersona.department}</span>
      </div>

      {/* Role-Specific Navigation Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
          const isActive = activeNavTab === item.id ||
            (item.id === 'virtual_interview' && activeNavTab === 'interview_evaluations') ||
            (item.id === 'interview_evaluations' && activeNavTab === 'virtual_interview');

          return (
            <button
              key={item.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNavTab(item.id)}
            >
              <span className="nav-icon">
                <IconComponent size={16} />
              </span>
              <span>
                {language === 'ar' ? item.labelAr : item.labelEn}
              </span>
              {item.badge && (
                <span className="nav-counter">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom KSA Data Sovereignty Footer */}
      <div className="nav-footer-box">
        <div className="residency-card">
          <span className="residency-flag">&#127480;&#127462;</span>
          <div className="residency-text">
            <strong>{t('data.sovereignty')}</strong>
            <span>{t('data.sub')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
