import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { Candidate, CandidateApplication, JobRequisition } from '../../types';
import { PostJobModal } from '../../components/admin/PostJobModal';
import { InterviewDetailsModal } from '../../components/modals/InterviewDetailsModal';
import { XaiModal } from '../../components/modals/XaiModal';
import { CandidateDetailsModal } from '../../components/modals/CandidateDetailsModal';
import { BulkUploadView } from './BulkUploadView';
import {
  Briefcase,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  Award,
  ChevronRight,
  Filter,
  UserCheck,
  FileText,
  Clock,
  Layers,
  ShieldCheck,
  Building2,
  MapPin,
  Check,
  ExternalLink,
  UploadCloud,
  Users,
  AlertTriangle
} from 'lucide-react';

export const EmployerWorkspace: React.FC = () => {
  const {
    candidates,
    allRequisitions,
    activeRequisition,
    setActiveRequisition,
    applications,
    approveShortlistForInterview,
    approveFinalSelection,
    bulkApproveFinalSelection,
    submitApplication
  } = useCandidate();

  const { language } = useLanguage();
  const { activePersona, activeNavTab, setActiveNavTab } = useAuthRbac();

  // Active Employer Workspace Tab/Page
  const [activeEmployerPage, setActiveEmployerPage] = useState<'pipeline' | 'bulk_upload'>('pipeline');

  // Sync activeNavTab from sidebar with workspace view
  React.useEffect(() => {
    if (activeNavTab === 'bulk_upload') {
      setActiveEmployerPage('bulk_upload');
    } else if (activeNavTab === 'virtual_interview') {
      setActiveEmployerPage('pipeline');
      setStageFilter('interviewed');
    } else {
      setActiveEmployerPage('pipeline');
    }
  }, [activeNavTab]);

  const handleSwitchPage = (page: 'pipeline' | 'bulk_upload') => {
    setActiveEmployerPage(page);
    setActiveNavTab(page === 'bulk_upload' ? 'bulk_upload' : 'candidates_pipeline');
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'top' | 'shortlisted' | 'interviewed' | 'offered'>('all');

  // Modals state
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);
  const [xaiCandidate, setXaiCandidate] = useState<Candidate | null>(null);
  const [interviewModalAppId, setInterviewModalAppId] = useState<string | null>(null);

  // Success notifications
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Compute matched candidates for active requisition
  const currentJob = activeRequisition || allRequisitions[0];
  const jobApps = applications.filter(a => a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code);

  const matchedCandidates = candidates.map(cand => {
    const app = jobApps.find(a => a.candidateId === cand.id || a.candidateName?.toLowerCase() === cand.name?.toLowerCase());
    let domainFit = cand.rawMatchScore;

    if (currentJob.id === 'req-084' || currentJob.id === 'req-150') {
      if (cand.certifications.some(c => c.toLowerCase().includes('radar') || c.toLowerCase().includes('atc') || c.toLowerCase().includes('controller'))) {
        domainFit = cand.rawMatchScore;
      } else {
        domainFit = Math.max(55, cand.rawMatchScore - 18);
      }
    } else if (currentJob.id === 'req-112') {
      if (cand.currentTitle.toLowerCase().includes('cns') || cand.currentTitle.toLowerCase().includes('radar') || cand.education.toLowerCase().includes('engineering')) {
        domainFit = cand.rawMatchScore;
      } else {
        domainFit = Math.max(50, cand.rawMatchScore - 22);
      }
    } else if (currentJob.id === 'req-045') {
      if (cand.currentTitle.toLowerCase().includes('safety') || cand.currentTitle.toLowerCase().includes('aim') || cand.currentTitle.toLowerCase().includes('dispatch')) {
        domainFit = cand.rawMatchScore;
      } else {
        domainFit = Math.max(55, cand.rawMatchScore - 16);
      }
    } else if (currentJob.id === 'req-188') {
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
  .filter(item => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.candidate.name.toLowerCase().includes(q) || item.candidate.nameAr.includes(q);
      const matchTitle = item.candidate.currentTitle.toLowerCase().includes(q) || item.candidate.currentTitleAr.includes(q);
      const matchCert = item.candidate.certifications.some(c => c.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchCert) return false;
    }

    // Stage filter (strictly scoped to this job requisition's application)
    const isShortlisted = Boolean(item.application?.shortlistedByRecruiter || item.application?.status === 'Interview Scheduled' || item.application?.status === 'Interview Completed' || item.application?.status === 'Offer Stage');
    const isOffered = Boolean(item.application?.finalSelected || item.application?.status === 'Offer Stage');
    const isInterviewDone = Boolean(
      (item.application?.interviewScore && item.application.interviewScore > 0) ||
      item.application?.status === 'Interview Completed' ||
      item.application?.status === 'Offer Stage'
    );

    if (stageFilter === 'top') return item.matchScore >= 85;
    if (stageFilter === 'shortlisted') return isShortlisted && !isOffered;
    if (stageFilter === 'interviewed') return isInterviewDone;
    if (stageFilter === 'offered') return isOffered;

    return true;
  })
  .sort((a, b) => b.matchScore - a.matchScore);

  // Helper: ensure candidate has an application and shortlist them for current job
  const handleShortlist = (candId: string) => {
    const targetCand = candidates.find(c => c.id === candId);
    if (!targetCand) return;

    let app = applications.find(a => 
      (a.candidateId === candId || a.candidateName === targetCand.name) && 
      (a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code)
    );

    if (!app) {
      app = submitApplication(currentJob.id, {
        candidateId: targetCand.id,
        candidateName: targetCand.name,
        candidateNameAr: targetCand.nameAr,
        status: 'Interview Scheduled',
        stageIndex: 3,
        shortlistedByRecruiter: true,
        screeningScore: targetCand.rawMatchScore
      });
    }

    approveShortlistForInterview(app.id);
    showToast(
      language === 'ar'
        ? `تم اعتماد المرشح ${targetCand.nameAr} في القائمة القصيرة وتأهيله للمقابلة الذكية!`
        : `Candidate ${targetCand.name} shortlisted for AI Virtual Interview!`
    );
  };

  // Helper: ensure application exists for current job and open interview & offer modal
  const handleOpenInterviewModal = (candId: string) => {
    const targetCand = candidates.find(c => c.id === candId);
    if (!targetCand) return;

    let app = applications.find(a => 
      (a.candidateId === candId || a.candidateName === targetCand.name) && 
      (a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code)
    );

    if (!app) {
      app = submitApplication(currentJob.id, {
        candidateId: targetCand.id,
        candidateName: targetCand.name,
        candidateNameAr: targetCand.nameAr,
        status: 'Interview Scheduled',
        stageIndex: 3,
        shortlistedByRecruiter: true,
        screeningScore: targetCand.rawMatchScore
      });
    }

    setInterviewModalAppId(app.id);
  };

  // Multi-candidate selection state for batch shortlisting
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Clear selections when switching active job requisition
  React.useEffect(() => {
    setSelectedCandidateIds([]);
  }, [currentJob.id]);

  // Bulk Shortlist Helper: shortlists all selected candidates for the current job
  const handleBulkShortlist = (candIds: string[]) => {
    if (candIds.length === 0) return;
    let count = 0;
    candIds.forEach(candId => {
      const targetCand = candidates.find(c => c.id === candId);
      if (!targetCand) return;

      let app = applications.find(a => 
        (a.candidateId === candId || a.candidateName === targetCand.name) && 
        (a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code)
      );

      if (!app) {
        app = submitApplication(currentJob.id, {
          candidateId: targetCand.id,
          candidateName: targetCand.name,
          candidateNameAr: targetCand.nameAr,
          status: 'Interview Scheduled',
          stageIndex: 3,
          shortlistedByRecruiter: true,
          screeningScore: targetCand.rawMatchScore
        });
      }

      approveShortlistForInterview(app.id);
      count++;
    });

    setSelectedCandidateIds([]);
    showToast(
      language === 'ar'
        ? `تم اعتماد القائمة القصيرة وتأهيل ${count} من المرشحين للمقابلة الذكية بنجاح!`
        : `Successfully shortlisted ${count} candidates for the AI Virtual Interview!`
    );
  };

  // Bulk Final Selection / Job Offer Helper: issues job offers to all selected candidates for currentJob
  const handleBulkOffer = (candIds: string[]) => {
    if (candIds.length === 0) return;
    let count = 0;
    candIds.forEach(candId => {
      const targetCand = candidates.find(c => c.id === candId);
      if (!targetCand) return;

      let app = applications.find(a => 
        (a.candidateId === candId || a.candidateName?.toLowerCase() === targetCand.name?.toLowerCase()) && 
        (a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code)
      );

      if (!app) {
        app = submitApplication(currentJob.id, {
          candidateId: targetCand.id,
          candidateName: targetCand.name,
          candidateNameAr: targetCand.nameAr,
          status: 'Offer Stage',
          stageIndex: 4,
          shortlistedByRecruiter: true,
          finalSelected: true,
          interviewScore: targetCand.virtualInterviewScore || 92,
          screeningScore: targetCand.rawMatchScore
        });
      } else {
        approveFinalSelection(app.id);
      }
      count++;
    });

    setSelectedCandidateIds([]);
    showToast(
      language === 'ar'
        ? `تم اعتماد الاختيار النهائي وإصدار عروض العمل (Oracle HCM) لـ ${count} من المرشحين بنجاح!`
        : `Successfully issued official employment offers (Oracle HCM) to ${count} candidates for ${currentJob.title}!`
    );
  };

  // Quick Action: Shortlist all candidates with match score >= 85%
  const handleShortlistAllTop = () => {
    const topIds = matchedCandidates
      .filter(m => m.matchScore >= 85)
      .map(m => m.candidate.id);
    handleBulkShortlist(topIds);
  };

  const allVisibleSelected = matchedCandidates.length > 0 && matchedCandidates.every(m => selectedCandidateIds.includes(m.candidate.id));
  const someVisibleSelected = matchedCandidates.some(m => selectedCandidateIds.includes(m.candidate.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(matchedCandidates.map(m => m.candidate.id));
    }
  };

  const handleToggleSelectCandidate = (candId: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(candId) ? prev.filter(id => id !== candId) : [...prev, candId]
    );
  };

  // Counts for filter pills (strictly scoped to active job requisition)
  const totalCount = candidates.length;
  const topMatchesCount = candidates.filter(c => c.rawMatchScore >= 85).length;
  const shortlistedCount = jobApps.filter(a => a.shortlistedByRecruiter || a.status === 'Interview Scheduled' || a.status === 'Interview Completed' || a.status === 'Offer Stage').length;
  const interviewedCount = jobApps.filter(a => !!a.interviewScore || a.status === 'Interview Completed' || a.status === 'Offer Stage').length;
  const offersCount = jobApps.filter(a => a.finalSelected || a.status === 'Offer Stage').length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: 'var(--color-primary-dark)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <CheckCircle2 size={16} color="#4ade80" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. TOP HERO & ACTION BAR */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: '20px 24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--color-primary-dark)' }}>
              {language === 'ar' ? 'مركز استقطاب وفرز الكفاءات الملاحية' : 'Aviation Talent Acquisition & Screening Hub'}
            </h1>
            <span className="badge green-badge" style={{ fontSize: 11, padding: '4px 10px' }}>
              ● {language === 'ar' ? activePersona.titleAr : activePersona.title}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
            {language === 'ar'
              ? 'إدارة متطلبات الوظائف، استعراض السير الذاتية ومطابقة الذكاء الاصطناعي، واعتماد المقابلات وإصدار العروض'
              : 'Create jobs, inspect AI-extracted scores, shortlist qualified talent, and issue employment offers.'}
          </p>
        </div>

        {/* Primary CTAs: Bulk Upload + Create Job */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeEmployerPage === 'bulk_upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSwitchPage('bulk_upload')}
            style={{
              padding: '9px 16px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <UploadCloud size={16} />
            <span>{language === 'ar' ? 'استيعاب سير ذاتية جماعية (Bulk)' : 'Upload Bulk CVs'}</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowPostJobModal(true)}
            style={{
              padding: '9px 18px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(15, 81, 50, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>{language === 'ar' ? 'إنشاء وظيفة جديدة (أوراكل)' : '+ Post New Job'}</span>
          </button>
        </div>
      </div>

      {/* Workspace Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
        <button
          className={`btn btn-sm ${activeEmployerPage === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleSwitchPage('pipeline')}
          style={{ borderRadius: 20, padding: '6px 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Users size={15} />
          <span>{language === 'ar' ? 'لوحة المرشحين ومطابقة الذكاء الاصطناعي' : 'Candidates & AI Pipeline'}</span>
          <span className="badge" style={{ fontSize: 11, backgroundColor: activeEmployerPage === 'pipeline' ? '#14532d' : '#e2e8f0', color: activeEmployerPage === 'pipeline' ? '#fff' : '#334155' }}>
            {candidates.length}
          </span>
        </button>

        <button
          className={`btn btn-sm ${activeEmployerPage === 'bulk_upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleSwitchPage('bulk_upload')}
          style={{ borderRadius: 20, padding: '6px 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <UploadCloud size={15} />
          <span>{language === 'ar' ? 'رفع السير الذاتية والفرز الآلي الجماعي' : 'Bulk CV Upload & AI Analysis'}</span>
        </button>
      </div>

      {/* Conditionally Render Dedicated Bulk Upload View OR Candidates Pipeline */}
      {activeEmployerPage === 'bulk_upload' ? (
        <BulkUploadView onNavigateToPipeline={() => handleSwitchPage('pipeline')} />
      ) : (
        <>
          {/* 2. REQUISITIONS STRIP (MINIMALIST CAROUSEL/TABS) */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-muted)' }}>
            {language === 'ar' ? 'الوظائف الشاغرة النشطة' : 'Active Job Requisitions'} ({allRequisitions.length})
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
            {language === 'ar' ? 'اختر وظيفة لعرض المرشحين المطابقين' : 'Select a requisition to filter candidate pipeline'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {allRequisitions.map(req => {
            const isSelected = req.id === currentJob.id || req.code === currentJob.code;
            return (
              <button
                key={req.id}
                onClick={() => setActiveRequisition(req.id)}
                style={{
                  background: isSelected ? 'var(--color-subtle-green)' : '#fafafa',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  textAlign: language === 'ar' ? 'right' : 'left',
                  cursor: 'pointer',
                  minWidth: 260,
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {req.code}
                  </span>
                  <span className="badge" style={{ fontSize: 10, backgroundColor: isSelected ? '#198754' : '#e2e8f0', color: isSelected ? '#fff' : '#475569' }}>
                    {req.totalApplicants || 0} {language === 'ar' ? 'متقدم' : 'Candidates'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {language === 'ar' ? req.titleAr : req.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {language === 'ar' ? req.departmentAr : req.department}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE JOB DETAILS BANNER */}
      <div style={{
        backgroundColor: 'var(--color-subtle-green)',
        borderRadius: 8,
        padding: '14px 20px',
        border: '1px solid var(--color-border-green)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              {language === 'ar' ? currentJob.titleAr : currentJob.title} ({currentJob.code})
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {currentJob.location} • {currentJob.salaryRange || '25,000 - 32,000 SAR'} • {currentJob.experienceLevel}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(currentJob.requirements || []).slice(0, 2).map((req, i) => (
            <span key={i} style={{ fontSize: 11, padding: '4px 10px', background: '#fff', borderRadius: 20, border: '1px solid var(--color-border-green)', color: 'var(--color-primary-dark)' }}>
              ✓ {req}
            </span>
          ))}
        </div>
      </div>

      {/* 4. CANDIDATE PIPELINE: SEARCH & FILTER BAR */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: '16px 20px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 280, maxWidth: 460 }}>
            <Search size={16} style={{ position: 'absolute', top: 11, [language === 'ar' ? 'right' : 'left']: 12, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث بالاسم، رخص الطيران (GACA)، أو الخبرة...' : 'Search candidate name, GACA cert, or skills...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                [language === 'ar' ? 'paddingRight' : 'paddingLeft']: 36,
                borderRadius: 6,
                border: '1px solid var(--color-border)',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          {/* AI Matching Info Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <Sparkles size={14} color="#198754" />
            <span>
              {language === 'ar' ? 'الفرز الذكي: أوزان الخبرة 40% | الرخص 30% | التعليم 20% | اللغة 10%' : 'AI Engine: Experience 40% | Certs 30% | Degree 20% | Lang 10%'}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border-subtle)', paddingTop: 12, overflowX: 'auto' }}>
          <button
            className={`btn btn-sm ${stageFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStageFilter('all')}
            style={{ borderRadius: 20, padding: '5px 14px' }}
          >
            {language === 'ar' ? 'كافة المرشحين' : 'All Candidates'} ({matchedCandidates.length})
          </button>

          <button
            className={`btn btn-sm ${stageFilter === 'top' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStageFilter('top')}
            style={{ borderRadius: 20, padding: '5px 14px' }}
          >
            <Sparkles size={13} />
            <span>{language === 'ar' ? 'الأعلى مطابقة (≥ 85%)' : 'Top AI Matches (≥85%)'} ({topMatchesCount})</span>
          </button>

          <button
            className={`btn btn-sm ${stageFilter === 'shortlisted' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStageFilter('shortlisted')}
            style={{ borderRadius: 20, padding: '5px 14px' }}
          >
            <CheckCircle2 size={13} />
            <span>{language === 'ar' ? 'المؤهلون للمقابلة' : 'Shortlisted for Interview'} ({shortlistedCount})</span>
          </button>

          <button
            className={`btn btn-sm ${stageFilter === 'interviewed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStageFilter('interviewed')}
            style={{ borderRadius: 20, padding: '5px 14px' }}
          >
            <Award size={13} />
            <span>{language === 'ar' ? 'المقابلات المكتملة' : 'Interview Completed'} ({interviewedCount})</span>
          </button>

          <button
            className={`btn btn-sm ${stageFilter === 'offered' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStageFilter('offered')}
            style={{ borderRadius: 20, padding: '5px 14px' }}
          >
            ★ <span>{language === 'ar' ? 'تم إصدار العرض' : 'Offers Issued'} ({offersCount})</span>
          </button>

          {/* Quick Action: Shortlist All Top Matches */}
          <button
            className="btn btn-sm"
            onClick={handleShortlistAllTop}
            title={language === 'ar' ? 'اعتماد جماعي لكافة المرشحين ذوي درجة مطابقة ≥ 85%' : 'Shortlist all candidates matching ≥85% in one click'}
            style={{
              borderRadius: 20,
              padding: '5px 14px',
              border: '1px solid #10B981',
              color: '#065F46',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#ECFDF5',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={13} color="#059669" />
            <span>{language === 'ar' ? '✦ اعتماد القائمة لكافة المؤهلين (≥85%)' : '✦ Shortlist All Top Matches (≥85%)'}</span>
          </button>
        </div>
      </div>

      {/* BULK SHORTLIST ACTION BAR */}
      {selectedCandidateIds.length > 0 && (
        <div style={{
          backgroundColor: '#064E3B',
          border: '1px solid #059669',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 8px 20px rgba(6, 78, 59, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
            }}>
              <UserCheck size={20} color="#FFFFFF" />
            </div>
            <div>
              <strong style={{ fontSize: 14 }}>
                {language === 'ar'
                  ? `تم تحديد ${selectedCandidateIds.length} من المرشحين`
                  : `${selectedCandidateIds.length} Candidate${selectedCandidateIds.length > 1 ? 's' : ''} Selected`}
              </strong>
              <div style={{ fontSize: 11.5, color: '#A7F3D0', marginTop: 1 }}>
                {language === 'ar'
                  ? `اعتماد القائمة القصيرة الجماعية وتأهيلهم للمقابلة الذكية لوظيفة (${currentJob.code})`
                  : `Batch shortlist and unlock virtual interviews for ${currentJob.title} (${currentJob.code})`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-sm"
              onClick={() => handleBulkShortlist(selectedCandidateIds)}
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <CheckCircle2 size={15} />
              <span>
                {language === 'ar'
                  ? `اعتماد القائمة القصيرة للمحددين (${selectedCandidateIds.length})`
                  : `Shortlist Selected (${selectedCandidateIds.length})`}
              </span>
            </button>

            <button
              className="btn btn-sm"
              onClick={() => handleBulkOffer(selectedCandidateIds)}
              title={language === 'ar' ? 'اعتماد الاختيار النهائي لعدة مرشحين وإصدار عروض العمل عبر أوراكل' : 'Approve final selection and issue official offers to all selected candidates'}
              style={{
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <Award size={15} />
              <span>
                {language === 'ar'
                  ? `إصدار عروض العمل للمحددين (${selectedCandidateIds.length}) ★`
                  : `Issue Job Offers to Selected (${selectedCandidateIds.length}) ★`}
              </span>
            </button>

            <button
              className="btn btn-sm"
              onClick={() => setSelectedCandidateIds([])}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {language === 'ar' ? 'إلغاء التحديد' : 'Deselect All'}
            </button>
          </div>
        </div>
      )}

      {/* 5. CANDIDATES AI RANKING TABLE / CARDS */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {matchedCandidates.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 15, fontWeight: 600 }}>{language === 'ar' ? 'لا يوجد مرشحون يطابقون معايير البحث الحالية' : 'No candidates match the selected criteria'}</p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); setStageFilter('all'); }}>
              {language === 'ar' ? 'إعادة ضبط الفلتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="clean-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--color-subtle-green)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ width: 44, padding: '12px 14px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={el => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                      onChange={handleToggleSelectAll}
                      title={language === 'ar' ? 'تحديد كافة المرشحين' : 'Select all candidates'}
                      style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--color-primary)' }}
                    />
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: language === 'ar' ? 'right' : 'left' }}>
                    {language === 'ar' ? 'المرشح / الخبرة' : 'Candidate & Profile'}
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>
                    {language === 'ar' ? 'درجة مطابقة الذكاء الاصطناعي' : 'AI Match Score'}
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: language === 'ar' ? 'right' : 'left' }}>
                    {language === 'ar' ? 'الرخص والاعتمادات الملاحية' : 'GACA / Aviation Certifications'}
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>
                    {language === 'ar' ? 'حالة المسار' : 'Pipeline Stage'}
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>
                    {language === 'ar' ? 'الإجراءات والقرارات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchedCandidates.map(({ candidate, application, matchScore }) => {
                  const isCanceled = Boolean(
                    application?.status === 'Interview Canceled' ||
                    application?.interviewCanceled ||
                    application?.ruleViolated
                  );
                  const isShortlisted = Boolean(application?.shortlistedByRecruiter || application?.status === 'Interview Scheduled' || application?.status === 'Interview Completed' || application?.status === 'Offer Stage');
                  const isOffered = !isCanceled && Boolean(application?.finalSelected || application?.status === 'Offer Stage');
                  const isInterviewDone = !isCanceled && Boolean(
                    (application?.interviewScore && application.interviewScore > 0) ||
                    application?.status === 'Interview Completed' ||
                    application?.status === 'Offer Stage'
                  );
                  const interviewScore = isCanceled ? 0 : application?.interviewScore;

                  return (
                    <tr
                      key={candidate.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: selectedCandidateIds.includes(candidate.id) ? '#F0FDF4' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Row Checkbox */}
                      <td style={{ width: 44, padding: '14px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.includes(candidate.id)}
                          onChange={() => handleToggleSelectCandidate(candidate.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--color-primary)' }}
                        />
                      </td>

                      {/* Candidate Name & Title */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0
                          }}>
                            {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-main)' }}>
                              {language === 'ar' ? candidate.nameAr : candidate.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                              {language === 'ar' ? candidate.currentTitleAr : candidate.currentTitle} • {candidate.experienceYears} {language === 'ar' ? 'سنوات' : 'Years'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* AI Match Score with XAI button */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span 
                            className="badge green-badge"
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              padding: '5px 12px',
                              backgroundColor: matchScore >= 85 ? 'var(--color-soft-green)' : '#fef3c7',
                              color: matchScore >= 85 ? 'var(--color-primary-dark)' : '#92400e',
                              border: matchScore >= 85 ? '1px solid var(--color-border-green)' : '1px solid #fcd34d'
                            }}
                          >
                            {matchScore}% {language === 'ar' ? 'مطابقة' : 'Match'}
                          </span>
                          <button
                            onClick={() => setXaiCandidate(candidate)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: 11,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Sparkles size={11} />
                            <span>{language === 'ar' ? 'تفسير الذكاء الاصطناعي' : 'Why this score?'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Aviation Certifications */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 320 }}>
                          {candidate.certifications.slice(0, 3).map((cert, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                background: '#f8fafc',
                                border: '1px solid var(--color-border)',
                                borderRadius: 4,
                                color: 'var(--color-text-main)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {cert}
                            </span>
                          ))}
                          {candidate.certifications.length > 3 && (
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                              +{candidate.certifications.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pipeline Stage Badge */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        {isCanceled ? (
                          <span className="badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', fontSize: 11, padding: '5px 10px', fontWeight: 800 }}>
                            ✕ {language === 'ar' ? 'ملغاة (مخالفة الشروط)' : 'Canceled (Rule Violated)'}
                          </span>
                        ) : isOffered ? (
                          <span className="badge" style={{ backgroundColor: '#198754', color: '#fff', fontSize: 11, padding: '5px 10px' }}>
                            ★ {language === 'ar' ? 'تم إرسال العرض (أوراكل)' : 'Job Offer Issued'}
                          </span>
                        ) : isInterviewDone ? (
                          <span className="badge" style={{ backgroundColor: '#0d6efd', color: '#fff', fontSize: 11, padding: '5px 10px' }}>
                            ✓ {language === 'ar' ? `المقابلة مكتملة (${interviewScore}%)` : `Interview Done (${interviewScore}%)`}
                          </span>
                        ) : isShortlisted ? (
                          <span className="badge green-badge" style={{ fontSize: 11, padding: '5px 10px' }}>
                            ✓ {language === 'ar' ? 'مؤهل للمقابلة الذكية' : 'Shortlisted for Interview'}
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: 11, padding: '5px 10px' }}>
                            {language === 'ar' ? 'تم الفرز الآلي' : 'AI Screened'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          
                          {/* 1. Inspect Profile */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setInspectingCandidate(candidate)}
                            title={language === 'ar' ? 'عرض السيرة والملف الشامل' : 'View Full Profile'}
                            style={{ padding: '6px 10px', fontSize: 12 }}
                          >
                            <FileText size={13} />
                            <span>{language === 'ar' ? 'الملف' : 'Profile'}</span>
                          </button>

                          {/* 2. Shortlist Action */}
                          {!isShortlisted ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleShortlist(candidate.id)}
                              style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                            >
                              <CheckCircle2 size={13} />
                              <span>{language === 'ar' ? 'فرز وقائمة' : 'Shortlist'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Check size={14} /> {language === 'ar' ? 'مدرج' : 'Shortlisted'}
                            </span>
                          )}

                          {/* 3. Review Interview & Send Offer Action */}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenInterviewModal(candidate.id)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: isCanceled ? '#DC2626' : isOffered ? '#166534' : 'var(--color-primary)',
                              borderColor: isCanceled ? '#B91C1C' : undefined
                            }}
                          >
                            {isCanceled ? <AlertTriangle size={13} color="#FFFFFF" /> : <Award size={13} />}
                            <span>
                              {isCanceled
                                ? (language === 'ar' ? 'ملغاة: مخالفة الشروط ✕' : 'Canceled: Rule Violated ✕')
                                : isOffered
                                ? (language === 'ar' ? 'عرض العمل المعتمد ★' : 'View Sent Offer ★')
                                : isInterviewDone
                                ? (language === 'ar' ? 'المقابلة والعرض ★' : 'Interview & Offer ★')
                                : (language === 'ar' ? 'المقابلة (معلقة) ⏳' : 'Interview (Pending) ⏳')}
                            </span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

      {/* MODAL 1: Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onJobCreated={(newJob) => {
          setShowPostJobModal(false);
          setActiveRequisition(newJob.id);
          showToast(
            language === 'ar'
              ? `تم إنشاء الوظيفة ${newJob.code} بنجاح ومزامنتها مع أوراكل!`
              : `New Job ${newJob.code} published & synchronized with Oracle HCM!`
          );
        }}
      />

      {/* MODAL 2: Candidate Details Profile Modal */}
      <CandidateDetailsModal
        isOpen={!!inspectingCandidate}
        candidate={inspectingCandidate}
        application={applications.find(a => (a.candidateId === inspectingCandidate?.id || a.candidateName === inspectingCandidate?.name) && (a.requisitionId === currentJob.id || a.requisitionCode === currentJob.code))}
        onClose={() => setInspectingCandidate(null)}
        onShortlist={(candId) => handleShortlist(candId)}
        onOpenInterview={(candId) => handleOpenInterviewModal(candId)}
      />

      {/* MODAL 3: XAI Score Explainability Modal */}
      {xaiCandidate && (
        <XaiModal
          candidate={xaiCandidate}
          onClose={() => setXaiCandidate(null)}
        />
      )}

      {/* MODAL 4: Interview Details & Send Offer Modal */}
      {interviewModalAppId && (
        <InterviewDetailsModal
          isOpen={true}
          onClose={() => setInterviewModalAppId(null)}
          applications={applications}
          candidates={candidates}
          allRequisitions={allRequisitions}
          selectedAppId={interviewModalAppId}
          onSelectAppId={(id) => setInterviewModalAppId(id)}
          selectedJobCode={currentJob.code}
          onSelectJobCode={() => {}}
          onApproveFinalSelection={(appId) => {
            approveFinalSelection(appId);
            showToast(
              language === 'ar'
                ? 'تم اعتماد الاختيار النهائي بنجاح وإرسال عرض العمل ومزامنته مع Oracle Fusion HCM!'
                : 'Final selection approved! Official Job Offer issued & synced to Oracle Fusion HCM!'
            );
          }}
        />
      )}

    </div>
  );
};
