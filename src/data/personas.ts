import { PersonaProfile, UserRole } from '../types';

export const PERSONAS: Record<UserRole, PersonaProfile> = {
  recruiter: {
    id: 'recruiter',
    name: 'Sarah Al-Harbi',
    nameAr: 'سارة الحربي',
    title: 'Senior Talent Acquisition Lead',
    titleAr: 'قائدة استقطاب الكفاءات والمواهب',
    initials: 'SA',
    department: 'Human Resources & Talent Management',
    departmentAr: 'الموارد البشرية وإدارة المواهب'
  },
  manager: {
    id: 'manager',
    name: 'Capt. Khalid Al-Otaibi',
    nameAr: 'كابتن خالد العتيبي',
    title: 'Head of Air Traffic Control (ATC Operations)',
    titleAr: 'رئيس عمليات المراقبة والملاحة الجوية',
    initials: 'KO',
    department: 'Area Control Center (Riyadh ACC)',
    departmentAr: 'مركز مراقبة المنطقة - الرياض'
  },
  admin: {
    id: 'admin',
    name: 'Mona Al-Dawsari',
    nameAr: 'منى الدوسري',
    title: 'HR Policy & System Administrator',
    titleAr: 'مديرة سياسات وأنظمة الموارد البشرية',
    initials: 'MD',
    department: 'HR Governance & Shared Services',
    departmentAr: 'حوكمة الموارد البشرية والخدمات المشتركة'
  },
  reviewer: {
    id: 'reviewer',
    name: 'Dr. Faisal Al-Harthi',
    nameAr: 'د. فيصل الحارثي',
    title: 'Executive Assessment & Competency Specialist',
    titleAr: 'أخصائي التقييم القيادي والكفاءات المتقدمة',
    initials: 'FH',
    department: 'SANS Talent Assessment Center',
    departmentAr: 'مركز تقييم الكفاءات بالملاحة الجوية'
  },
  compliance: {
    id: 'compliance',
    name: 'Waleed Al-Mutairi',
    nameAr: 'وليد المطيري',
    title: 'Cybersecurity & PDPL Compliance Officer',
    titleAr: 'مسؤول الامتثال للأمن السيبراني ونظام حماية البيانات',
    initials: 'WM',
    department: 'Cybersecurity & Regulatory Audit',
    departmentAr: 'إدارة الأمن السيبراني والرقابة التنظيمية'
  },
  candidate: {
    id: 'candidate',
    name: 'Mohammad Al-Zahrani',
    nameAr: 'محمد الزهراني',
    title: 'Applicant: Senior ATC Specialist',
    titleAr: 'متقدم لوظيفة: أخصائي مراقبة ملاحة جوية',
    initials: 'MZ',
    department: 'Applicant Self-Service Portal',
    departmentAr: 'بوابة المتقدم للخدمة الذاتية'
  },
  sysadmin: {
    id: 'sysadmin',
    name: 'Eng. Yasser Al-Ghamdi',
    nameAr: 'م. ياسر الغامدي',
    title: 'Enterprise Integration & Infrastructure Lead',
    titleAr: 'قائد التكامل التقني والبنية السحابية',
    initials: 'YG',
    department: 'Information Technology & Cloud Infrastructure',
    departmentAr: 'تقنية المعلومات والبنية التحتية السحابية'
  }
};
