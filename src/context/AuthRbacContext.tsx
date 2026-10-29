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

export const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  recruiter: [
    { id: 'recruiter_hub', labelEn: 'Recruitment Hub', labelAr: 'مركز عمليات التوظيف والفرز', iconName: 'LayoutDashboard', badge: 'Live Pipeline' },
    { id: 'jobs_ai_rankings', labelEn: 'Jobs & AI Candidate Rankings', labelAr: 'الوظائف وترتيب المرشحين بالذكاء الاصطناعي', iconName: 'Briefcase', badge: 'AI Ranked' },
    { id: 'cv_ingestion', labelEn: 'CV Ingestion & OCR', labelAr: 'استيعاب السير والمسح الآلي', iconName: 'FileUp' },
    { id: 'ai_screening', labelEn: 'AI Screening & Matching', labelAr: 'المطابقة والفرز الذكي', iconName: 'Sparkles', badge: '18 Top' },
    { id: 'virtual_interview', labelEn: 'Virtual Interview Review', labelAr: 'تقييم المقابلات الذكية', iconName: 'Mic' },
    { id: 'clearances', labelEn: 'Clearances & Oracle Sync', labelAr: 'التحقق الأمني ومزامنة أوراكل', iconName: 'ShieldCheck' },
    { id: 'sla_alerts', labelEn: 'SLA Watchdog & Alerts', labelAr: 'مراقبة الالتزام بالخدمة (SLA)', iconName: 'ClockAlert' }
  ],
  manager: [
    { id: 'recruiter_hub', labelEn: 'Recruitment Hub', labelAr: 'مركز عمليات التوظيف والفرز', iconName: 'LayoutDashboard', badge: 'Pipeline' },
    { id: 'jobs_ai_rankings', labelEn: 'Jobs & AI Candidate Rankings', labelAr: 'الوظائف وترتيب المرشحين بالذكاء الاصطناعي', iconName: 'Briefcase', badge: 'AI Ranked' },
    { id: 'manager_dashboard', labelEn: 'ATC Department Hub', labelAr: 'مركز قيادة العمليات الملاحية', iconName: 'Users' },
    { id: 'assigned_shortlists', labelEn: 'Assigned Candidate Shortlist', labelAr: 'قوائم المرشحين المحالين', iconName: 'Users', badge: '8 Pending' },
    { id: 'candidate_comparison', labelEn: 'Side-by-Side Comparison', labelAr: 'المقارنة الميدانية للكفاءات', iconName: 'GitCompare' },
    { id: 'virtual_interview', labelEn: 'Virtual Interview & Speech', labelAr: 'تحليل المقابلة الصوتية للمرشح', iconName: 'Headphones' },
    { id: 'committee_approvals', labelEn: 'Final Committee Approvals', labelAr: 'اعتماد ومحاضر اللجان', iconName: 'CheckCircle2' }
  ],
  admin: [
    { id: 'recruiter_hub', labelEn: 'Recruitment Hub', labelAr: 'مركز عمليات التوظيف والفرز', iconName: 'LayoutDashboard', badge: 'Pipeline' },
    { id: 'jobs_ai_rankings', labelEn: 'Jobs & AI Candidate Rankings', labelAr: 'الوظائف وترتيب المرشحين بالذكاء الاصطناعي', iconName: 'Briefcase', badge: 'AI Ranked' },
    { id: 'job_postings', labelEn: 'Post & Manage Jobs', labelAr: 'نشر وإدارة الوظائف الشاغرة', iconName: 'Briefcase', badge: 'Post Job' },
    { id: 'admin_dashboard', labelEn: 'HR Admin Dashboard', labelAr: 'لوحة إدارة الموارد البشرية', iconName: 'Sliders' },
    { id: 'virtual_interview', labelEn: 'Interview Review & Final Selection', labelAr: 'مراجعة المقابلات والاختيار النهائي', iconName: 'Mic' },
    { id: 'scoring_rules', labelEn: 'Scoring Weights & Rules', labelAr: 'إعداد أوزان ومعايير الفرز', iconName: 'Sliders' },
    { id: 'competency_banks', labelEn: 'Interview Rubric Banks', labelAr: 'نماذج وبنوك أسئلة المقابلات', iconName: 'BookOpen' },
    { id: 'sla_rules', labelEn: 'SLA & Escalation Policies', labelAr: 'قواعد التنبيه وتصعيد الطلبات', iconName: 'BellRing' },
    { id: 'subsidiary_config', labelEn: 'SANS / NERA / SACA Config', labelAr: 'إعدادات الشركات التابعة', iconName: 'Building2' }
  ],
  reviewer: [
    { id: 'reviewer_dashboard', labelEn: 'Assessment Hub', labelAr: 'مركز قياس وتقييم الكفاءات', iconName: 'LayoutDashboard' },
    { id: 'interview_questions', labelEn: 'Interview Question Bank & Rubrics', labelAr: 'بنك أسئلة المقابلات ونماذج التقييم', iconName: 'BookOpen', badge: 'Active Bank' },
    { id: 'mercer_integration', labelEn: 'Mercer Cognitive Reports', labelAr: 'نتائج الاختبارات والقدرات (Mercer)', iconName: 'BrainCircuit' },
    { id: 'interview_rubrics', labelEn: 'Speech & Verbatim Rubrics', labelAr: 'تحليل الأداء اللغوي والسلوكي', iconName: 'Quote' },
    { id: 'final_dossiers', labelEn: 'Consolidated Dossier Packs', labelAr: 'الملف التقييمي الشامل للمرشح', iconName: 'FileCheck' }
  ],
  compliance: [
    { id: 'compliance_dashboard', labelEn: 'Audit & Governance Hub', labelAr: 'مركز الامتثال والرقابة النظامية', iconName: 'LayoutDashboard' },
    { id: 'accuracy_sla', labelEn: '95% AI Accuracy SLA', labelAr: 'مؤشر دقة الذكاء الاصطناعي (95%)', iconName: 'Target', badge: '96.2%' },
    { id: 'audit_trail', labelEn: 'PDPL & NCA Audit Trail', labelAr: 'سجل العمليات والامتثال المعتمد', iconName: 'FileSpreadsheet' },
    { id: 'data_residency', labelEn: 'KSA Data Residency Proof', labelAr: 'إثباتات الاستضافة الوطنية', iconName: 'Flag' },
    { id: 'access_logs', labelEn: 'Access & Export Security', labelAr: 'سجلات الاطلاع والتصدير', iconName: 'Lock' }
  ],
  candidate: [
    { id: 'candidate_status', labelEn: 'My Applications', labelAr: 'طلباتي ومسار التقديم', iconName: 'Compass', badge: '3 Active' },
    { id: 'explore_jobs', labelEn: 'Explore Jobs & Apply', labelAr: 'استعراض الوظائف والتقديم', iconName: 'LayoutDashboard', badge: '5 Open' },
    { id: 'virtual_interview_room', labelEn: 'Interactive AI Interview', labelAr: 'المقابلة الذكية (صوت ونص)', iconName: 'Video', badge: 'Ready' },
    { id: 'nafath_verification', labelEn: 'Nafath Digital Identity', labelAr: 'التوثيق الرقمي عبر نفاذ الوطني', iconName: 'Fingerprint' },
    { id: 'my_documents', labelEn: 'Certificates & Aviation Status', labelAr: 'الوثائق والشهادات الملاحية', iconName: 'FileBadge' }
  ],
  sysadmin: [
    { id: 'sysadmin_dashboard', labelEn: 'IT Infrastructure Hub', labelAr: 'مركز التحكم والعمليات التقنية', iconName: 'LayoutDashboard' },
    { id: 'oracle_gateway', labelEn: 'Oracle HCM REST Gateway', labelAr: 'بوابة تكامل أوراكل فيوجن', iconName: 'Server' },
    { id: 'cloud_topology', labelEn: 'KSA Cloud Microservices', labelAr: 'صحة الخدمات السحابية والربط', iconName: 'Activity' },
    { id: 'backup_recovery', labelEn: 'RPO/RTO & Backup Drill', labelAr: 'سجلات النسخ الاحتياطي والتعافي', iconName: 'Database' },
    { id: 'api_keys', labelEn: 'Zero-Trust Security Keys', labelAr: 'إدارة مفاتيح الربط المشفرة', iconName: 'Key' }
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
