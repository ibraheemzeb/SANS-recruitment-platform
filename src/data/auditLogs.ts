import { AuditLog } from '../types';

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-9921',
    timestamp: '2026-10-27 16:15:22 AST',
    actor: 'Sarah Al-Harbi',
    actorAr: 'سارة الحربي',
    role: 'Senior Recruiter',
    event: 'CV Screening Dossier Accessed (CAND-8491)',
    eventAr: 'اطلاع على ملف التقييم الذكي للمرشح (CAND-8491)',
    subjectCandidate: 'Mohammad Al-Zahrani',
    ncaControlRef: 'NCA-ECC-1-2-1 (Access Monitoring)',
    status: 'Verified'
  },
  {
    id: 'LOG-9920',
    timestamp: '2026-10-27 15:48:10 AST',
    actor: 'Nafath Integration Gateway',
    actorAr: 'بوابة التكامل مع نفاذ الوطني',
    role: 'System Service',
    event: 'Biometric & Token Verification Confirmed',
    eventAr: 'تأكيد التوثيق الوطني الرقمي برمز معتمد',
    subjectCandidate: 'Noura Al-Shehri',
    ncaControlRef: 'NCA-ECC-2-4-2 (National Identity)',
    status: 'Signed'
  },
  {
    id: 'LOG-9919',
    timestamp: '2026-10-27 15:22:04 AST',
    actor: 'Capt. Khalid Al-Otaibi',
    actorAr: 'كابتن خالد العتيبي',
    role: 'Hiring Manager (ATC)',
    event: 'AI Virtual Interview Video Review & Rubric Endorsement',
    eventAr: 'مراجعة المقابلة الذكية واعتماد معايير الكفاءة',
    subjectCandidate: 'Mohammad Al-Zahrani',
    ncaControlRef: 'PDPL-Art-12 (Purpose Limitation)',
    status: 'Verified'
  },
  {
    id: 'LOG-9918',
    timestamp: '2026-10-27 14:10:00 AST',
    actor: 'Oracle Fusion HCM Gateway',
    actorAr: 'بوابة أوراكل فيوجن للموارد البشرية',
    role: 'Integration Service',
    event: 'Requisition Sync Inbound (REQ-2026-084)',
    eventAr: 'مزامنة بيانات الوظيفة من أوراكل (REQ-2026-084)',
    subjectCandidate: 'All Cohort (142 Resumes)',
    ncaControlRef: 'NCA-CSCC-3-1 (Cloud Data Interop)',
    status: 'Verified'
  },
  {
    id: 'LOG-9917',
    timestamp: '2026-10-27 13:05:44 AST',
    actor: 'Waleed Al-Mutairi',
    actorAr: 'وليد المطيري',
    role: 'Compliance Officer',
    event: 'AI Accuracy Validation Audit (96.2% Confirmed)',
    eventAr: 'تدقيق دقة المطابقة الخوارزمية (تم تأكيد 96.2%)',
    subjectCandidate: 'Validation Reference Dataset',
    ncaControlRef: 'NCA-AI-GOV-4.1 (Algorithmic Audit)',
    status: 'Signed'
  }
];
