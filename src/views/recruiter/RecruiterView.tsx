import React, { useState, useRef } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { VoicePlayer } from '../../components/voice/VoicePlayer';
import { XaiModal } from '../../components/modals/XaiModal';
import { AiScreeningSimulationModal } from '../../components/candidate/AiScreeningSimulationModal';
import { BulkAiScreeningModal } from '../../components/modals/BulkAiScreeningModal';
import { Candidate, CandidateApplication } from '../../types';
import {
  FileUp,
  Sparkles,
  Sliders,
  CheckCircle2,
  ClockAlert,
  Search,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  UserCheck,
  Award,
  Video,
  FileCheck,
  Clock,
  ThumbsUp,
  FolderOpen,
  UploadCloud,
  RefreshCw,
  Zap,
  Briefcase,
  ChevronRight,
  Eye,
  Filter,
  ShieldCheck,
  Users,
  FileText,
  X,
  Mic
} from 'lucide-react';
import { InterviewDetailsModal } from '../../components/modals/InterviewDetailsModal';
import { getCandidateAllInterviewAnswers } from '../../data/candidateInterviewAnswers';

export const RecruiterView: React.FC = () => {
  const { 
    candidates, 
    weights, 
    updateWeight, 
    executeOracleSync,
    batchUploadSimulated,
    triggerBatchUpload,
    bulkUploadCvs,
    auditLogs,
    applications,
    scanCandidateCvByRecruiter,
    approveShortlistForInterview,
    approveFinalSelection,
    activeInterviewApp,
    setActiveInterviewApp,
    bulkScanCandidateCvs,
    bulkApproveShortlists,
    allRequisitions
  } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab, setActiveNavTab, role } = useAuthRbac();

  const [searchQuery, setSearchQuery] = useState('');
  const [weightsPanelOpen, setWeightsPanelOpen] = useState(false);
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);
  const [activeCandidateForPreview, setActiveCandidateForPreview] = useState<Candidate>(candidates[0]);
  const [scanningApp, setScanningApp] = useState<CandidateApplication | null>(null);
  const [selectedInterviewAppId, setSelectedInterviewAppId] = useState<string>(
    applications.find(a => a.interviewScore)?.id || applications[0]?.id || ''
  );
  const [finalOfferSuccess, setFinalOfferSuccess] = useState<string | null>(null);
  const [interviewJobFilter, setInterviewJobFilter] = useState<string>('ALL');
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState<boolean>(false);
  const [selectedQuestionTab, setSelectedQuestionTab] = useState<number | 'ALL'>('ALL');

  // Bulk Upload states (Section 4.1.1)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  // Bulk AI Scan states (Section 4.1.3)
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [showBulkScanModal, setShowBulkScanModal] = useState(false);
  const [bulkScanSuccessMessage, setBulkScanSuccessMessage] = useState<string | null>(null);

  const unscannedApps = applications.filter(a => !a.cvScannedByRecruiter);
  const unscannedCount = unscannedApps.length;

  // Jobs & AI Candidate Rankings State (Section 4.1.3 & 4.1.4)
  const [selectedRankingJobId, setSelectedRankingJobId] = useState<string>('req-084');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [candidateScoreTierFilter, setCandidateScoreTierFilter] = useState<'all' | 'top' | 'qualified' | 'shortlisted'>('all');
  const [jobCandidateSearchQuery, setJobCandidateSearchQuery] = useState<string>('');

  const getCandidatesForJob = (jobId: string) => {
    const job = allRequisitions.find(r => r.id === jobId || r.code === jobId) || allRequisitions[0];
    const jobApps = applications.filter(a => a.requisitionId === job.id || a.requisitionCode === job.code);

    return candidates.map(cand => {
      const app = jobApps.find(a => a.candidateId === cand.id);
      let domainFit = cand.rawMatchScore;

      if (job.id === 'req-084' || job.id === 'req-150') {
        if (cand.certifications.some(c => c.toLowerCase().includes('radar') || c.toLowerCase().includes('atc') || c.toLowerCase().includes('controller'))) {
          domainFit = cand.rawMatchScore;
        } else {
          domainFit = Math.max(55, cand.rawMatchScore - 18);
        }
      } else if (job.id === 'req-112') {
        if (cand.currentTitle.toLowerCase().includes('cns') || cand.currentTitle.toLowerCase().includes('radar') || cand.education.toLowerCase().includes('engineering')) {
          domainFit = cand.rawMatchScore;
        } else {
          domainFit = Math.max(50, cand.rawMatchScore - 22);
        }
      } else if (job.id === 'req-045') {
        if (cand.currentTitle.toLowerCase().includes('safety') || cand.currentTitle.toLowerCase().includes('aim') || cand.currentTitle.toLowerCase().includes('dispatch')) {
          domainFit = cand.rawMatchScore;
        } else {
          domainFit = Math.max(55, cand.rawMatchScore - 16);
        }
      } else if (job.id === 'req-188') {
        if (cand.currentTitle.toLowerCase().includes('cyber') || cand.keyStrengths.toLowerCase().includes('security') || cand.certifications.some(c => c.toLowerCase().includes('nca') || c.toLowerCase().includes('cissp'))) {
          domainFit = cand.rawMatchScore;
        } else {
          domainFit = Math.max(45, cand.rawMatchScore - 28);
        }
      }

      const finalScore = cand.overrideScore ?? app?.screeningScore ?? domainFit;

      return {
        candidate: cand,
        application: app,
        matchScore: finalScore,
        isDirectApplicant: !!app
      };
    })
    .filter(item => item.isDirectApplicant || item.matchScore >= 68)
    .sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleExecuteBulkUpload = (fileList?: FileList | null) => {
    setIsUploadingBatch(true);
    setUploadStep(1); // 1. Anti-Malware verification

    const customFiles = fileList && fileList.length > 0 
      ? Array.from(fileList).map(f => ({ name: f.name, size: f.size }))
      : undefined;

    setTimeout(() => {
      setUploadStep(2); // 2. Deduplication check
      setTimeout(() => {
        setUploadStep(3); // 3. Bilingual OCR extraction
        setTimeout(() => {
          setUploadStep(4); // 4. Structured entity mapping
          setTimeout(() => {
            const res = bulkUploadCvs(customFiles);
            setIsUploadingBatch(false);
            setUploadStep(0);
            setBulkSuccessMessage(
              language === 'ar'
                ? `تم استيعاب وفحص ${res.count} سير ذاتية ملاحية بنجاح وإدراجها في مسار التوظيف والفرز الذكي!`
                : `Successfully ingested and OCR-parsed ${res.count} aviation candidate CVs into Recruitment Hub pipeline!`
            );
            setTimeout(() => setBulkSuccessMessage(null), 6000);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.currentTitle.toLowerCase().includes(q) ||
      c.keyStrengths.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* ================= RECRUITMENT HUB ================= */}
      {activeNavTab === 'recruiter_hub' && (
        <div>
          <div className="page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                  {language === 'ar' ? 'مركز عمليات التوظيف والفرز الذكي (Recruitment Hub)' : 'Recruitment Operations & Candidate Ingestion Hub'}
                </h1>
                <span className="badge green-badge" style={{ fontSize: 11, fontWeight: 700 }}>
                  {role === 'manager'
                    ? (language === 'ar' ? 'عرض مدير التوظيف: كابتن خالد العتيبي' : 'Hiring Manager Access: Capt. Khalid Al-Otaibi')
                    : role === 'admin'
                      ? (language === 'ar' ? 'عرض إدارة الموارد البشرية: منى الدوسري' : 'HR Admin Access: Mona Al-Dawsari')
                      : (language === 'ar' ? 'عرض استقطاب الكفاءات: سارة الحربي' : 'Senior Recruiter Lead: Sarah Al-Harbi')}
                </span>
                <span className="badge outline-badge" style={{ fontSize: 11 }}>
                  {language === 'ar' ? 'متاح لـ: مسؤولة التوظيف • الموارد البشرية • مدير التوظيف' : 'Visible to: Senior Recruiter • HR • Hiring Manager'}
                </span>
              </div>
              <p className="page-subtitle" style={{ marginTop: 4 }}>
                {language === 'ar' 
                  ? 'متابعة مسار التوظيف والفرز الذكي واستيعاب السير الذاتية واعتماد القوائم القصيرة والمقابلات' 
                  : 'Holistic funnel tracking, candidate CV intake, AI screening approvals, and virtual interview evaluations.'}
              </p>
            </div>

            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderLeft: language === 'ar' ? '1px solid #FCD34D' : '4px solid #D97706',
              borderRight: language === 'ar' ? '4px solid #D97706' : '1px solid #FCD34D',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <ClockAlert size={18} color="#D97706" />
              <div style={{ fontSize: 12, color: '#92400E' }}>
                <strong>SLA Watchdog:</strong> 2 candidates pending virtual interview invitation (&gt; 24h threshold).
              </div>
              <button 
                className="btn btn-sm btn-outline" 
                style={{ borderColor: '#92400E', color: '#92400E' }}
                onClick={() => setActiveNavTab('ai_screening')}
              >
                {language === 'ar' ? 'عرض المرشحين' : 'Review'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
              <button 
                className="btn btn-sm btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                onClick={() => setActiveNavTab('jobs_ai_rankings')}
              >
                <Briefcase size={14} />
                <span>{language === 'ar' ? 'دليل الوظائف وتصنيف المرشحين بالذكاء الاصطناعي ←' : 'Explore Jobs & AI Candidate Rankings →'}</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-box">
                <FileUp size={22} />
              </div>
              <div className="metric-content">
                <span className="metric-title">{language === 'ar' ? 'إجمالي السير الذاتية' : 'CV Batch Ingestion'}</span>
                <div className="metric-value">
                  142 <span className="metric-trend">&#8593; 24 new</span>
                </div>
                <span className="metric-sub">{language === 'ar' ? 'تم المسح الضوئي العربي/الإنجليزي' : 'Bilingual OCR parsed'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box">
                <Sparkles size={22} />
              </div>
              <div className="metric-content">
                <span className="metric-title">{language === 'ar' ? 'دقة المطابقة الخوارزمية' : 'AI Matching Accuracy'}</span>
                <div className="metric-value">
                  96.2% <span className="badge green-badge" style={{ fontSize: 10 }}>Target: 95%</span>
                </div>
                <span className="metric-sub">{language === 'ar' ? 'معتمدة عبر بيانات التدقيق المرجعية' : 'Empirical benchmark'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box">
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-content">
                <span className="metric-title">{language === 'ar' ? 'المقابلات الذكية المنجزة' : 'Interviews Completed'}</span>
                <div className="metric-value">12 / 18</div>
                <span className="metric-sub">{language === 'ar' ? '6 بانتظار استجابة المتقدم' : '6 pending candidate input'}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box">
                <Shield size={22} />
              </div>
              <div className="metric-content">
                <span className="metric-title">{language === 'ar' ? 'التحقق الأمني ونفاذ' : 'Nafath & AMN Clearances'}</span>
                <div className="metric-value">8 Approved</div>
                <span className="metric-sub">{language === 'ar' ? '4 قيد التدقيق لدى أمن الملاحة' : '4 in security progress'}</span>
              </div>
            </div>
          </div>

          {/* Recruiter CV Ingestion & AI Screening Pipeline Table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--color-primary)" />
                  {language === 'ar' 
                    ? 'طابور استيعاب طلبات المرشحين والفرز الذكي (Recruiter CV Pipeline)' 
                    : 'Candidate CV Intake & Recruiter AI Screening Pipeline'}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {language === 'ar'
                    ? 'الطلبات المرفوعة من بوابة المرشح: يقوم مسؤول التوظيف بإجراء الفرز الآلي، ثم اعتماد القائمة القصيرة لفتح المقابلة الافتراضية، ومراجعة التسجيل الصوتي للاختيار النهائي.'
                    : 'Live candidate submissions: Recruiter executes AI CV scan, approves shortlist to unlock virtual interview, reviews verbatim audio/transcript, and issues final selection.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 800,
                    backgroundColor: '#0F5132',
                    borderColor: '#0F5132',
                    boxShadow: '0 2px 4px rgba(15, 81, 50, 0.25)'
                  }}
                  onClick={() => setShowBulkScanModal(true)}
                  disabled={applications.length === 0}
                  title="Execute batch AI screening & compatibility evaluation across candidate resumes"
                >
                  <Zap size={14} color="#34D399" />
                  <span>
                    {selectedAppIds.length > 0
                      ? (language === 'ar' ? `⚡ فحص المحدد بالذكاء الاصطناعي (${selectedAppIds.length})` : `⚡ Bulk AI Scan Selected (${selectedAppIds.length})`)
                      : unscannedCount > 0
                        ? (language === 'ar' ? `⚡ فحص جماعي بالذكاء الاصطناعي (${unscannedCount})` : `⚡ Run Bulk AI Scan (${unscannedCount} Pending)`)
                        : (language === 'ar' ? '⚡ إعادة فحص جماعي بالذكاء الاصطناعي' : '⚡ Run Bulk AI Scan (All)')}
                  </span>
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleExecuteBulkUpload(e.target.files)}
                />
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  onClick={() => handleExecuteBulkUpload()}
                  disabled={isUploadingBatch}
                >
                  <FileUp size={14} />
                  <span>
                    {isUploadingBatch 
                      ? (language === 'ar' ? 'جاري الفحص والاستيعاب...' : 'Ingesting Batch...') 
                      : (language === 'ar' ? 'رفع دفعة سير ذاتية (Bulk Upload) +' : 'Upload Bulk CVs (Batch) +')}
                  </span>
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingBatch}
                  title="Select local PDF/DOCX resumes"
                >
                  <FolderOpen size={13} />
                  <span>{language === 'ar' ? 'اختيار ملفات' : 'Select Files'}</span>
                </button>
                <span className="badge green-badge" style={{ fontSize: 11 }}>
                  {applications.length} {language === 'ar' ? 'طلبات قيد المعالجة' : 'Active Requisitions'}
                </span>
              </div>
            </div>

            {/* Bulk Upload Success Banner */}
            {bulkSuccessMessage && (
              <div style={{
                margin: '0 20px 16px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-soft-green)',
                border: '1px solid var(--color-border-green)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--color-primary-dark)',
                fontSize: 13,
                fontWeight: 600
              }}>
                <CheckCircle2 size={18} color="var(--color-primary)" />
                <span>{bulkSuccessMessage}</span>
              </div>
            )}

            {/* Bulk AI Scan Success Banner */}
            {bulkScanSuccessMessage && (
              <div style={{
                margin: '0 20px 16px',
                padding: '12px 16px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#065F46',
                fontSize: 13,
                fontWeight: 600
              }}>
                <Zap size={18} color="#059669" />
                <span>{bulkScanSuccessMessage}</span>
              </div>
            )}

            {/* Batch Selection Action Bar */}
            {selectedAppIds.length > 0 && (
              <div style={{
                margin: '0 20px 14px',
                padding: '10px 16px',
                backgroundColor: 'var(--color-primary-dark)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                  <CheckCircle2 size={16} color="#34D399" />
                  <span>{selectedAppIds.length} {language === 'ar' ? 'مرشحين محددين في القائمة' : 'Candidates Selected'}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                    onClick={() => setShowBulkScanModal(true)}
                  >
                    <Zap size={13} color="#34D399" />
                    <span>{language === 'ar' ? 'فحص المحدد بالذكاء الاصطناعي' : 'Run Bulk AI Scan'}</span>
                  </button>

                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                    onClick={() => {
                      const res = bulkApproveShortlists(selectedAppIds);
                      setSelectedAppIds([]);
                      setBulkScanSuccessMessage(
                        language === 'ar'
                          ? `تم اعتماد القائمة القصيرة لـ ${res.approvedCount} مرشحين وفتح المقابلات الافتراضية بنجاح!`
                          : `Successfully approved shortlists and unlocked virtual interviews for ${res.approvedCount} candidates!`
                      );
                      setTimeout(() => setBulkScanSuccessMessage(null), 5000);
                    }}
                  >
                    <UserCheck size={13} />
                    <span>{language === 'ar' ? 'اعتماد القائمة للمحدد' : 'Approve Shortlists'}</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline"
                    style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', fontSize: 11 }}
                    onClick={() => setSelectedAppIds([])}
                  >
                    <span>{language === 'ar' ? 'إلغاء التحديد' : 'Deselect All'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Section 4.1.1 Progress Stepper */}
            {isUploadingBatch && (
              <div style={{
                margin: '0 20px 16px',
                padding: 14,
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: uploadStep >= 1 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: uploadStep === 1 ? 800 : 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>1. Anti-Malware Clean (ClamAV)</span>
                </div>
                <div style={{ width: 20, height: 2, backgroundColor: uploadStep >= 2 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: uploadStep >= 2 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: uploadStep === 2 ? 800 : 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>2. Deduplication Verified</span>
                </div>
                <div style={{ width: 20, height: 2, backgroundColor: uploadStep >= 3 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: uploadStep >= 3 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: uploadStep === 3 ? 800 : 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>3. Arabic/English OCR Extracted</span>
                </div>
                <div style={{ width: 20, height: 2, backgroundColor: uploadStep >= 4 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: uploadStep >= 4 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: uploadStep === 4 ? 800 : 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>4. Entities Structured</span>
                </div>
              </div>
            )}

            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        checked={applications.length > 0 && selectedAppIds.length === applications.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAppIds(applications.map(a => a.id));
                          } else {
                            setSelectedAppIds([]);
                          }
                        }}
                        title="Select All Candidates"
                      />
                    </th>
                    <th>{language === 'ar' ? 'المرشح / المرجع' : 'Candidate / Ref'}</th>
                    <th>{language === 'ar' ? 'الوظيفة المتقدم لها' : 'Position'}</th>
                    <th>{language === 'ar' ? 'ملف السيرة المرفوع' : 'Uploaded CV Document'}</th>
                    <th>{language === 'ar' ? 'حالة الفرز الآلي' : 'AI Screening'}</th>
                    <th>{language === 'ar' ? 'اعتماد القائمة القصيرة' : 'Shortlist Approval'}</th>
                    <th>{language === 'ar' ? 'المقابلة الافتراضية' : 'Virtual Interview'}</th>
                    <th>{language === 'ar' ? 'الاختيار النهائي' : 'Final Selection'}</th>
                    <th>{language === 'ar' ? 'الإجراء المطلوب' : 'Recruiter Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => {
                    const candidateName = app.candidateName || (app.id.includes('APP-2026') ? 'Mohammad Al-Zahrani' : 'Candidate Applicant');
                    const candidateNameAr = app.candidateNameAr || (app.id.includes('APP-2026') ? 'محمد الزهراني' : 'متقدم جديد');

                    return (
                      <tr key={app.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                            checked={selectedAppIds.includes(app.id)}
                            onChange={() => {
                              setSelectedAppIds(prev =>
                                prev.includes(app.id) ? prev.filter(id => id !== app.id) : [...prev, app.id]
                              );
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            {language === 'ar' ? candidateNameAr : candidateName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {app.id} &bull; {app.submittedAt}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: 12 }}>{app.jobTitle}</strong>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {app.requisitionCode} &bull; {app.location}
                          </div>
                        </td>
                        <td>
                          <span className="badge outline-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            <FileCheck size={12} color="var(--color-primary)" />
                            {app.cvFileName || 'Candidate_CV.pdf'}
                          </span>
                        </td>
                        <td>
                          {!app.cvScannedByRecruiter ? (
                            <span className="badge score-low" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                              <Clock size={11} />
                              {language === 'ar' ? 'بانتظار الفرز الآلي' : 'Pending AI Scan'}
                            </span>
                          ) : (
                            <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                              <CheckCircle2 size={12} />
                              {language === 'ar' ? `تم الفرز (${app.screeningScore || 94}%)` : `AI Matched (${app.screeningScore || 94}%)`}
                            </span>
                          )}
                        </td>
                        <td>
                          {!app.cvScannedByRecruiter ? (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
                          ) : !app.shortlistedByRecruiter ? (
                            <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: 11 }}>
                              {language === 'ar' ? 'بانتظار اعتماد التوظيف' : 'Awaiting Shortlist'}
                            </span>
                          ) : (
                            <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                              <UserCheck size={12} />
                              {language === 'ar' ? 'تمت الموافقة ✓' : 'Shortlist Approved ✓'}
                            </span>
                          )}
                        </td>
                        <td>
                          {!app.shortlistedByRecruiter ? (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              🔒 {language === 'ar' ? 'مغلقة حتى الاعتماد' : 'Locked for Candidate'}
                            </span>
                          ) : !app.interviewScore ? (
                            <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: 11 }}>
                              <Clock size={11} style={{ marginRight: 3 }} />
                              {language === 'ar' ? 'متاحة للمرشح (بانتظار الإجابة)' : 'Unlocked (Awaiting Candidate)'}
                            </span>
                          ) : (
                            <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                              <Video size={12} />
                              {language === 'ar' ? `منجزة (${app.interviewScore}/100)` : `Completed (${app.interviewScore}/100)`}
                            </span>
                          )}
                        </td>
                        <td>
                          {app.finalSelected ? (
                            <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                              <Award size={12} />
                              {language === 'ar' ? 'عرض العمل معتمد' : 'Offer Dispatched'}
                            </span>
                          ) : app.interviewScore ? (
                            <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', fontSize: 11, fontWeight: 700 }}>
                              {language === 'ar' ? 'جاهز للاختيار النهائي' : 'Ready for Selection'}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {!app.cvScannedByRecruiter ? (
                              <button 
                                className="btn btn-sm btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
                                onClick={() => setScanningApp(app)}
                              >
                                <Sparkles size={12} />
                                {language === 'ar' ? 'فحص السيرة بالذكاء الاصطناعي' : '⚡ Run AI CV Screening'}
                              </button>
                            ) : !app.shortlistedByRecruiter ? (
                              <button 
                                className="btn btn-sm btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px', backgroundColor: 'var(--color-primary)' }}
                                onClick={() => approveShortlistForInterview(app.id)}
                              >
                                <CheckCircle2 size={12} />
                                {language === 'ar' ? 'اعتماد القائمة وفتح المقابلة' : '✓ Approve & Unlock Interview'}
                              </button>
                            ) : app.interviewScore ? (
                              <button 
                                className="btn btn-sm btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
                                onClick={() => {
                                  setSelectedInterviewAppId(app.id);
                                  setActiveNavTab('virtual_interview');
                                }}
                              >
                                <Video size={12} />
                                {language === 'ar' ? 'مراجعة الصوت والنتيجة' : '🎙 Review Voice & Transcript'}
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                {language === 'ar' ? 'بانتظار إجابة المرشح' : 'Interview active for candidate'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Action Tables & Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  {language === 'ar' ? 'أبرز المرشحين المؤهلين (Pre-synced to Oracle)' : 'Top Shortlisted Candidates (Pre-synced to Oracle)'}
                </h2>
                <button className="btn btn-sm btn-outline" onClick={() => setActiveNavTab('ai_screening')}>
                  {language === 'ar' ? 'عرض جدول الفرز الكامل ←' : 'Open Full Grid →'}
                </button>
              </div>

              <div className="table-responsive">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>{language === 'ar' ? 'المرشح' : 'Candidate'}</th>
                      <th>{language === 'ar' ? 'درجة التطابق' : 'Match Score'}</th>
                      <th>{language === 'ar' ? 'المقابلة الذكية' : 'Interview'}</th>
                      <th>{language === 'ar' ? 'التحقق' : 'Clearance'}</th>
                      <th>{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 3).map(cand => {
                      const score = cand.overrideScore ?? cand.rawMatchScore;
                      return (
                        <tr key={cand.id}>
                          <td>
                            <strong>{language === 'ar' ? cand.nameAr : cand.name}</strong>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              {language === 'ar' ? cand.currentTitleAr : cand.currentTitle}
                            </div>
                          </td>
                          <td>
                            <span className="badge score-high" style={{ fontWeight: 800 }}>
                              {score}%
                            </span>
                          </td>
                          <td><strong>{cand.virtualInterviewScore}/100</strong></td>
                          <td>
                            <span className="badge green-badge">
                              {cand.clearances.nafath.status} &bull; {cand.clearances.amn.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline" onClick={() => setInspectingCandidate(cand)}>
                              {language === 'ar' ? 'تفسير' : 'Explain'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  {language === 'ar' ? 'سجل العمليات والامتثال المباشر' : 'Live Activity & Compliance Feed'}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} style={{ fontSize: 12, borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 600 }}>
                      <span>{language === 'ar' ? log.actorAr : log.actor}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{log.timestamp}</span>
                    </div>
                    <div style={{ color: 'var(--color-text-main)', marginTop: 2 }}>
                      {language === 'ar' ? log.eventAr : log.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CV INGESTION & BILINGUAL PARSING ================= */}
      {activeNavTab === 'cv_ingestion' && (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {language === 'ar' ? 'استيعاب السير الذاتية والمسح الضوئي الثنائي' : 'Batch CV Ingestion & Bilingual Parsing'}
              </h1>
              <p className="page-subtitle">
                {language === 'ar' 
                  ? 'رفع دفعات السير الذاتية، فحص الفيروسات، واستخراج الكيانات باللغتين العربية والإنجليزية' 
                  : 'Multi-CV batch ingestion, anti-malware verification, and Arabic/English structured entity mapping.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <FolderOpen size={14} />
                <span>{language === 'ar' ? 'اختيار ملفات من الجهاز' : 'Select Local Files'}</span>
              </button>
              <button className="btn btn-primary" onClick={() => handleExecuteBulkUpload()} disabled={isUploadingBatch}>
                <Layers size={14} />
                <span>{language === 'ar' ? 'تحميل دفعة الملاحة المعتمدة (5 سير)' : 'Ingest Curated SANS Batch (5 Profiles)'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Ingestion Dropzone */}
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div style={{
              border: '2px dashed var(--color-accent)',
              backgroundColor: isUploadingBatch ? '#ECFDF5' : 'var(--color-soft-green)',
              padding: '30px 20px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} onClick={() => fileInputRef.current?.click()}>
              <FileUp size={42} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'اسحب وأفلت ملفات السير الذاتية هنا (PDF, DOCX)' : 'Drag & Drop Candidate CVs Here (PDF, DOCX)'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                {language === 'ar' ? 'يدعم الرفع الجماعي حتى 50 ملفاً في الدفعة مع الفحص الأمني ومسح الإيكاو' : 'Supports batch ingestion up to 50 files per batch with automated security & ICAO parsing.'}
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {language === 'ar' ? 'اختيار ملفات من الجهاز' : 'Select Local Resumes'}
              </button>
            </div>

            {/* Staged Processing Stepper */}
            {(isUploadingBatch || batchUploadSimulated) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                padding: 14,
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>1. Anti-Malware Clean</span>
                </div>
                <div style={{ width: 24, height: 2, backgroundColor: 'var(--color-border-green)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>2. Deduplication Verified</span>
                </div>
                <div style={{ width: 24, height: 2, backgroundColor: 'var(--color-border-green)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>3. Arabic/English OCR Extracted</span>
                </div>
                <div style={{ width: 24, height: 2, backgroundColor: 'var(--color-border-green)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600, fontSize: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>4. Entities Structured</span>
                </div>
              </div>
            )}
          </div>

          {/* Split Pane Preview & Extracted Entities */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                {language === 'ar' ? 'معاينة الوثيقة واستخراج الكيانات الملاحية' : 'Document Preview & Aviation Entity Extraction'}
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {candidates.map(c => (
                  <button
                    key={c.id}
                    className={`btn btn-sm ${activeCandidateForPreview.id === c.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveCandidateForPreview(c)}
                  >
                    {language === 'ar' ? c.nameAr : c.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Left Column: Raw Source Text */}
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-subtle-green)',
                  borderBottom: '1px solid var(--color-border-green)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Source Text Preview</span>
                  <span className="badge outline-badge">{activeCandidateForPreview.name.replace(' ', '_')}_CV.pdf</span>
                </div>
                <pre style={{
                  padding: 14,
                  fontSize: 12,
                  lineHeight: 1.6,
                  height: 380,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--color-white)'
                }}>
                  {activeCandidateForPreview.cvRawText}
                </pre>
              </div>

              {/* Right Column: Structured Entities */}
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-subtle-green)',
                  borderBottom: '1px solid var(--color-border-green)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Extracted Structured Profile (AI Entities)</span>
                  <span className="badge green-badge">Accuracy: 98.4%</span>
                </div>
                <div style={{
                  padding: 14,
                  height: 380,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  backgroundColor: 'var(--color-white)'
                }}>
                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 4 }}>
                      Identification & Nationality
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge outline-badge">Name: {activeCandidateForPreview.name}</span>
                      <span className="badge outline-badge">National ID: {activeCandidateForPreview.nationalId}</span>
                      <span className="badge green-badge">Saudi National</span>
                    </div>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 4 }}>
                      Formal Degree
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-main)' }}>
                      {language === 'ar' ? activeCandidateForPreview.educationAr : activeCandidateForPreview.education}
                    </p>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 4 }}>
                      Verified Aviation Licenses & Ratings
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {activeCandidateForPreview.certifications.map((crt, i) => (
                        <div key={i} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={13} color="var(--color-primary)" />
                          <span>{crt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 4 }}>
                      En-Route Experience
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>
                      {activeCandidateForPreview.experienceYears} Years Verified Radar Operational Control
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= JOBS & AI CANDIDATE RANKINGS SECTION (Section 4.1.3 & 4.1.4) ================= */}
      {activeNavTab === 'jobs_ai_rankings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div className="page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={22} color="var(--color-primary)" />
                  {language === 'ar' 
                    ? 'دليل الوظائف وترتيب المرشحين بالذكاء الاصطناعي (Jobs & AI Candidate Rankings)' 
                    : 'Job Requisitions & AI Candidate Rankings Matrix'}
                </h1>
                <span className="badge green-badge" style={{ fontSize: 11, fontWeight: 700 }}>
                  {language === 'ar' ? 'تصنيف خوارزمي تنازلي (Section 4.1.3)' : 'Sorted by AI Score Descending (Section 4.1.3)'}
                </span>
              </div>
              <p className="page-subtitle" style={{ marginTop: 4 }}>
                {language === 'ar'
                  ? 'استعراض كافة الوظائف الملاحية الشاغرة، وتصنيف المرشحين لكل وظيفة تنازلياً بحسب درجة التطابق الذكية وأدلة الكفاءة'
                  : 'Browse all active SANS requisitions with relevant candidate cohorts ranked strictly by their multidimensional AI Match Score.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-sm btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                onClick={() => setShowBulkScanModal(true)}
              >
                <Zap size={14} color="#34D399" />
                <span>{language === 'ar' ? '⚡ فحص جماعي لكافة السير' : '⚡ Run Bulk AI Scan'}</span>
              </button>
              <button 
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => setActiveNavTab('recruiter_hub')}
              >
                <span>{language === 'ar' ? 'العودة لمركز التوظيف ←' : 'Return to Hub ←'}</span>
              </button>
            </div>
          </div>

          {/* 1. ALL JOBS DIRECTORY CARDS */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={16} color="var(--color-primary)" />
                  {language === 'ar' ? 'قائمة الوظائف الملاحية الشاغرة (SANS Open Requisitions)' : 'All Active SANS Job Requisitions'}
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'اضغط على أي وظيفة لاستعراض المرشحين المؤهلين مرتبين حسب أعلى الدرجات' : 'Click on any requisition to view matched candidates ranked by AI fit score.'}
                </span>
              </div>

              <div style={{ position: 'relative', width: 260 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث في الوظائف...' : 'Search jobs by title, code...'}
                  className="clean-input"
                  style={{ width: '100%', paddingLeft: 30, fontSize: 12 }}
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14 }}>
                {allRequisitions
                  .filter(job => {
                    const q = jobSearchQuery.toLowerCase();
                    return (
                      job.title.toLowerCase().includes(q) ||
                      job.titleAr.includes(q) ||
                      job.code.toLowerCase().includes(q) ||
                      job.department.toLowerCase().includes(q)
                    );
                  })
                  .map(job => {
                    const isSelected = selectedRankingJobId === job.id || selectedRankingJobId === job.code;
                    const jobCandidates = getCandidatesForJob(job.id);
                    const topScore = jobCandidates[0]?.matchScore || 96;

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedRankingJobId(job.id)}
                        style={{
                          padding: 16,
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-subtle-green)' : '#FFFFFF',
                          boxShadow: isSelected ? '0 4px 12px rgba(15, 81, 50, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span className="badge outline-badge" style={{ fontWeight: 800, fontSize: 10, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                              {job.code}
                            </span>
                            <span className="badge green-badge" style={{ fontSize: 10 }}>
                              {job.status}
                            </span>
                          </div>

                          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0 2px' }}>
                            {language === 'ar' ? job.titleAr : job.title}
                          </h4>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {language === 'ar' ? job.departmentAr : job.department} &bull; {job.location}
                          </div>
                        </div>

                        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                            <div>
                              <span style={{ color: 'var(--color-text-muted)' }}>Relevant Cohort: </span>
                              <strong>{jobCandidates.length} Candidates</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--color-text-muted)' }}>Top AI Match:</span>
                              <span className="badge score-high" style={{ fontWeight: 800, fontSize: 11 }}>
                                {topScore}%
                              </span>
                            </div>
                          </div>

                          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                              Deadline: {job.deadline}
                            </span>
                            <button
                              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: 11, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRankingJobId(job.id);
                              }}
                            >
                              <span>{isSelected ? (language === 'ar' ? 'معروض الآن ✓' : 'Selected ✓') : (language === 'ar' ? 'عرض المرشحين' : 'View Ranked')}</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 2. CANDIDATES RANKED BY AI SCORE FOR SELECTED JOB */}
          {(() => {
            const currentJob = allRequisitions.find(r => r.id === selectedRankingJobId || r.code === selectedRankingJobId) || allRequisitions[0];
            const rawCandidates = getCandidatesForJob(currentJob.id);

            const rankedCandidates = rawCandidates.filter(item => {
              const q = jobCandidateSearchQuery.toLowerCase();
              const matchesSearch = (
                item.candidate.name.toLowerCase().includes(q) ||
                item.candidate.nameAr.includes(q) ||
                item.candidate.currentTitle.toLowerCase().includes(q) ||
                item.candidate.keyStrengths.toLowerCase().includes(q)
              );

              if (!matchesSearch) return false;

              if (candidateScoreTierFilter === 'top') return item.matchScore >= 90;
              if (candidateScoreTierFilter === 'qualified') return item.matchScore >= 80 && item.matchScore < 90;
              if (candidateScoreTierFilter === 'shortlisted') return item.candidate.shortlistedByRecruiter || item.application?.shortlistedByRecruiter;
              return true;
            });

            return (
              <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={18} color="var(--color-primary)" />
                        {language === 'ar' 
                          ? `تصنيف المرشحين لوظيفة: ${currentJob.titleAr}` 
                          : `Candidate AI Rankings for: ${currentJob.title}`}
                      </h3>
                      <span className="badge outline-badge" style={{ fontWeight: 800, fontSize: 11, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                        {currentJob.code}
                      </span>
                      <span className="badge green-badge" style={{ fontSize: 11 }}>
                        {rankedCandidates.length} {language === 'ar' ? 'مرشحين مصنفين تنازلياً' : 'Candidates Ranked (Descending)'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                      {language === 'ar'
                        ? 'المرشحون مرتبون تنازلياً حسب درجة المطابقة الآلية (من الأعلى إلى الأقل) مع التدقيق في رخص الطيران المدني وساعات الرادار'
                        : 'Candidates strictly sorted by composite AI match score (highest to lowest), factoring GACA licensing, radar hours, and ICAO Level.'}
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['all', 'top', 'qualified', 'shortlisted'] as const).map(tier => (
                        <button
                          key={tier}
                          className={`btn btn-sm ${candidateScoreTierFilter === tier ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => setCandidateScoreTierFilter(tier)}
                        >
                          {tier === 'all' && (language === 'ar' ? 'الكل' : 'All Scores')}
                          {tier === 'top' && (language === 'ar' ? 'المطابقة العليا (≥90%)' : 'Top Tier (≥90%)')}
                          {tier === 'qualified' && (language === 'ar' ? 'مؤهل (80-89%)' : 'Qualified (80-89%)')}
                          {tier === 'shortlisted' && (language === 'ar' ? 'المعتمدون بالقائمة' : 'Shortlisted Only')}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative', width: 220 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'بحث في المرشحين...' : 'Search candidate name...'}
                        className="clean-input"
                        style={{ width: '100%', paddingLeft: 30, fontSize: 11 }}
                        value={jobCandidateSearchQuery}
                        onChange={(e) => setJobCandidateSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Candidate Ranked List */}
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {rankedCandidates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)' }}>
                      <ClockAlert size={32} style={{ margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
                      <h4>{language === 'ar' ? 'لا يوجد مرشحون يطابقون هذا الفلتر' : 'No candidates match the selected filter criteria.'}</h4>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setCandidateScoreTierFilter('all'); setJobCandidateSearchQuery(''); }}>
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    rankedCandidates.map((item, rankIdx) => {
                      const { candidate: cand, application: app, matchScore } = item;
                      const isShortlisted = cand.shortlistedByRecruiter || app?.shortlistedByRecruiter;
                      const hasInterview = (cand.virtualInterviewScore && cand.virtualInterviewScore > 0) || (app?.interviewScore && app.interviewScore > 0);
                      const interviewScore = cand.virtualInterviewScore || app?.interviewScore || 0;

                      return (
                        <div
                          key={cand.id}
                          className="card"
                          style={{
                            padding: 16,
                            borderLeft: rankIdx === 0 ? '5px solid #059669' : rankIdx <= 2 ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                            backgroundColor: rankIdx === 0 ? '#F0FDF4' : '#FFFFFF',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                            {/* Left: Identity and Rank */}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              {/* Rank Medal */}
                              <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                backgroundColor: rankIdx === 0 ? '#059669' : rankIdx === 1 ? '#0F5132' : rankIdx === 2 ? '#1E3A8A' : '#F1F5F9',
                                color: rankIdx <= 2 ? '#FFFFFF' : '#475569',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: 13,
                                boxShadow: rankIdx <= 2 ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                              }}>
                                <span style={{ fontSize: 10 }}>#{rankIdx + 1}</span>
                                <span style={{ fontSize: 9 }}>RANK</span>
                              </div>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                                    {language === 'ar' ? cand.nameAr : cand.name}
                                  </h4>
                                  <span className="badge outline-badge" style={{ fontSize: 10 }}>
                                    {cand.id} &bull; {cand.nationalId}
                                  </span>
                                  {isShortlisted && (
                                    <span className="badge green-badge" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                      <UserCheck size={11} />
                                      Shortlisted ✓
                                    </span>
                                  )}
                                  {item.isDirectApplicant && (
                                    <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', fontSize: 10 }}>
                                      Direct Requisition Applicant
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: 12, color: 'var(--color-text-main)', marginTop: 3 }}>
                                  <strong>{language === 'ar' ? cand.currentTitleAr : cand.currentTitle}</strong> &bull; {cand.experienceYears} Years Operational Experience
                                </div>

                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                  {language === 'ar' ? cand.educationAr : cand.education}
                                </div>
                              </div>
                            </div>

                            {/* Right: AI Score Gauge & Breakdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                  AI Compatibility Score
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 }}>
                                  <span style={{ fontSize: 26, fontWeight: 900, color: matchScore >= 90 ? '#059669' : '#0F5132' }}>
                                    {matchScore}%
                                  </span>
                                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/ 100</span>
                                </div>
                                <span className={`badge ${matchScore >= 90 ? 'score-high' : 'green-badge'}`} style={{ fontSize: 10 }}>
                                  {matchScore >= 94 ? 'Superior Fit (Top Tier)' : matchScore >= 88 ? 'Strong Compatibility' : 'Acceptable Baseline'}
                                </span>
                              </div>

                              <div style={{ width: 130, borderLeft: '1px solid var(--color-border)', paddingLeft: 12 }}>
                                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Radar Exp (40%): <strong>{cand.experienceYears >= 5 ? '100%' : '80%'}</strong></div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>GACA Rating (30%): <strong>Valid</strong></div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Degree (20%): <strong>Accredited</strong></div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ICAO English (10%): <strong>Level 5+</strong></div>
                              </div>
                            </div>
                          </div>

                          {/* Aviation Credentials & Sovereign Clearances Strip */}
                          <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)' }}>Credentials:</span>
                              {cand.certifications.slice(0, 3).map((cert, cIdx) => (
                                <span key={cIdx} className="badge outline-badge" style={{ fontSize: 10 }}>
                                  {cert}
                                </span>
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 10 }}>
                              <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <ShieldCheck size={10} />
                                Nafath: {cand.clearances.nafath.status}
                              </span>
                              <span className="badge green-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <CheckCircle2 size={10} />
                                AMN: {cand.clearances.amn.status}
                              </span>
                              <span className="badge green-badge">
                                Medical: {cand.clearances.medical.status}
                              </span>
                            </div>
                          </div>

                          {/* Explainable AI Citations Snippet */}
                          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <strong>Key Strength:</strong> {language === 'ar' ? cand.keyStrengthsAr : cand.keyStrengths}
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => setInspectingCandidate(cand)}
                                title="Inspect explainable XAI evidence and CV text quotes"
                              >
                                <Eye size={12} />
                                <span>{language === 'ar' ? 'فحص أدلة الذكاء الاصطناعي (XAI)' : 'View XAI Citations'}</span>
                              </button>

                              {!isShortlisted ? (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: 11, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => {
                                    if (app) {
                                      approveShortlistForInterview(app.id);
                                    } else {
                                      bulkApproveShortlists([cand.id]);
                                    }
                                  }}
                                >
                                  <UserCheck size={12} />
                                  <span>{language === 'ar' ? 'اعتماد في القائمة وفتح المقابلة' : 'Approve Shortlist'}</span>
                                </button>
                              ) : hasInterview ? (
                                <button
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: 11, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => {
                                    if (app) setSelectedInterviewAppId(app.id);
                                    setActiveNavTab('virtual_interview');
                                  }}
                                >
                                  <Video size={12} />
                                  <span>{language === 'ar' ? `المقابلة منجزة (${interviewScore}/100)` : `Interview (${interviewScore}/100)`}</span>
                                </button>
                              ) : (
                                <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', fontSize: 11 }}>
                                  Interview Unlocked for Candidate
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= AI MATCHING & RANKING GRID ================= */}
      {activeNavTab === 'ai_screening' && (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {language === 'ar' ? 'المطابقة الخوارزمية وتصنيف الكفاءات الملاحية' : 'Candidate-to-Job Matching & Explainable Ranking'}
              </h1>
              <p className="page-subtitle">
                {language === 'ar'
                  ? 'فرز المتقدمين بناءً على متطلبات الوظيفة مع إمكانية تعديل الأوزان والاطلاع على الأدلة الشفافة'
                  : 'Automated evaluation against job requirements with dynamic weighting sliders and XAI evidence.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setWeightsPanelOpen(!weightsPanelOpen)}>
                <Sliders size={14} />
                <span>{language === 'ar' ? 'تعديل أوزان المعايير' : 'Adjust Scoring Weights'}</span>
              </button>
              <button className="btn btn-primary" onClick={executeOracleSync}>
                <span>{language === 'ar' ? 'مزامنة القائمة مع أوراكل ←' : 'Sync to Oracle HCM →'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Weighting Sliders Panel */}
          {weightsPanelOpen && (
            <div className="card" style={{ backgroundColor: 'var(--color-subtle-green)', borderColor: 'var(--color-border-green)' }}>
              <div className="card-header">
                <h3 className="card-title">
                  {language === 'ar' ? 'أوزان معايير التقييم الديناميكية' : 'Configurable Evaluation Weights (Dynamic Re-ranking)'}
                </h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                  Total: {weights.experience + weights.certifications + weights.education + weights.language}%
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Technical Radar Experience:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{weights.experience}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={60} 
                    value={weights.experience}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    onChange={(e) => updateWeight('experience', parseInt(e.target.value, 10))}
                  />
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Certifications &amp; Licenses:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{weights.certifications}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={50} 
                    value={weights.certifications}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    onChange={(e) => updateWeight('certifications', parseInt(e.target.value, 10))}
                  />
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Aviation Degree:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{weights.education}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={5} 
                    max={40} 
                    value={weights.education}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    onChange={(e) => updateWeight('education', parseInt(e.target.value, 10))}
                  />
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>ICAO English Level:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{weights.language}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={5} 
                    max={30} 
                    value={weights.language}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    onChange={(e) => updateWeight('language', parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ranking Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                {language === 'ar' ? 'قائمة تصنيف المتقدمين المعتمدة' : 'Ranked Candidate Evaluation Cohort'}
              </h2>
              <div style={{ position: 'relative', width: 280 }}>
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'بحث عن مرشح أو رخصة...' : 'Search candidate, license...'} 
                  className="clean-input"
                  style={{ width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{language === 'ar' ? 'اسم المرشح' : 'Candidate Name'}</th>
                    <th>{language === 'ar' ? 'درجة التطابق' : 'Match Score'}</th>
                    <th>{language === 'ar' ? 'أبرز نقاط القوة' : 'Key Strengths'}</th>
                    <th>{language === 'ar' ? 'فجوات التأهيل' : 'Identified Gaps'}</th>
                    <th>{language === 'ar' ? 'الرقابة البشرية' : 'Oversight'}</th>
                    <th>{language === 'ar' ? 'الإجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((cand, idx) => {
                    const score = cand.overrideScore ?? cand.computedScore ?? cand.rawMatchScore;
                    const scoreClass = score >= 85 ? 'score-high' : (score >= 65 ? 'score-mid' : 'score-low');

                    return (
                      <tr key={cand.id}>
                        <td><strong>#{idx + 1}</strong></td>
                        <td>
                          <strong>{language === 'ar' ? cand.nameAr : cand.name}</strong>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {language === 'ar' ? cand.currentTitleAr : cand.currentTitle}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${scoreClass}`} style={{ fontWeight: 800 }}>
                            {score}%
                          </span>
                          {cand.overrideScore !== null && (
                            <span className="badge outline-badge" style={{ fontSize: 9, marginLeft: 4 }}>
                              Overridden
                            </span>
                          )}
                        </td>
                        <td style={{ maxWidth: 220, fontSize: 12 }}>
                          {language === 'ar' ? cand.keyStrengthsAr : cand.keyStrengths}
                        </td>
                        <td style={{ maxWidth: 180, fontSize: 12, color: cand.identifiedGaps === 'None' ? 'var(--color-primary)' : '#B91C1C' }}>
                          {language === 'ar' ? cand.identifiedGapsAr : cand.identifiedGaps}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => setInspectingCandidate(cand)}>
                            &#9998; Override
                          </button>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => setInspectingCandidate(cand)}>
                            {language === 'ar' ? 'تفسير XAI' : 'Explain XAI'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIRTUAL INTERVIEW REVIEW & FINAL SELECTION ================= */}
      {activeNavTab === 'virtual_interview' && (() => {
        const filteredInterviewApps = applications.filter(app => {
          if (interviewJobFilter === 'ALL') return true;
          return app.requisitionCode === interviewJobFilter || app.requisitionId === interviewJobFilter;
        });

        const currentApp = filteredInterviewApps.find(a => a.id === selectedInterviewAppId) 
          || filteredInterviewApps[0] 
          || applications.find(a => a.id === selectedInterviewAppId) 
          || applications[0];

        const candidateProfile = candidates.find(c => 
          c.id === currentApp?.candidateId || 
          c.name?.toLowerCase() === currentApp?.candidateName?.toLowerCase() ||
          c.nameAr === currentApp?.candidateNameAr
        ) || candidates[0];

        const candidateName = currentApp?.candidateName 
          ? (language === 'ar' ? (currentApp.candidateNameAr || candidateProfile.nameAr) : currentApp.candidateName)
          : (language === 'ar' ? candidateProfile.nameAr : candidateProfile.name);

        const questionText = currentApp?.interviewTranscript?.question 
          || (language === 'ar' ? (currentApp?.interviewTranscript?.questionAr || candidateProfile.interviewTranscript.questionAr) : (currentApp?.interviewTranscript?.question || candidateProfile.interviewTranscript.question));

        const responseText = currentApp?.interviewTranscript?.answer 
          || (language === 'ar' ? (currentApp?.interviewTranscript?.answerAr || candidateProfile.interviewTranscript.answerAr) : (currentApp?.interviewTranscript?.answer || candidateProfile.interviewTranscript.answer));

        const interviewScore = currentApp?.interviewScore || candidateProfile.virtualInterviewScore || 94;
        const isInterviewDone = !!(currentApp?.interviewScore || candidateProfile.interviewCompleted);

        const allCandidateAnswers = getCandidateAllInterviewAnswers(currentApp, candidateProfile);
        const displayedAnswers = selectedQuestionTab === 'ALL'
          ? allCandidateAnswers
          : allCandidateAnswers.filter(a => a.questionNumber === selectedQuestionTab);

        const handleJobFilterChange = (newJobCode: string) => {
          setInterviewJobFilter(newJobCode);
          const matchingApps = applications.filter(app => 
            newJobCode === 'ALL' || app.requisitionCode === newJobCode || app.requisitionId === newJobCode
          );
          if (matchingApps.length > 0) {
            setSelectedInterviewAppId(matchingApps[0].id);
          }
        };

        return (
          <div>
            <div className="page-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveNavTab('recruiter_hub')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                  >
                    <span>{language === 'ar' ? '← العودة لمركز التوظيف' : '← Back to Recruitment Hub'}</span>
                  </button>
                  <span className="badge green-badge" style={{ padding: '4px 8px', fontSize: 11 }}>
                    {language === 'ar' ? '5 من 5 أسئلة مكتملة' : '5 of 5 Interview Questions Completed'}
                  </span>
                </div>
                <h1 className="page-title">
                  {language === 'ar' ? 'تقييم المقابلات الذكية وتفريغ جميع إجابات المرشح' : 'AI Virtual Interview Review — All Candidate Answers & Voice Recordings'}
                </h1>
                <p className="page-subtitle">
                  {language === 'ar' 
                    ? 'الاستماع لصوت جميع الأسئلة وإجابات المرشح الصوتية والنصية، ومراجعة مصفوفة الكفاءات، واعتماد الاختيار النهائي' 
                    : 'Comprehensive candidate interview evaluation with natural voice synthesis, all 5 verbatim answers, and final committee selection.'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div className="badge green-badge" style={{ padding: '6px 12px', fontSize: 12 }}>
                  NCA &bull; PDPL Ethical Compliance: Zero facial or emotion bias
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Total Words Spoken: <strong>342 words</strong> &bull; Avg Pace: <strong>127 wpm</strong>
                </span>
              </div>
            </div>

            {/* JOB & CANDIDATE DROPDOWN SELECTOR TOOLBAR */}
            <div className="card" style={{
              padding: '16px 20px',
              marginBottom: 18,
              backgroundColor: 'var(--color-white)',
              border: '1.5px solid var(--color-border-green)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    {language === 'ar' ? 'تحديد الوظيفة والمرشح لمراجعة تفاصيل المقابلة:' : 'Filter Interview Review by Job & Candidate:'}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowInterviewDetailsModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  title="Open full detailed modal dossier for the selected candidate and job"
                >
                  <Eye size={14} />
                  <span>{language === 'ar' ? 'فتح ملف تفاصيل المقابلة الكاملة (Dossier) ↗' : 'Open Interview Details Dossier ↗'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'flex-end' }}>
                {/* 1. Job Requisition Dropdown */}
                <div>
                  <label htmlFor="interview-job-select" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    <Briefcase size={12} />
                    <span>{language === 'ar' ? 'الوظيفة الشاغرة (Job Requisition):' : 'Job Requisition:'}</span>
                  </label>
                  <select
                    id="interview-job-select"
                    className="clean-select"
                    style={{ width: '100%', fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 13 }}
                    value={interviewJobFilter}
                    onChange={(e) => handleJobFilterChange(e.target.value)}
                  >
                    <option value="ALL">
                      {language === 'ar' ? '✦ كافة الوظائف الشاغرة (عرض شامل)' : '✦ All Job Requisitions (Combined Pool)'}
                    </option>
                    {allRequisitions.map(req => (
                      <option key={req.code} value={req.code}>
                        {req.code} — {language === 'ar' ? req.titleAr : req.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Candidate Dropdown */}
                <div>
                  <label htmlFor="interview-candidate-select" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    <Users size={12} />
                    <span>{language === 'ar' ? 'المرشح وطلب التقديم (Candidate Application):' : 'Candidate Application:'}</span>
                  </label>
                  <select
                    id="interview-candidate-select"
                    className="clean-select"
                    style={{ width: '100%', fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 13 }}
                    value={currentApp?.id || ''}
                    onChange={(e) => {
                      setSelectedInterviewAppId(e.target.value);
                      setFinalOfferSuccess(null);
                    }}
                  >
                    {filteredInterviewApps.map(app => {
                      const cand = candidates.find(c => c.id === app.candidateId || c.name === app.candidateName);
                      const name = language === 'ar' ? (app.candidateNameAr || cand?.nameAr || app.candidateName) : (app.candidateName || cand?.name);
                      const scoreStr = app.interviewScore ? `${app.interviewScore}/100` : (app.shortlistedByRecruiter ? 'Ready for Interview' : 'Pending Shortlist');
                      return (
                        <option key={app.id} value={app.id}>
                          {name} ({scoreStr}) — {app.id} &bull; {app.requisitionCode}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 3. Open Details Action Button */}
                <div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
                    onClick={() => setShowInterviewDetailsModal(true)}
                  >
                    <FileText size={14} color="var(--color-primary)" />
                    <span>{language === 'ar' ? 'عرض تفاصيل المقابلة والتقييم' : 'View Full Interview Details'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate Quick Switcher Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'الطلبات المطابقة:' : 'Matching Candidate Submissions:'}
              </span>
              {filteredInterviewApps.map(app => {
                const isSelected = (currentApp?.id === app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedInterviewAppId(app.id);
                      setFinalOfferSuccess(null);
                    }}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  >
                    <Video size={13} />
                    <span>{app.id} &bull; {app.jobTitle.split(' ')[0]}</span>
                    {app.finalSelected ? (
                      <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 10, padding: '1px 5px' }}>
                        ★ Offer Stage
                      </span>
                    ) : app.interviewScore ? (
                      <span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#DCFCE7', color: isSelected ? '#FFFFFF' : '#15803D', fontSize: 10, padding: '1px 5px' }}>
                        {app.interviewScore}/100
                      </span>
                    ) : app.shortlistedByRecruiter ? (
                      <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>
                        Interview Unlocked
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, opacity: 0.7 }}>
                        Awaiting Shortlist
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {finalOfferSuccess === currentApp?.id && (
              <div style={{
                backgroundColor: 'var(--color-soft-green)',
                border: '1px solid var(--color-border-green)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <CheckCircle2 size={22} color="var(--color-primary)" />
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>
                    {language === 'ar' ? 'تم اعتماد الاختيار النهائي بنجاح وإرسال العرض الوظيفي!' : 'Final Selection Approved & Job Offer Issued!'}
                  </strong>
                  <p style={{ fontSize: 12, color: 'var(--color-primary-dark)', margin: 0 }}>
                    {language === 'ar'
                      ? `تم تحديث ملف ${candidateName} إلى مرحلة العرض ومزامنته فورياً مع نظام أوراكل للموارد البشرية (Oracle Fusion HCM).`
                      : `Candidate ${candidateName} has been moved to Offer Stage. Record synchronized with Oracle Fusion HCM Gateway.`}
                  </p>
                </div>
              </div>
            )}

            {/* MAIN TWO-COLUMN CONTENT: LEFT (ALL ANSWERS) & RIGHT (RUBRICS & DECISION) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 20 }}>
              {/* Left Column: All Candidate Answers & Voice Player */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* QUESTION SELECTOR TABS BAR */}
                <div className="card" style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mic size={15} color="var(--color-primary)" />
                      <strong style={{ fontSize: 12, color: 'var(--color-primary-dark)' }}>
                        {language === 'ar' ? 'تصفح جميع أسئلة وإجابات المقابلة:' : 'Browse All Candidate Answers:'}
                      </strong>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {candidateName} &bull; {currentApp?.jobTitle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      className={`btn btn-sm ${selectedQuestionTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedQuestionTab('ALL')}
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <Layers size={12} />
                      <span>{language === 'ar' ? '✦ عرض كافة الإجابات (5)' : '✦ View All 5 Answers'}</span>
                    </button>
                    {allCandidateAnswers.map(ans => (
                      <button
                        key={`recruiter-q-tab-${ans.questionNumber}`}
                        className={`btn btn-sm ${selectedQuestionTab === ans.questionNumber ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedQuestionTab(ans.questionNumber)}
                        style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>Q{ans.questionNumber}</span>
                        <span className="badge" style={{ 
                          backgroundColor: selectedQuestionTab === ans.questionNumber ? 'rgba(255,255,255,0.25)' : '#DCFCE7',
                          color: selectedQuestionTab === ans.questionNumber ? '#FFFFFF' : '#15803D',
                          fontSize: 10,
                          padding: '1px 5px'
                        }}>
                          {ans.score}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ANSWERS LIST / CARDS */}
                {isInterviewDone ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {displayedAnswers.map((item) => {
                      const qText = language === 'ar' ? item.questionAr : item.questionEn;
                      const aText = language === 'ar' ? item.candidateAnswerAr : item.candidateAnswerEn;

                      return (
                        <div 
                          key={`displayed-ans-${item.id}`}
                          className="card" 
                          style={{ 
                            padding: 0, 
                            overflow: 'hidden', 
                            border: '1px solid var(--color-border)',
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          {/* Item Header */}
                          <div style={{
                            padding: '12px 18px',
                            backgroundColor: 'var(--color-subtle-green)',
                            borderBottom: '1px solid var(--color-border-green)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 800, fontSize: 11 }}>
                                Question {item.questionNumber} of 5
                              </span>
                              <span className="badge outline-badge" style={{ fontSize: 11 }}>
                                {language === 'ar' ? item.categoryAr : item.category}
                              </span>
                              <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: 10 }}>
                                {item.questionType} &bull; {item.difficulty}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                {item.duration} &bull; {item.wordCount} words
                              </span>
                              <span className="badge score-high" style={{ fontWeight: 800 }}>
                                {item.score} / 100
                              </span>
                            </div>
                          </div>

                          {/* Question Text */}
                          <div style={{ padding: '14px 18px', backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                              {language === 'ar' ? 'نص السؤال:' : 'Question Prompt:'}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', lineHeight: 1.5 }}>
                              {qText}
                            </div>
                          </div>

                          {/* Candidate Answer Content & Audio */}
                          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Voice Player */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Mic size={14} color="var(--color-primary)" />
                                <span>{language === 'ar' ? `تشغيل التسجيل الصوتي لإجابة المرشح (السؤال ${item.questionNumber}):` : `Candidate Audio Voice Playback (Question ${item.questionNumber}):`}</span>
                              </div>
                              <VoicePlayer
                                speakerName={candidateName}
                                questionText={qText}
                                responseText={aText}
                              />
                            </div>

                            {/* Verbatim Transcript */}
                            <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                                  {language === 'ar' ? 'التفريغ الحرفي لإجابة المرشح (Verbatim Transcript):' : 'Candidate Verbatim Response Transcript:'}
                                </span>
                                <span className="badge green-badge" style={{ fontSize: 10 }}>
                                  {item.icaoCompliance}
                                </span>
                              </div>
                              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-main)', margin: 0, fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 4, border: '1px solid var(--color-border-subtle)' }}>
                                &ldquo;{aText}&rdquo;
                              </p>
                            </div>

                            {/* Rubrics & AI Feedback */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, fontSize: 11 }}>
                              <div style={{ padding: 10, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                                <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: 3 }}>
                                  {language === 'ar' ? 'تقييم الذكاء الاصطناعي:' : 'AI Evaluation Feedback:'}
                                </strong>
                                <span style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                                  {language === 'ar' ? item.aiFeedbackAr : item.aiFeedbackEn}
                                </span>
                              </div>

                              <div style={{ padding: 10, backgroundColor: '#F1F5F9', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                <strong style={{ color: '#334155', display: 'block', marginBottom: 3 }}>
                                  {language === 'ar' ? 'معايير الإيكاو والملاحة المستوفاة:' : 'Evaluated SANS/ICAO Rubrics:'}
                                </strong>
                                <ul style={{ margin: 0, paddingLeft: language === 'ar' ? 0 : 16, paddingRight: language === 'ar' ? 16 : 0, color: 'var(--color-text-muted)' }}>
                                  {(language === 'ar' ? item.rubricsAr : item.rubricsEn).map((r, rIdx) => (
                                    <li key={rIdx}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Video size={36} color="var(--color-primary)" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
                    <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                      {language === 'ar' ? 'المقابلة لم تُنجز بعد من قبل المرشح' : 'Interview Pending Candidate Submission'}
                    </h4>
                    <p style={{ fontSize: 12, maxWidth: 360, margin: '0 auto 14px' }}>
                      {!currentApp?.shortlistedByRecruiter 
                        ? (language === 'ar' ? 'يتطلب أولاً فحص السيرة الذاتية واعتماد القائمة القصيرة في مركز التوظيف.' : 'Please scan candidate CV and approve the shortlist from Recruiter Hub first.')
                        : (language === 'ar' ? 'تم فتح المقابلة للمرشح بنجاح. يمكن للمرشح الآن تسجيل الإجابات عبر بوابة المرشح.' : 'Interview is currently unlocked. Candidate can submit oral or text responses in Candidate Portal.')}
                    </p>
                    {!currentApp?.shortlistedByRecruiter && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          if (!currentApp?.cvScannedByRecruiter) {
                            setScanningApp(currentApp);
                          } else {
                            approveShortlistForInterview(currentApp.id);
                          }
                        }}
                      >
                        {!currentApp?.cvScannedByRecruiter 
                          ? (language === 'ar' ? '⚡ فحص السيرة بالذكاء الاصطناعي' : '⚡ Run AI CV Screening')
                          : (language === 'ar' ? '✓ اعتماد القائمة وفتح المقابلة' : '✓ Approve Shortlist & Unlock Interview')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Competency Rubrics & Final Selection */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    {language === 'ar' ? 'تقييم مصفوفة الكفاءات الملاحية' : 'Aviation Competency Rubric Scoring'}
                  </h3>
                  <div style={{
                    backgroundColor: 'var(--color-soft-green)',
                    border: '1px solid var(--color-border-green)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 800,
                    color: 'var(--color-primary-dark)'
                  }}>
                    Overall: {interviewScore} / 100
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      <span>1. Situational Airspace Emergency Handling</span>
                      <strong style={{ color: 'var(--color-primary)' }}>96 / 100</strong>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '96%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Demonstrated immediate adherence to rapid altitude depressurization directives under SANS SOP 4.2.
                    </p>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      <span>2. Inter-Sector Coordination & Communications</span>
                      <strong style={{ color: 'var(--color-primary)' }}>92 / 100</strong>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Employed exact ICAO phraseology for 20NM radius traffic alert broadcasts.
                    </p>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      <span>3. Regulatory GACA/ICAO Compliance</span>
                      <strong style={{ color: 'var(--color-primary)' }}>95 / 100</strong>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '95%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Flawless compliance with Annex 11 air traffic separation standards.
                    </p>
                  </div>
                </div>

                {/* Final Selection & Job Offer Block */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px dashed var(--color-border-green)' }}>
                  {currentApp?.finalSelected ? (
                    <div style={{
                      backgroundColor: 'var(--color-soft-green)',
                      border: '1px solid var(--color-border-green)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 14,
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                        <Award size={18} />
                        <span>{language === 'ar' ? 'تم اعتماد الاختيار النهائي للمرشح' : 'Final Selection Approved & Offer Issued'}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--color-primary-dark)', margin: 0 }}>
                        {language === 'ar'
                          ? `المرشح في مرحلة العرض (Grade L7). السجل معتمد لدى شركة الملاحة ونظام أوراكل فيوجن.`
                          : `Candidate moved to Offer Stage (Grade L7 Specialist). Record verified with SANS clearings and Oracle HCM.`}
                      </p>
                    </div>
                  ) : isInterviewDone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                        {language === 'ar' ? 'القرار النهائي لمسؤول التوظيف:' : 'Recruiter Final Hiring Decision:'}
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', fontSize: 13 }}
                        onClick={() => {
                          approveFinalSelection(currentApp.id);
                          setFinalOfferSuccess(currentApp.id);
                        }}
                      >
                        <Award size={16} />
                        {language === 'ar' ? 'اعتماد الاختيار النهائي وإصدار عرض العمل (أوراكل) ★' : 'Approve Final Selection & Issue Job Offer (Oracle HCM) ★'}
                      </button>
                      <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveNavTab('clearances')}>
                        {language === 'ar' ? 'الانتقال إلى التحقق الأمني ومزامنة أوراكل ←' : 'View Clearances & Oracle Gateway →'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: 8 }}>
                      {language === 'ar' ? 'يكون الاختيار النهائي متاحاً بعد استكمال المرشح للمقابلة الافتراضية.' : 'Final selection is enabled once candidate completes the interview.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= CLEARANCES & ORACLE SYNC ================= */}
      {activeNavTab === 'clearances' && (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {language === 'ar' ? 'التحقق الأمني المعتمد ومزامنة أوراكل' : 'National Clearances & Oracle Fusion HCM Sync'}
              </h1>
              <p className="page-subtitle">
                {language === 'ar'
                  ? 'متابعة نفاذ، أمن الملاحة، والفحص الطبي مع تنفيذ الإرسال النهائي إلى أوراكل'
                  : 'Track Nafath digital ID, AMN clearance, GACA medical, and push the final candidate shortlist to Oracle.'}
              </p>
            </div>
            <button className="btn btn-primary" onClick={executeOracleSync}>
              <CheckCircle2 size={16} />
              <span>{language === 'ar' ? 'مزامنة القائمة النهائية مع أوراكل فيوجن' : 'Push Final Shortlist to Oracle Fusion HCM'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {candidates.map(cand => {
              const score = cand.overrideScore ?? cand.rawMatchScore;
              return (
                <div key={cand.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--color-primary-dark)' }}>
                        {language === 'ar' ? cand.nameAr : cand.name}
                      </strong>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        National ID: {cand.nationalId}
                      </div>
                    </div>
                    <span className="badge score-high" style={{ fontWeight: 800 }}>
                      Match: {score}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                      <span><strong>Nafath Digital ID:</strong></span>
                      <span className="badge green-badge">&#10003; {cand.clearances.nafath.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                      <span><strong>AMN Security Clearance:</strong></span>
                      <span className="badge green-badge">{cand.clearances.amn.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                      <span><strong>GACA Medical Class 1:</strong></span>
                      <span className="badge green-badge">{cand.clearances.medical.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                      <span><strong>National Address:</strong></span>
                      <span className="badge green-badge">{cand.clearances.address.status}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 6, justifyContent: 'flex-end', paddingTop: 6 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setInspectingCandidate(cand)}>
                      {language === 'ar' ? 'الملف التقييمي' : 'Dossier'}
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={executeOracleSync}>
                      {language === 'ar' ? 'مزامنة أوراكل' : 'Sync to Oracle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SLA WATCHDOG ================= */}
      {activeNavTab === 'sla_alerts' && (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {language === 'ar' ? 'مراقبة الالتزام بمستوى الخدمة (SLA Watchdog)' : 'SLA Compliance & Candidate Communication Reminders'}
              </h1>
              <p className="page-subtitle">
                {language === 'ar' 
                  ? 'رصد مواعيد التواصل والاستجابة، وتنبيهات الحالات الحرجة وفق كراسة الشروط' 
                  : 'Automated monitoring of candidate communication targets (4-hour major / 1-day regular).'}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active SLA Reminders & Escalations</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: 12, border: '1px solid #FCD34D', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#92400E' }}>Candidate Invite Pending &gt; 24h</strong>
                  <p style={{ fontSize: 12, color: '#78350F' }}>Candidate Noura Al-Shehri completed screening; virtual interview link pending dispatch.</p>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => alert('Automated interview invite dispatched to Noura Al-Shehri!')}>
                  Dispatch Now
                </button>
              </div>

              <div style={{ padding: 12, border: '1px solid var(--color-border-green)', backgroundColor: 'var(--color-subtle-green)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>SLA Target: 4-Hour Resolution for Major Candidate Cohort</strong>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Status: 100% compliant across last 30 operational days.</p>
                </div>
                <span className="badge green-badge">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XAI Modal */}
      {inspectingCandidate && (
        <XaiModal candidate={inspectingCandidate} onClose={() => setInspectingCandidate(null)} />
      )}

      {/* Recruiter-Side AI CV Screening Simulation Modal */}
      {scanningApp && (
        <AiScreeningSimulationModal
          application={scanningApp}
          isRecruiterMode={true}
          onClose={() => setScanningApp(null)}
          onApproveShortlist={(app) => {
            scanCandidateCvByRecruiter(app.id);
            approveShortlistForInterview(app.id);
            setScanningApp(null);
          }}
        />
      )}

      {/* Bulk AI CV Screening Modal (Section 4.1.3 Parallel Engine) */}
      {showBulkScanModal && (
        <BulkAiScreeningModal
          applications={
            selectedAppIds.length > 0
              ? applications.filter(a => selectedAppIds.includes(a.id))
              : unscannedApps.length > 0
                ? unscannedApps
                : applications
          }
          onClose={() => {
            setShowBulkScanModal(false);
            setSelectedAppIds([]);
          }}
          onCompleteScan={(ids) => {
            const res = bulkScanCandidateCvs(ids);
            setBulkScanSuccessMessage(
              language === 'ar'
                ? `تم إجراء الفرز الآلي بنجاح لـ ${res.scannedCount} مرشحين بمعدل مطابقة ${res.averageScore}%!`
                : `Successfully completed bulk AI CV screening for ${res.scannedCount} candidates with ${res.averageScore}% average fit!`
            );
            setTimeout(() => setBulkScanSuccessMessage(null), 6000);
          }}
          onAutoApproveShortlists={(ids) => {
            bulkScanCandidateCvs(ids);
            const res = bulkApproveShortlists(ids);
            setSelectedAppIds([]);
            setBulkScanSuccessMessage(
              language === 'ar'
                ? `تم الفرز الآلي واعتماد القائمة القصيرة وفتح المقابلات لـ ${res.approvedCount} مرشحين بنجاح!`
                : `Bulk AI scan completed and ${res.approvedCount} candidates approved for virtual interviews!`
            );
            setTimeout(() => setBulkScanSuccessMessage(null), 6000);
          }}
        />
      )}

      {/* COMPREHENSIVE INTERVIEW DETAILS DOSSIER MODAL */}
      <InterviewDetailsModal
        isOpen={showInterviewDetailsModal}
        onClose={() => setShowInterviewDetailsModal(false)}
        applications={applications}
        candidates={candidates}
        allRequisitions={allRequisitions}
        selectedAppId={selectedInterviewAppId}
        onSelectAppId={(appId) => setSelectedInterviewAppId(appId)}
        selectedJobCode={interviewJobFilter}
        onSelectJobCode={(code) => setInterviewJobFilter(code)}
        onApproveFinalSelection={(appId) => {
          approveFinalSelection(appId);
          setFinalOfferSuccess(appId);
        }}
      />
    </div>
  );
};
