import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, PersonaProfile } from '../types';
import { PERSONAS } from '../data/personas';

export interface NavItem {
  id: string;
  labelEn: string;
  labelAr: string;
  iconName: string;
  badge?: string;
}

export const UNIFIED_EMPLOYER_NAV_ITEMS: NavItem[] = [
  { id: 'candidates_pipeline', labelEn: 'Candidates & AI Pipeline', labelAr: 'لوحة المرشحين والفرز الذكي', iconName: 'Users', badge: 'Live Pipeline' },
  { id: 'bulk_upload', labelEn: 'Bulk CV Upload & AI Ingestion', labelAr: 'رفع السير والفرز الآلي الجماعي', iconName: 'FileUp', badge: 'AI Scan' },
  { id: 'job_requisitions', labelEn: 'Jobs & AI Requisitions', labelAr: 'الوظائف الشاغرة ومعايير الفرز', iconName: 'Briefcase' },
  { id: 'virtual_interview', labelEn: 'Interview Review & Offers', labelAr: 'تقييم المقابلات وإصدار العروض', iconName: 'Mic', badge: 'Offers' }
];

export const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  recruiter: UNIFIED_EMPLOYER_NAV_ITEMS,
  manager: UNIFIED_EMPLOYER_NAV_ITEMS,
  admin: UNIFIED_EMPLOYER_NAV_ITEMS,
  reviewer: UNIFIED_EMPLOYER_NAV_ITEMS,
  compliance: UNIFIED_EMPLOYER_NAV_ITEMS,
  sysadmin: UNIFIED_EMPLOYER_NAV_ITEMS,
  candidate: [
    { id: 'candidate_status', labelEn: 'My Applications', labelAr: 'طلباتي ومسار التقديم', iconName: 'Compass', badge: '3 Active' },
    { id: 'explore_jobs', labelEn: 'Explore Jobs & Apply', labelAr: 'استعراض الوظائف والتقديم', iconName: 'LayoutDashboard', badge: '5 Open' },
    { id: 'virtual_interview_room', labelEn: 'Interactive AI Interview', labelAr: 'المقابلة الذكية (صوت ونص)', iconName: 'Video', badge: 'Ready' },
    { id: 'nafath_verification', labelEn: 'Nafath Digital Identity', labelAr: 'التوثيق الرقمي عبر نفاذ الوطني', iconName: 'Fingerprint' },
    { id: 'my_documents', labelEn: 'Certificates & Aviation Status', labelAr: 'الوثائق والشهادات الملاحية', iconName: 'FileBadge' }
  ]
};

interface AuthRbacContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activePersona: PersonaProfile;
  navItems: NavItem[];
  activeNavTab: string;
  setActiveNavTab: (tabId: string) => void;
}

const AuthRbacContext = createContext<AuthRbacContextType | undefined>(undefined);

export const AuthRbacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('sans_rbac_role') as UserRole) || 'recruiter';
  });

  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    return ROLE_NAV_ITEMS[role][0].id;
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('sans_rbac_role', newRole);
    setActiveNavTab(ROLE_NAV_ITEMS[newRole][0].id);
  };

  useEffect(() => {
    // Cross-role shared tabs should never be bounced
    const sharedTabs = [
      'candidates_pipeline',
      'bulk_upload',
      'job_requisitions',
      'recruiter_hub', 
      'virtual_interview', 
      'interview_evaluations', 
      'jobs_ai_rankings', 
      'ai_screening', 
      'clearances'
    ];
    if (sharedTabs.includes(activeNavTab)) {
      return;
    }
    // If tab doesn't belong to current role, reset to first item
    const currentRoleNavs = ROLE_NAV_ITEMS[role];
    if (!currentRoleNavs.some(n => n.id === activeNavTab)) {
      setActiveNavTab(currentRoleNavs[0].id);
    }
  }, [role, activeNavTab]);

  const activePersona = PERSONAS[role];
  const navItems = ROLE_NAV_ITEMS[role];

  return (
    <AuthRbacContext.Provider value={{
      role,
      setRole,
      activePersona,
      navItems,
      activeNavTab,
      setActiveNavTab
    }}>
      {children}
    </AuthRbacContext.Provider>
  );
};

export const useAuthRbac = () => {
  const context = useContext(AuthRbacContext);
  if (!context) {
    throw new Error('useAuthRbac must be used within an AuthRbacProvider');
  }
  return context;
};
