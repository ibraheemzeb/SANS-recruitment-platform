import React, { useState } from 'react';
import { JobRequisition } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import {
  X,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Award,
  Plus,
  Trash2,
  ArrowRight,
  Layers,
  Wand2
} from 'lucide-react';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: (newJob: JobRequisition) => void;
}

interface JobTemplatePreset {
  name: string;
  codePrefix: string;
  title: string;
  titleAr: string;
  department: string;
  departmentAr: string;
  location: string;
  experienceLevel: string;
  salaryRange: string;
  employmentType: string;
  deadline: string;
  description: string;
  descriptionAr: string;
  requirements: string[];
  requirementsAr: string[];
}

const TEMPLATE_PRESETS: JobTemplatePreset[] = [
  {
    name: 'Air Traffic Control Specialist (Tower/Approach)',
    codePrefix: 'REQ-2026-215',
    title: 'Aerodrome & Approach Air Traffic Controller (Tower Ops)',
    titleAr: 'مراقب ملاحة جوية لبرج المراقبة والاقتراب الجوي',
    department: 'Terminal Aerodrome Operations Directorate',
    departmentAr: 'الإدارة العامة لعمليات مراقبة المطارات والبرج',
    location: 'Riyadh, Saudi Arabia (KKIA Tower)',
    experienceLevel: 'Mid-Senior Level (4+ Years)',
    salaryRange: '26,000 - 34,000 SAR / Month',
    employmentType: 'Full-time / Shift Rotation',
    deadline: '20 Dec 2026',
    description: 'Direct high-density runway movements, manage airport surface traffic, and coordinate continuous visual and radar departures under Saudi Air Navigation Services safety standards.',
    descriptionAr: 'توجيه حركة الطائرات على المدارج عالية الكثافة وإدارة حركة السطح بالمطار وتنظيم الإقلاع الراداري والبصري وفق أعلى معايير السلامة لخدمات الملاحة الجوية السعودية.',
    requirements: [
      'Valid GACA Air Traffic Controller License (Tower/Approach Rating)',
      'Class 1 Aviation Medical Certificate (Valid)',
      'ICAO English Language Proficiency Level 5 or higher',
      'Minimum 4 years active air traffic control experience in international aerodromes'
    ],
    requirementsAr: [
      'رخصة مراقب جوي سارية من الهيئة العامة للطيران المدني (أهلية البرج والاقتراب)',
      'شهادة لياقة طبية ملاحية فئة أولى سارية الصلاحية',
      'مستوى كفاءة لغوية معتمد من منظمة الطيران المدني الدولي (ICAO Level 5+)',
      'خبرة عملية لا تقل عن 4 سنوات في مطارات دولية'
    ]
  },
  {
    name: 'CNS/ATM Radar Systems Engineer',
    codePrefix: 'REQ-2026-228',
    title: 'Surveillance & Radar Automation Systems Engineer',
    titleAr: 'مهندس أنظمة الرادار والاستطلاع الملاحي الآلي',
    department: 'CNS/ATM Engineering & Technical Infrastructure',
    departmentAr: 'الإدارة العامة لهندسة الاتصالات والملاحة والاستطلاع',
    location: 'Jeddah, Saudi Arabia',
    experienceLevel: 'Mid-Level (3+ Years)',
    salaryRange: '22,000 - 29,000 SAR / Month',
    employmentType: 'Full-time',
    deadline: '15 Dec 2026',
    description: 'Oversee commissioning, preventive maintenance, and real-time calibration of Primary/Secondary Surveillance Radars (PSR/SSR) and Mode-S multilateration arrays.',
    descriptionAr: 'الإشراف على تشغيل ومعايرة وصيانة منظومات الرادار الأولية والثانوية (PSR/SSR) ومصفوفات تحديد المواقع Mode-S لضمان استمرارية التغطية الرادارية.',
    requirements: [
      'Bachelor degree in Avionics, Electronics, or Telecommunications Engineering',
      'Certification in ICAO ATSEP (Surveillance Domain)',
      'Accredited by Saudi Council of Engineers (SCE)',
      'Familiarity with Eurocontrol ASTERIX data formatting standards'
    ],
    requirementsAr: [
      'بكالوريوس في هندسة إلكترونيات الطيران أو الاتصالات أو الإلكترونيات',
      'شهادة اعتماد كوادر إلكترونيات سلامة الحركة الجوية (ICAO ATSEP)',
      'اعتماد مهني ساري من الهيئة السعودية للمهندسين',
      'معرفة متخصصة ببروتوكولات بيانات الرادار الأوروبية ASTERIX'
    ]
  },
  {
    name: 'UAV / Drone Traffic Management (UTM) Specialist',
    codePrefix: 'REQ-2026-250',
    title: 'Unmanned Aircraft Traffic Management (UTM) Specialist',
    titleAr: 'أخصائي تنظيم وإدارة حركة الطائرات المسيرة بدون طيار (UTM)',
    department: 'Advanced Air Mobility & Drone Operations Unit',
    departmentAr: 'وحدة التنقل الجوي المتقدم وحركة الطائرات بدون طيار',
    location: 'NEOM & Riyadh, Saudi Arabia',
    experienceLevel: 'Mid-Senior Level (3+ Years)',
    salaryRange: '27,000 - 36,000 SAR / Month',
    employmentType: 'Full-time',
    deadline: '28 Dec 2026',
    description: 'Pioneer the safe integration of commercial drone corridors and eVTOL operations into Saudi low-altitude airspace. Collaborate with civil and defense stakeholders.',
    descriptionAr: 'ريادة دمج ممرات الطائرات المسيرة التجارية وطائرات الإقلاع العمودي الكهربائي (eVTOL) في المجال الجوي منخفض الارتفاع بالتنسيق مع الجهات التنظيمية.',
    requirements: [
      'Degree in Aerospace Engineering, Aviation Management, or Computer Science',
      'Experience with ASTM F38 UTM standards and dynamic airspace geo-fencing',
      'Proficiency in automated flight authorization and digital telemetry streams',
      'Bilingual Arabic and English proficiency'
    ],
    requirementsAr: [
      'مؤهل جامعي في هندسة الطيران أو إدارة الطيران أو علوم الحاسب',
      'خبرة في معايير ASTM لتنظيم الطائرات المسيرة وتقنيات السياج الجغرافي الذكي',
      'إجادة أنظمة التصريح الآلي وتدفقات القياس عن بُعد (Telemetry)',
      'إتقان اللغتين العربية والإنجليزية'
    ]
  },
  {
    name: 'Aeronautical Cybersecurity & Zero-Trust Analyst',
    codePrefix: 'REQ-2026-270',
    title: 'Aeronautical Cyber Defense & NCA Compliance Analyst',
    titleAr: 'محلل الدفاع السيبراني للملاحة الجوية والامتثال الوطني',
    department: 'Aviation Cybersecurity & Critical Infrastructure Protection',
    departmentAr: 'إدارة الأمن السيبراني وحماية البنية الملاحية الحيوية',
    location: 'Riyadh, Saudi Arabia',
    experienceLevel: 'Senior Level (5+ Years)',
    salaryRange: '28,000 - 37,000 SAR / Month',
    employmentType: 'Full-time',
    deadline: '25 Dec 2026',
    description: 'Defend Saudi Air Navigation operational technology (OT) network, ADS-B message integrity, and maintain strict alignment with NCA ECC-1:2018 and PDPL data residency mandates.',
    descriptionAr: 'حماية الشبكات التشغيلية (OT) لمنظومة الملاحة الجوية وسلامة إشارات ADS-B وضمان الامتثال التام لضوابط الهيئة الوطنية للأمن السيبراني ونظام حماية البيانات الشخصية.',
    requirements: [
      'Bachelor degree in Information Security, Computer Engineering, or related field',
      'Recognized credentials: CISSP, CEH, or GIAC Defensible Infrastructure',
      'Deep knowledge of NCA Essential Cybersecurity Controls (ECC-1:2018)',
      'Hands-on experience in SCADA/ICS/Aviation data bus packet inspection'
    ],
    requirementsAr: [
      'بكالوريوس في أمن المعلومات أو هندسة الحاسب أو تخصص ذي صلة',
      'شهادات مهنية معتمدة: CISSP أو شهادات معهد SANS للأمن السيبراني',
      'إلمام شامل بضوابط الهيئة الوطنية للأمن السيبراني NCA ECC-1:2018 ونظام PDPL',
      'خبرة عملية في حماية الشبكات التشغيلية الصناعية وشبكات الطيران'
    ]
  }
];

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated
}) => {
  const { language } = useLanguage();
  const { addJobRequisition } = useCandidate();

  // Form State
  const [code, setCode] = useState(() => `REQ-2026-${Math.floor(210 + Math.random() * 80)}`);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [department, setDepartment] = useState('Area Control Center (Riyadh ACC)');
  const [departmentAr, setDepartmentAr] = useState('مركز مراقبة المنطقة - الرياض');
  const [location, setLocation] = useState('Riyadh, Saudi Arabia');
  const [experienceLevel, setExperienceLevel] = useState('Senior Level (5+ Years)');
  const [salaryRange, setSalaryRange] = useState('26,000 - 34,000 SAR / Month');
  const [employmentType, setEmploymentType] = useState('Full-time / Shift Rotation');
  const [deadline, setDeadline] = useState('25 Dec 2026');
  const [status, setStatus] = useState<JobRequisition['status']>('Open - Screening Active');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  // Dynamic requirements list
  const [requirements, setRequirements] = useState<string[]>([
    'Valid GACA Air Traffic Controller License with Radar Rating',
    'Class 1 Aviation Medical Certificate (Valid)',
    'ICAO English Language Proficiency Level 5 or higher'
  ]);
  const [requirementsAr, setRequirementsAr] = useState<string[]>([
    'رخصة مراقب ملاحة جوية سارية من الهيئة العامة للطيران المدني',
    'شهادة لياقة طبية ملاحية فئة أولى سارية الصلاحية',
    'مستوى كفاءة لغوية معتمد من منظمة الطيران المدني الدولي (ICAO Level 5+)'
  ]);

  const [newReqEn, setNewReqEn] = useState('');
  const [newReqAr, setNewReqAr] = useState('');

  // Options
  const [publishImmediate, setPublishImmediate] = useState(true);
  const [autoGenQuestions, setAutoGenQuestions] = useState(true);
  const [syncOracle, setSyncOracle] = useState(true);

  // Success State
  const [createdJob, setCreatedJob] = useState<JobRequisition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: JobTemplatePreset) => {
    setCode(preset.codePrefix);
    setTitle(preset.title);
    setTitleAr(preset.titleAr);
    setDepartment(preset.department);
    setDepartmentAr(preset.departmentAr);
    setLocation(preset.location);
    setExperienceLevel(preset.experienceLevel);
    setSalaryRange(preset.salaryRange);
    setEmploymentType(preset.employmentType);
    setDeadline(preset.deadline);
    setDescription(preset.description);
    setDescriptionAr(preset.descriptionAr);
    setRequirements([...preset.requirements]);
    setRequirementsAr([...preset.requirementsAr]);
  };

  const handleAddRequirement = () => {
    if (!newReqEn.trim() && !newReqAr.trim()) return;
    const enText = newReqEn.trim() || newReqAr.trim();
    const arText = newReqAr.trim() || newReqEn.trim();
    setRequirements(prev => [...prev, enText]);
    setRequirementsAr(prev => [...prev, arText]);
    setNewReqEn('');
    setNewReqAr('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== idx));
    setRequirementsAr(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال مسمى الوظيفة' : 'Please enter a job title');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newJob = addJobRequisition({
        code,
        title: title.trim(),
        titleAr: titleAr.trim() || title.trim(),
        department,
        departmentAr,
        location,
        experienceLevel,
        salaryRange,
        employmentType,
        deadline,
        status,
        description: description.trim() || 'Saudi Air Navigation Services operational opening.',
        descriptionAr: descriptionAr.trim() || 'وظيفة شاغرة لدى شركة خدمات الملاحة الجوية السعودية.',
        requirements,
        requirementsAr,
        isNew: true
      });

      setIsSubmitting(false);
      setCreatedJob(newJob);
      if (onJobCreated) {
        onJobCreated(newJob);
      }
    }, 600);
  };

  const handleReset = () => {
    setCreatedJob(null);
    setCode(`REQ-2026-${Math.floor(210 + Math.random() * 80)}`);
    setTitle('');
    setTitleAr('');
    setDescription('');
    setDescriptionAr('');
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 40, 25, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 820,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Briefcase size={20} color="#34D399" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                {language === 'ar'
                  ? 'نشر وظيفة ملاحية جديدة (SANS Job Posting & Oracle HCM)'
                  : 'Post New Air Navigation Job Requisition'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85 }}>
                {language === 'ar'
                  ? 'ستكون الوظيفة متاحة فوراً للمرشحين للتقديم والفرز الآلي والمقابلة الذكية'
                  : 'Immediately published to Candidate Career Portal with automated AI scoring rubrics'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {createdJob ? (
            /* SUCCESS CELEBRATION VIEW */
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#E8F5E9',
                  border: '3px solid var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={36} color="var(--color-primary)" />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                {language === 'ar' ? 'تم نشر الوظيفة بنجاح!' : 'Job Requisition Published Successfully!'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6, maxWidth: 520, margin: '6px auto 20px' }}>
                {language === 'ar'
                  ? `تم إدراج الوظيفة برمز ${createdJob.code} وأصبحت معلنة ومتاحة لجميع المتقدمين في بوابة التوظيف مع تفعيل سيناريوهات المقابلة الذكية ومزامنة نظام أوراكل فيوجن.`
                  : `Requisition ${createdJob.code} is now live on the candidate career portal. AI question rubrics have been synthesized and Oracle HCM Gateway notified.`}
              </p>

              {/* Summary Card */}
              <div
                style={{
                  backgroundColor: 'var(--color-subtle-green)',
                  border: '1.5px solid var(--color-border-green)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  textAlign: 'left',
                  maxWidth: 580,
                  margin: '0 auto 24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge outline-badge" style={{ fontWeight: 800 }}>
                    {createdJob.code}
                  </span>
                  <span className="badge green-badge">
                    {language === 'ar' ? 'معلنة ونشطة' : 'Live & Active'}
                  </span>
                </div>
                <h4 style={{ margin: '4px 0', fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                  {language === 'ar' ? createdJob.titleAr : createdJob.title}
                </h4>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
                  <span><Building2 size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {createdJob.department}</span>
                  <span><MapPin size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {createdJob.location}</span>
                  <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Deadline: {createdJob.deadline}</span>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border-green)', fontSize: 12 }}>
                  <strong>{language === 'ar' ? 'المعايير المطلوبة:' : 'Mandatory Criteria:'}</strong> {createdJob.requirements?.length || 0} requirements specified &bull; AI Evaluation Matrix ready.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontWeight: 700 }}
                  onClick={onClose}
                >
                  <CheckCircle2 size={16} />
                  <span>{language === 'ar' ? 'تم / إغلاق' : 'Done / Close'}</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  <Plus size={15} />
                  <span>{language === 'ar' ? 'نشر وظيفة أخرى' : 'Post Another Requisition'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* POST JOB FORM */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Presets Bar */}
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--color-subtle-green)',
                  border: '1px solid var(--color-border-green)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  <Wand2 size={15} color="var(--color-primary)" />
                  <span>{language === 'ar' ? 'نماذج وظائف ملاحية جاهزة (Quick SANS Templates):' : 'Pre-configured Aviation Job Templates (Click to fill):'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TEMPLATE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '4px 10px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
                      onClick={() => handleApplyPreset(preset)}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 1: CORE IDENTIFIERS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'رمز الوظيفة (Requisition Code)' : 'Job Requisition Code'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%', fontWeight: 700, color: 'var(--color-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'المسمى الوظيفي بالإنجليزية (Job Title EN)' : 'Job Title (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Air Traffic Controller (Radar Rating)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Title Arabic & Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'المسمى الوظيفي بالعربية (Job Title AR)' : 'Job Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: أخصائي أول مراقبة ملاحة جوية"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'الإدارة أو القطاع (Department / Unit)' : 'Department / Sector'} *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (e.target.value.includes('ACC')) setDepartmentAr('مركز مراقبة المنطقة - الرياض');
                      else if (e.target.value.includes('Engineering')) setDepartmentAr('الإدارة العامة لهندسة الاتصالات والملاحة');
                      else if (e.target.value.includes('Approach')) setDepartmentAr('وحدة رادار الاقتراب بمطار الملك عبدالعزيز');
                      else if (e.target.value.includes('Safety')) setDepartmentAr('إدارة السلامة والمعايير الملاحية');
                      else setDepartmentAr('الإدارة العامة للملاحة الجوية');
                    }}
                    className="clean-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Area Control Center (Riyadh ACC)">Area Control Center (Riyadh ACC)</option>
                    <option value="Terminal Approach Control (Jeddah KAIA)">Terminal Approach Control (Jeddah KAIA)</option>
                    <option value="CNS/ATM Radar Engineering Directorate">CNS/ATM Radar Engineering Directorate</option>
                    <option value="Airspace Safety & Standards Office">Airspace Safety & Standards Office</option>
                    <option value="Aviation Cybersecurity & Defense Unit">Aviation Cybersecurity & Defense Unit</option>
                    <option value="Advanced Air Mobility (Drone UTM Unit)">Advanced Air Mobility (Drone UTM Unit)</option>
                    <option value="Saudi Academy of Civil Aviation (SACA)">Saudi Academy of Civil Aviation (SACA)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: LOCATION, SALARY, EXPERIENCE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'الموقع الجغرافي (Location)' : 'Location'}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="clean-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Riyadh, Saudi Arabia">Riyadh, Saudi Arabia</option>
                    <option value="Jeddah, Saudi Arabia">Jeddah, Saudi Arabia</option>
                    <option value="Dammam, Saudi Arabia">Dammam, Saudi Arabia</option>
                    <option value="Medina, Saudi Arabia">Medina, Saudi Arabia</option>
                    <option value="NEOM, Saudi Arabia">NEOM, Saudi Arabia</option>
                    <option value="Abha, Saudi Arabia">Abha, Saudi Arabia</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'مستوى الخبرة (Experience Level)' : 'Experience Level'}
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="clean-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Entry Level / Cadet (0-2 Years)">Entry Level / Cadet (0-2 Years)</option>
                    <option value="Mid-Level (3-5 Years)">Mid-Level (3-5 Years)</option>
                    <option value="Senior Level (5+ Years)">Senior Level (5+ Years)</option>
                    <option value="Lead / Instructor (8+ Years)">Lead / Instructor (8+ Years)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'نطاق الراتب الشهري (Salary)' : 'Salary Range'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000 - 34,000 SAR / Month"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'آخر موعد للتقديم (Deadline)' : 'Application Deadline'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20 Dec 2026"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* SECTION 3: DESCRIPTIONS EN & AR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'الوصف الوظيفي (Description EN)' : 'Job Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of duties, airspace sector responsibilities, and operational safety..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    {language === 'ar' ? 'الوصف الوظيفي بالعربية (Description AR)' : 'Job Description (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    placeholder="نبذة عن المهام التشغيلية وإدارة الحركة الجوية وتطبيق معايير السلامة الملاحية..."
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    className="clean-input"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* SECTION 4: MANDATORY QUALIFICATIONS / GACA LICENSING */}
              <div
                style={{
                  padding: 14,
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={16} color="var(--color-primary)" />
                    <span>{language === 'ar' ? 'المعايير والمتطلبات الإلزامية للفرز الآلي (GACA Criteria):' : 'Mandatory Criteria & GACA Licensing Requirements for AI Screening:'}</span>
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {requirements.length} {language === 'ar' ? 'شروط مسجلة' : 'criteria active'}
                  </span>
                </div>

                {/* Requirements list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {requirements.map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={14} color="var(--color-accent)" />
                        <span>{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                        title="Remove requirement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add requirement input */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Add requirement in English (e.g. ICAO Level 5, Class 1 Medical...)"
                    value={newReqEn}
                    onChange={(e) => setNewReqEn(e.target.value)}
                    className="clean-input"
                    style={{ flex: 1, minWidth: 200, fontSize: 12 }}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="إضافة المتطلب بالعربية..."
                    value={newReqAr}
                    onChange={(e) => setNewReqAr(e.target.value)}
                    className="clean-input"
                    style={{ flex: 1, minWidth: 200, fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddRequirement}
                  >
                    <Plus size={14} />
                    <span>{language === 'ar' ? 'إضافة متطلب' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 5: AUTOMATION TOGGLES */}
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--color-subtle-green)',
                  border: '1px solid var(--color-border-green)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={publishImmediate}
                    onChange={(e) => setPublishImmediate(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong>{language === 'ar' ? 'نشر فوري في بوابة المرشحين' : 'Publish Immediately to SANS Candidate Career Portal'}</strong> — {language === 'ar' ? 'تظهر مباشرة للمرشحين للتقديم عليها' : 'Visible for candidates to apply right away'}
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoGenQuestions}
                    onChange={(e) => setAutoGenQuestions(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong>{language === 'ar' ? 'توليد أسئلة المقابلة الذكية آلياً' : 'Synthesize AI Virtual Interview Scenarios'}</strong> — {language === 'ar' ? 'إعداد بنك أسئلة مخصص لهذه الوظيفة' : 'Pre-populates audio/text interview rubric bank'}
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={syncOracle}
                    onChange={(e) => setSyncOracle(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong>{language === 'ar' ? 'مزامنة مع أوراكل فيوجن للموارد البشرية' : 'Sync to Oracle Fusion HCM REST API Gateway'}</strong> (/recruitingJobRequisitions)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 22px', fontWeight: 700 }}
                  disabled={isSubmitting}
                >
                  <Sparkles size={16} />
                  <span>
                    {isSubmitting
                      ? (language === 'ar' ? 'جاري النشر والمزامنة...' : 'Publishing Requisition...')
                      : (language === 'ar' ? 'نشر الوظيفة الآن في بوابة المرشحين ←' : 'Publish Requisition to Candidates Now →')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
