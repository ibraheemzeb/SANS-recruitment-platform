import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { VoicePlayer } from '../voice/VoicePlayer';
import { Candidate, CandidateApplication, JobRequisition } from '../../types';
import { getCandidateAllInterviewAnswers, CandidateInterviewAnswerItem } from '../../data/candidateInterviewAnswers';
import { 
  X, 
  Video, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  FileText, 
  Download, 
  Mic,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
  ListFilter,
  AlertCircle,
  Lock,
  Send,
  ShieldAlert,
  AlertTriangle,
  Camera,
  Eye,
  Check,
  Sparkles
} from 'lucide-react';
import { ProctoringSnapshot } from '../../types';

interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: CandidateApplication[];
  candidates: Candidate[];
  allRequisitions: JobRequisition[];
  selectedAppId: string;
  onSelectAppId: (appId: string) => void;
  selectedJobCode: string;
  onSelectJobCode: (code: string) => void;
  onApproveFinalSelection: (appId: string) => void;
}

export const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  isOpen,
  onClose,
  applications,
  candidates,
  allRequisitions,
  selectedAppId,
  onSelectAppId,
  selectedJobCode,
  onSelectJobCode,
  onApproveFinalSelection
}) => {
  const { language } = useLanguage();
  const { recordCandidateInterviewResponse } = useCandidate();
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const [selectedQuestionTab, setSelectedQuestionTab] = useState<number | 'ALL'>('ALL');
  const [selectedSnapshotForPreview, setSelectedSnapshotForPreview] = useState<ProctoringSnapshot | null>(null);

  if (!isOpen) return null;

  // Filter apps by job
  const filteredApps = applications.filter(app => {
    if (selectedJobCode === 'ALL') return true;
    return app.requisitionCode === selectedJobCode || app.requisitionId === selectedJobCode;
  });

  const currentApp = filteredApps.find(a => a.id === selectedAppId)
    || filteredApps[0]
    || applications.find(a => a.id === selectedAppId)
    || applications[0];

  const candidateProfile = candidates.find(c => 
    c.id === currentApp?.candidateId || 
    c.name?.toLowerCase() === currentApp?.candidateName?.toLowerCase() ||
    c.nameAr === currentApp?.candidateNameAr
  );

  const candidateName: string = currentApp?.candidateName 
    ? (language === 'ar' ? (currentApp.candidateNameAr || candidateProfile?.nameAr || currentApp.candidateName) : currentApp.candidateName)
    : (candidateProfile ? (language === 'ar' ? (candidateProfile.nameAr || candidateProfile.name) : candidateProfile.name) : 'Candidate Applicant');

  // Check if interview was canceled due to proctoring rule violation
  const isCanceledDueToViolation = Boolean(
    currentApp?.status === 'Interview Canceled' ||
    currentApp?.interviewCanceled ||
    currentApp?.ruleViolated ||
    candidateProfile?.interviewCanceled ||
    candidateProfile?.ruleViolated
  );

  // Strict check: has this candidate actually completed and submitted the virtual interview?
  const hasTakenInterview = !isCanceledDueToViolation && Boolean(
    (typeof currentApp?.interviewScore === 'number' && currentApp.interviewScore > 0) ||
    currentApp?.status === 'Interview Completed' ||
    currentApp?.status === 'Offer Stage' ||
    (candidateProfile?.interviewCompleted === true && typeof currentApp?.interviewScore === 'number')
  );

  const interviewScore = isCanceledDueToViolation
    ? 0
    : hasTakenInterview 
    ? (currentApp?.interviewScore || (candidateProfile?.interviewCompleted ? candidateProfile.virtualInterviewScore : 88) || 88)
    : null;

  const isInterviewDone = hasTakenInterview;

  // All interview answers for this candidate (only populated if interview was submitted)
  const allAnswers = hasTakenInterview ? getCandidateAllInterviewAnswers(currentApp, candidateProfile) : [];
  const candidateSnapshots: ProctoringSnapshot[] = 
    (currentApp?.proctoringSnapshots && currentApp.proctoringSnapshots.length > 0)
      ? currentApp.proctoringSnapshots
      : (candidateProfile?.proctoringSnapshots && candidateProfile.proctoringSnapshots.length > 0)
        ? candidateProfile.proctoringSnapshots
        : [];
  const overallAiContentScore = currentApp?.aiContentScore ?? 4.8;
  const overallHumanScore = currentApp?.humanAuthenticityScore ?? 95.2;

  // Helper to highlight AI detected keywords in verbatim text
  const renderHighlightedTranscript = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;
    try {
      const regex = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => {
        const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark
            key={i}
            style={{
              backgroundColor: '#DCFCE7',
              color: '#14532D',
              padding: '1px 5px',
              borderRadius: 4,
              fontWeight: 700,
              border: '1px solid #86EFAC',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            {part}
          </mark>
        ) : part;
      });
    } catch {
      return text;
    }
  };

  const handleJobChange = (jobCode: string) => {
    onSelectJobCode(jobCode);
    const matching = applications.filter(a => jobCode === 'ALL' || a.requisitionCode === jobCode || a.requisitionId === jobCode);
    if (matching.length > 0) {
      onSelectAppId(matching[0].id);
    }
  };

  const handleApprove = () => {
    if (currentApp) {
      onApproveFinalSelection(currentApp.id);
      setOfferSuccess(currentApp.id);
    }
  };

  const handleSimulateCandidateSubmission = () => {
    if (!currentApp) return;
    recordCandidateInterviewResponse(currentApp.id, {
      question: 'Airspace Conflict Resolution & Separation Minima',
      answer: 'In high-density sector operations, I immediately issued conflicting vectors: instructed Lead Aircraft A to execute an immediate 30-degree right turn and descent to FL330, while holding Aircraft B on present heading and climbing to FL350 to establish 2,000 ft vertical buffer.',
      score: 94,
      feedbackEn: 'Exemplary immediate separation execution. Flawless 30-degree heading divergence and TCAS RA cross-verification.',
      feedbackAr: 'تنفيذ استثنائي للفصل الراداري الفوري. انحراف مسار 30 درجة دقيق وتحقق متزامن من إشعارات تفادي التصادم.',
      hasAudioVoice: true
    });
  };

  const displayedAnswers = selectedQuestionTab === 'ALL' 
    ? allAnswers 
    : allAnswers.filter(a => a.questionNumber === selectedQuestionTab);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 25, 18, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 960,
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '16px 22px',
          backgroundColor: 'var(--color-primary-dark)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mic size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                {language === 'ar' ? 'ملف المقابلة الشامل — تفريغ جميع إجابات المرشح والتقييم' : 'Complete Candidate Interview Dossier — All Answers & Audio Transcripts'}
              </h2>
              <div style={{ fontSize: 11, color: '#D1E7DD', marginTop: 2 }}>
                SANS Air Traffic Management &bull; 5 Competency Questions &bull; ICAO SARPs Certified
              </div>
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL TOOLBAR: JOB & CANDIDATE SELECTORS */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--color-subtle-green)',
          borderBottom: '1px solid var(--color-border-green)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
          alignItems: 'center'
        }}>
          {/* Job Dropdown */}
          <div>
            <label 
              htmlFor="modal-job-select" 
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 3 }}
            >
              <Briefcase size={12} />
              <span>{language === 'ar' ? 'الوظيفة الشاغرة (Job Requisition):' : 'Job Requisition:'}</span>
            </label>
            <select
              id="modal-job-select"
              className="clean-select"
              style={{ width: '100%', fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 12, padding: '6px 10px' }}
              value={selectedJobCode}
              onChange={(e) => handleJobChange(e.target.value)}
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

          {/* Candidate Dropdown */}
          <div>
            <label 
              htmlFor="modal-candidate-select" 
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 3 }}
            >
              <Users size={12} />
              <span>{language === 'ar' ? 'المرشح (Candidate Application):' : 'Candidate Application:'}</span>
            </label>
            <select
              id="modal-candidate-select"
              className="clean-select"
              style={{ width: '100%', fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 12, padding: '6px 10px' }}
              value={currentApp?.id || ''}
              onChange={(e) => {
                onSelectAppId(e.target.value);
                setOfferSuccess(null);
              }}
            >
              {filteredApps.map(app => {
                const cProfile = candidates.find(c => c.id === app.candidateId || c.name === app.candidateName);
                const name = language === 'ar' ? (app.candidateNameAr || cProfile?.nameAr || app.candidateName) : (app.candidateName || cProfile?.name);
                const isAppCanceled = Boolean(app.status === 'Interview Canceled' || app.interviewCanceled || app.ruleViolated || cProfile?.interviewCanceled || cProfile?.ruleViolated);
                const isAppDone = !isAppCanceled && Boolean((app.interviewScore && app.interviewScore > 0) || app.status === 'Interview Completed' || app.status === 'Offer Stage');
                const scoreBadge = isAppCanceled
                  ? (language === 'ar' ? '✕ ملغاة — مخالفة الشروط' : '✕ Canceled — Rule Violated')
                  : isAppDone 
                  ? (language === 'ar' ? `✓ مكتملة (${app.interviewScore || 85}%)` : `✓ Completed (${app.interviewScore || 85}%)`)
                  : (language === 'ar' ? '⏳ المقابلة معلقة' : '⏳ Interview Pending');
                return (
                  <option key={`modal-app-${app.id}`} value={app.id}>
                    {name} ({scoreBadge}) — {app.id} &bull; {app.requisitionCode}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* SUCCESS BANNER IF OFFER ISSUED */}
          {(offerSuccess === currentApp?.id || currentApp?.finalSelected) && (
            <div style={{
              backgroundColor: 'var(--color-soft-green)',
              border: '1px solid var(--color-border-green)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <CheckCircle2 size={24} color="var(--color-primary)" />
              <div>
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: 13 }}>
                  {language === 'ar' ? 'تم اعتماد الاختيار النهائي بنجاح ومزامنته مع أوراكل!' : 'Final Selection Approved & Synced with Oracle Fusion HCM!'}
                </strong>
                <p style={{ fontSize: 12, color: 'var(--color-primary-dark)', margin: 0 }}>
                  {language === 'ar'
                    ? `تم اعتماد ملف ${candidateName} لوظيفة ${currentApp?.jobTitleAr || currentApp?.jobTitle} (رمز ${currentApp?.requisitionCode}).`
                    : `Candidate ${candidateName} has been approved for ${currentApp?.jobTitle} (${currentApp?.requisitionCode}).`}
                </p>
              </div>
            </div>
          )}

          {/* REMINDER SENT BANNER */}
          {reminderSent === currentApp?.id && (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <CheckCircle2 size={20} color="#059669" />
              <div>
                <strong style={{ color: '#065F46', fontSize: 13 }}>
                  {language === 'ar' ? 'تم إرسال تذكير فوري للمرشح بنجاح!' : 'Interview Reminder Dispatched Successfully!'}
                </strong>
                <p style={{ fontSize: 12, color: '#065F46', margin: 0 }}>
                  {language === 'ar'
                    ? `تم إرسال رابط المقابلة الذكية المباشر للمرشح ${candidateName} عبر الرسائل النصية القصيرة (SMS) والبريد الإلكتروني.`
                    : `Direct virtual interview portal link sent to ${candidateName} via SMS and registered email.`}
                </p>
              </div>
            </div>
          )}

          {/* CANDIDATE PROFILE SUMMARY BAR */}
          <div style={{
            padding: 14,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  {candidateName}
                </h3>
                <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#334155', fontSize: 11 }}>
                  {currentApp?.id}
                </span>
                {isCanceledDueToViolation ? (
                  <span className="badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', fontSize: 11, fontWeight: 800 }}>
                    ✕ {language === 'ar' ? 'تم إلغاء المقابلة (مخالفة الشروط)' : 'Interview Canceled (Rule Violated)'}
                  </span>
                ) : currentApp?.finalSelected ? (
                  <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 700 }}>
                    ★ Offer Approved
                  </span>
                ) : hasTakenInterview ? (
                  <>
                    <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700 }}>
                      ✓ Interview Completed ({interviewScore}%)
                    </span>
                    <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: 10.5, fontWeight: 700 }}>
                      🤖 AI Content: {overallAiContentScore}% (Authentic)
                    </span>
                    <span className="badge" style={{ backgroundColor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontSize: 10.5, fontWeight: 700 }}>
                      📸 {candidateSnapshots.length} Proctoring Snaps
                    </span>
                  </>
                ) : (
                  <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: 11, fontWeight: 700 }}>
                    ⏳ Interview Pending from Candidate
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {language === 'ar' ? currentApp?.jobTitleAr : currentApp?.jobTitle} &bull; {currentApp?.requisitionCode} &bull; {currentApp?.location}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'معدل المقابلة الكلي' : 'Overall Interview Score'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: isCanceledDueToViolation ? '#DC2626' : hasTakenInterview ? 'var(--color-primary)' : '#94A3B8' }}>
                  {isCanceledDueToViolation ? (
                    <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 800 }}>
                      0 / 100 ({language === 'ar' ? 'غير مؤهل' : 'Disqualified'})
                    </span>
                  ) : hasTakenInterview ? (
                    <>
                      {interviewScore} <span style={{ fontSize: 12, fontWeight: 500 }}>/ 100</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#D97706', fontWeight: 700 }}>
                      {language === 'ar' ? 'قيد الانتظار (--)' : '-- / 100 (Pending)'}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'الأسئلة المجابة' : 'Questions Answered'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isCanceledDueToViolation ? '#DC2626' : hasTakenInterview ? 'var(--color-primary-dark)' : '#D97706' }}>
                  {isCanceledDueToViolation
                    ? (language === 'ar' ? '0 / 5 (مُنهَاة بمخالفة)' : '0 / 5 (Terminated)')
                    : hasTakenInterview ? '5 / 5 Complete' : (language === 'ar' ? '0 / 5 (معلقة)' : '0 / 5 (Pending)')}
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT: CONDITIONAL: RULE VIOLATION vs PENDING vs SUBMITTED */}
          {isCanceledDueToViolation ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #FCA5A5',
              borderRadius: 12,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
              margin: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}>
                  <ShieldAlert size={30} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#991B1B' }}>
                      {language === 'ar' ? 'تم إلغاء المقابلة فورياً — تم رصد مخالفة لشروط النزاهة' : 'Interview Canceled — Integrity Rule Violated'}
                    </h3>
                    <span style={{
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      Rule Violated
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12.5, color: '#B91C1C' }}>
                    {language === 'ar'
                      ? 'تم رصد إنهاء الجلسة آلياً بواسطة نظام المراقبة الذكي التابع لشركة خدمات الملاحة الجوية السعودية (SANS Proctoring Engine)'
                      : 'Automated session termination logged by SANS Assessment Integrity & Anti-Cheating Protocol'}
                  </p>
                </div>
              </div>

              {/* Violation Detail Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                padding: '18px 20px',
                marginBottom: 20
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'سبب الإلغاء الرسمي' : 'Official Cancellation Reason'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', marginTop: 4 }}>
                      Rule Violated (Repeated Offence)
                    </div>
                    <div style={{ fontSize: 12, color: '#991B1B', marginTop: 2 }}>
                      {currentApp?.cancellationReason || candidateProfile?.cancellationReason || 'Candidate committed a repeated proctoring violation following an initial official warning.'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'وقت تسجيل المخالفة' : 'Incident Timestamp'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 4 }}>
                      {currentApp?.cancellationTimestamp || candidateProfile?.cancellationTimestamp || new Date().toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {language === 'ar' ? 'مسجل ومؤرشف في سجل التدقيق' : 'Logged & committed to SANS audit ledger'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'القرار النظامي للموارد البشرية' : 'HR Regulatory Action'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', marginTop: 4 }}>
                      {language === 'ar' ? 'استبعاد فوري وتجميد عرض العمل' : 'Disqualified — Job Offer Blocked'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {language === 'ar' ? 'وفق اللائحة التنفيذية للأمن والسلامة (ICAO SARPs)' : 'Mandatory under SANS Assessment Policy & ICAO Annex 1'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFF1F2',
                borderRadius: 8,
                padding: '12px 16px',
                borderLeft: '4px solid #DC2626',
                fontSize: 12.5,
                color: '#881337',
                lineHeight: 1.5
              }}>
                <strong>{language === 'ar' ? 'ملاحظة للمسؤول:' : 'Proctoring Audit Notice:'}</strong>{' '}
                {language === 'ar'
                  ? 'تم رصد انتقال مؤشر الشاشة أو تبديل النوافذ أثناء طرح الأسئلة، مما يُعد مخالفة صريحة لقواعد النزاهة واختبارات الملاحة الجوية. تم وسم ملف المرشح في نظام أوراكل بصفة "مخالفة الشروط"، وتم قفل إمكانية إصدار أي عروض وظيفية لهذا الطلب.'
                  : 'Candidate focus was lost during the live interview session (window blur / tab switch / external app focus). The session was terminated immediately to maintain air traffic safety screening integrity. All answers have been voided and marked as 0/100 Disqualified.'}
              </div>
            </div>
          ) : !hasTakenInterview ? (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              padding: '36px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              margin: '8px 0'
            }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                border: '2px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
              }}>
                <Clock size={34} color="#D97706" />
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 800, color: '#92400E' }}>
                {language === 'ar' 
                  ? 'بانتظار إجراء المقابلة الذكية وإرسال الإجابات من المرشح'
                  : 'Virtual Interview Pending from Candidate'}
              </h3>

              <p style={{
                maxWidth: 640,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: '#78350F',
                margin: '0 auto 22px auto'
              }}>
                {language === 'ar'
                  ? `المرشح (${candidateName}) تم ترشيحه للمقابلة الافتراضية الذكية، ولكن لم يقم حتى الآن بإجراء المقابلة أو تسجيل وإرسال الإجابات. بمجرد إكمال المرشح للأسئلة عبر بوابة المرشح، ستظهر هنا تلقائياً التسجيلات الصوتية والنصوص والتقييمات المعتمدة.`
                  : `Candidate ${candidateName} has been shortlisted and invited to the SANS AI Virtual Interview, but has not yet taken the interview or submitted voice responses. Once the candidate records and submits their answers in the Candidate Portal, their complete audio recordings, verbatim transcripts, and AI evaluations will appear here.`}
              </p>

              {/* Status details grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                width: '100%',
                maxWidth: 720,
                marginBottom: 24,
                textAlign: language === 'ar' ? 'right' : 'left'
              }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                    {language === 'ar' ? 'حالة الطلب الحالية' : 'Current Application Stage'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#78350F', marginTop: 3 }}>
                    {language === 'ar' ? 'مؤهل للمقابلة الذكية (قائمة الفرز)' : 'Shortlisted for Virtual Interview'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                    {language === 'ar' ? 'هيكل المقابلة' : 'Configured Format'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#78350F', marginTop: 3 }}>
                    {language === 'ar' ? '5 أسئلة كفاءة صوتية (إيكاو)' : '5 ICAO Competency Questions (Voice)'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                    {language === 'ar' ? 'الردود المستلمة' : 'Submitted Responses'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>0 / 5 {language === 'ar' ? 'إجابات مسجلة' : 'Recorded'}</span>
                    <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: 10 }}>
                      {language === 'ar' ? 'معلق' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setReminderSent(currentApp?.id || 'done');
                    setTimeout(() => setReminderSent(null), 6000);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 18px',
                    fontWeight: 700,
                    backgroundColor: '#D97706',
                    borderColor: '#B45309'
                  }}
                >
                  <Send size={14} />
                  <span>
                    {language === 'ar' ? 'إرسال تذكير للمرشح لإجراء المقابلة (SMS / بريد)' : 'Send Interview Reminder to Candidate (SMS / Email)'}
                  </span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.origin + window.location.pathname);
                    alert(language === 'ar' ? 'تم نسخ رابط المقابلة المباشر للمرشح بنجاح.' : 'Direct candidate interview link copied to clipboard.');
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
                >
                  <ExternalLink size={14} />
                  <span>{language === 'ar' ? 'نسخ رابط المقابلة للمرشح' : 'Copy Candidate Interview Link'}</span>
                </button>

                {/* Recruiter testing trigger */}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSimulateCandidateSubmission}
                  title={language === 'ar' ? 'محاكاة تقديم المرشح لإجابات المقابلة لأغراض العرض والتجربة' : 'Simulate candidate taking interview & submitting responses for demo testing'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontSize: 11
                  }}
                >
                  <CheckCircle2 size={13} color="#16A34A" />
                  <span>{language === 'ar' ? 'تجربة: محاكاة إكمال المقابلة للمرشح' : 'Demo: Simulate Candidate Submission'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================= 1. PROCTORING WEBCAM SNAPSHOTS (RANDOM TIME SNAPS) ================= */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1.5px solid #E2E8F0',
                padding: '16px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669'
                    }}>
                      <Camera size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                        {language === 'ar' ? '📸 لقطات الكاميرا العشوائية أثناء المقابلة (Proctoring Random Snapshots)' : '📸 Random Proctoring Webcam Snapshots Taken During Assessment'}
                      </h4>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                        {language === 'ar'
                          ? 'التقاط صور عشوائية مستمرة للمرشح عبر الويبكام للتحقق التام من هويته البيومترية وعدم الاستعانة بمساعد خارجي'
                          : 'Automated periodic snapshots captured during the live session to verify identity continuity and candidate presence'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#065F46',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <ShieldCheck size={13} color="#059669" />
                      <span>{language === 'ar' ? 'تطابق بيومتري 100% مع نفاذ' : '100% Biometric Match (Nafath)'}</span>
                    </span>

                    <span style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {candidateSnapshots.length} {language === 'ar' ? 'لقطات عشوائية موثقة' : 'Random Snaps Verified'}
                    </span>
                  </div>
                </div>

                {/* Snapshots Gallery Grid or Camera Waiting State */}
                {candidateSnapshots.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12
                  }}>
                    {candidateSnapshots.map((snap, sIdx) => (
                      <div
                        key={snap.id || `snap-${sIdx}`}
                        onClick={() => setSelectedSnapshotForPreview(snap)}
                        style={{
                          border: '1.5px solid #CBD5E1',
                          borderRadius: 10,
                          overflow: 'hidden',
                          backgroundColor: '#0F172A',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.14)';
                          e.currentTarget.style.borderColor = '#10B981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                        }}
                      >
                        {/* Photo Container */}
                        <div style={{ position: 'relative', height: 115, overflow: 'hidden', backgroundColor: '#1E293B' }}>
                          <img
                            src={snap.imageUrl}
                            alt={`Camera Snapshot ${sIdx + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />

                          {/* Top REC & Timestamp Watermark */}
                          <div style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 9.5,
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                            <span>REC {snap.timestamp}</span>
                          </div>

                          {/* Enlarge Hint */}
                          <div style={{
                            position: 'absolute',
                            bottom: 6,
                            right: 6,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            padding: '3px 6px',
                            borderRadius: 4,
                            fontSize: 9,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Eye size={10} />
                            <span>{language === 'ar' ? 'تكبير' : 'Enlarge'}</span>
                          </div>
                        </div>

                        {/* Card Details Footer */}
                        <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, marginBottom: 3 }}>
                            <span style={{ fontWeight: 800, color: '#059669' }}>
                              ✓ {language === 'ar' ? snap.statusAr || 'موثق' : snap.status} ({snap.faceConfidence}%)
                            </span>
                            <span style={{ color: '#64748B', fontFamily: 'monospace' }}>
                              Snap #{sIdx + 1}
                            </span>
                          </div>
                          <div style={{ fontSize: 9.5, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {language === 'ar' ? snap.gazeDirectionAr || snap.gazeDirection : snap.gazeDirection}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: 10,
                    padding: '28px 20px',
                    textAlign: 'center',
                    color: '#64748B'
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px auto',
                      color: '#0284C7'
                    }}>
                      <Camera size={22} />
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                      {language === 'ar' ? 'لا توجد صور مسبقة الرفع — جميع اللقطات تؤخذ مباشرة من الكاميرا' : 'No Pre-Uploaded Images — All Photos Must Be Taken Directly From Camera'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', maxWidth: 480, margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                      {language === 'ar'
                        ? 'يتم التقاط صور التحقق البيومتري تلقائياً وبأوقات عشوائية من كاميرا المرشح أثناء خوضه للمقابلة، ولن تظهر أي صور إلا اللقطات الحقيقية المأخوذة من الكاميرا مباشرة.'
                        : 'Biometric proctoring photos are snapped automatically at random intervals directly from the candidate\'s live webcam. Pre-uploaded static images are blocked to ensure authenticity.'}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= 2. PROMINENT AI CONTENT IN ANSWERS OVERVIEW ================= */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{language === 'ar' ? 'فحص محتوى الذكاء الاصطناعي في إجابات المرشح (AI Content in Answers):' : 'AI Content in Candidate Answers Analysis:'}</span>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10
                      }}>
                        {language === 'ar' ? 'صياغة بشرية أصيلة (مخاطر منعدمة)' : 'Verified Human Thought (Authentic)'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                      {language === 'ar'
                        ? 'تم تدقيق كافة إجابات المرشح (الصوتية والكتابية) للتأكد من الأصالة الفكرية وانعدام التوليد الآلي والمصطلحات المصطنعة'
                        : 'Candidate verbal & written answers audited for AI generation, synthetic phrasing patterns, and operational keyword mastery'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  {/* Human Originality */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'أصالة التفكير البشري' : 'Human Formulation'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>
                      {overallHumanScore}%
                    </div>
                  </div>

                  {/* AI Content Index */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'نسبة المحتوى الاصطناعي' : 'AI Content Index'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#2563EB' }}>
                      {overallAiContentScore}% <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>(Safe)</span>
                    </div>
                  </div>

                  {/* ICAO Term Match */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      {language === 'ar' ? 'مطابقة المصطلحات القياسية' : 'ICAO Term Match'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                      98%
                    </div>
                  </div>
                </div>
              </div>

              {/* QUESTION TABS & FILTER BAR */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)', marginRight: 6 }}>
              {language === 'ar' ? 'تصفح الإجابات:' : 'Browse Answers:'}
            </span>
            <button
              className={`btn btn-sm ${selectedQuestionTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedQuestionTab('ALL')}
              style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Layers size={12} />
              <span>{language === 'ar' ? '✦ عرض كافة الإجابات (5)' : '✦ View All 5 Answers'}</span>
            </button>
            {allAnswers.map(ans => (
              <button
                key={`tab-q-${ans.questionNumber}`}
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

          {/* ALL CANDIDATE ANSWERS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {displayedAnswers.map((item) => {
              const qText = language === 'ar' ? item.questionAr : item.questionEn;
              const aText = language === 'ar' ? item.candidateAnswerAr : item.candidateAnswerEn;

              return (
                <div
                  key={`ans-item-${item.id}`}
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* QUESTION HEADER */}
                  <div style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-subtle-green)',
                    borderBottom: '1px solid var(--color-border-green)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 800, fontSize: 11 }}>
                        Question {item.questionNumber}
                      </span>
                      <span className="badge outline-badge" style={{ fontSize: 11 }}>
                        {language === 'ar' ? item.categoryAr : item.category}
                      </span>
                      <span className="badge" style={{ backgroundColor: '#E0E7FF', color: '#3730A3', fontSize: 10 }}>
                        {item.questionType} &bull; {item.difficulty}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {item.duration} &bull; {item.wordCount} words
                      </span>
                      <span className="badge score-high" style={{ fontWeight: 800, fontSize: 12 }}>
                        {item.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* QUESTION TEXT */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: '#FAFAFA' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {language === 'ar' ? 'نص السؤال الموجه للمرشح:' : 'Interview Question Prompt:'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', lineHeight: 1.5 }}>
                      {qText}
                    </div>
                  </div>

                  {/* CANDIDATE VERBATIM ANSWER & AUDIO */}
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Natural Audio Synthesis Player */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mic size={14} color="var(--color-primary)" />
                        <span>{language === 'ar' ? `الاستماع لإجابة المرشح الصوتية (السؤال ${item.questionNumber}):` : `Listen to Candidate Voice Answer (Question ${item.questionNumber}):`}</span>
                      </div>
                      <VoicePlayer
                        speakerName={candidateName}
                        questionText={qText}
                        responseText={aText}
                      />
                    </div>

                    {/* Verbatim Transcript with Highlighted AI Keywords */}
                    <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                          {language === 'ar' ? 'التفريغ النصي الحرفي لإجابة المرشح (مع تظليل مفاهيم الذكاء الاصطناعي):' : 'Candidate Verbatim Speech Transcript (AI Concepts Highlighted):'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 9.5, color: '#15803D', backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            ✦ {language === 'ar' ? 'مفاهيم معتمدة مظللة' : 'Highlighted AI Concepts'}
                          </span>
                          <span className="badge green-badge" style={{ fontSize: 10 }}>
                            {item.icaoCompliance}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--color-text-main)', margin: 0, fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 6, border: '1px solid var(--color-border-subtle)' }}>
                        &ldquo;{renderHighlightedTranscript(aText, item.aiHighlightedKeywords || [])}&rdquo;
                      </p>
                    </div>

                    {/* PROMINENT AI CONTENT IN ANSWER INSPECTOR BOX */}
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1.5px solid #BBF7D0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={14} color="#059669" />
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                            {language === 'ar' ? 'تحليل محتوى الذكاء الاصطناعي للإجابة (AI Content & Authenticity):' : 'AI Content in Answer & Authenticity Analysis:'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          {/* Human vs AI Mini Progress Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#166534' }}>
                              Human: {item.humanOriginalityPercentage || 96}%
                            </span>
                            <div style={{ width: 60, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                              <div style={{ width: `${item.humanOriginalityPercentage || 96}%`, backgroundColor: '#10B981' }} />
                              <div style={{ width: `${item.aiContentPercentage || 4}%`, backgroundColor: '#3B82F6' }} />
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1E40AF' }}>
                              AI: {item.aiContentPercentage || 4}%
                            </span>
                          </div>

                          <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 800 }}>
                            {language === 'ar' ? item.aiDetectionVerdictAr : item.aiDetectionVerdictEn}
                          </span>
                        </div>
                      </div>

                      {/* AI Key Concepts Identified */}
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#166534', marginBottom: 5 }}>
                          {language === 'ar' ? 'المفاهيم والمصطلحات التشغيلية التي تحقق منها الذكاء الاصطناعي في الإجابة:' : 'AI-Verified Operational Concepts & Terminology in Answer:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(language === 'ar' ? item.aiKeyConceptsDetectedAr : item.aiKeyConceptsDetectedEn).map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #86EFAC',
                                color: '#14532D',
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 6,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Check size={11} color="#059669" />
                              <span>{concept}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Assessment & Rubrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, fontSize: 11 }}>
                      <div style={{ padding: 10, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                        <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: 3 }}>
                          {language === 'ar' ? 'تقييم الذكاء الاصطناعي (AI Evaluator):' : 'AI Assessment Feedback:'}
                        </strong>
                        <span style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                          {language === 'ar' ? item.aiFeedbackAr : item.aiFeedbackEn}
                        </span>
                      </div>

                      <div style={{ padding: 10, backgroundColor: '#F1F5F9', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                        <strong style={{ color: '#334155', display: 'block', marginBottom: 3 }}>
                          {language === 'ar' ? 'معايير الكفاءة المحققة:' : 'Verified Operational Rubrics:'}
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: language === 'ar' ? 0 : 16, paddingRight: language === 'ar' ? 16 : 0, color: 'var(--color-text-muted)' }}>
                          {(language === 'ar' ? item.rubricsAr : item.rubricsEn).map((rubric, rIdx) => (
                            <li key={rIdx}>{rubric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

          {/* FINAL RECRUITER / HIRING MANAGER ACTION BLOCK */}
          <div style={{
            marginTop: 10,
            padding: 16,
            backgroundColor: hasTakenInterview ? 'var(--color-subtle-green)' : '#F8FAFC',
            border: `1px solid ${hasTakenInterview ? 'var(--color-border-green)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <strong style={{ fontSize: 13, color: isCanceledDueToViolation ? '#991B1B' : 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'القرار النهائي لاعتماد المقابلة والترشيح:' : 'Final Interview Endorsement & Selection Decision:'}
              </strong>
              <div style={{ fontSize: 11, color: isCanceledDueToViolation ? '#B91C1C' : 'var(--color-text-muted)', marginTop: 2 }}>
                {isCanceledDueToViolation
                  ? (language === 'ar' ? 'تم استبعاد المرشح وتجميد إمكانية إصدار أي عرض عمل بسبب رصد مخالفة شروط النزاهة.' : 'Candidate is disqualified and job offers are permanently blocked due to proctoring rule violation.')
                  : hasTakenInterview
                  ? (language === 'ar' ? 'الموافقة على النتيجة تنقل المرشح فورياً إلى مرحلة العرض ومزامنة أوراكل' : 'Endorsing the interview moves the candidate to Offer Stage & triggers Oracle HCM synchronization.')
                  : (language === 'ar' ? 'يتطلب إصدار عرض العمل واختيار المرشح إكمال المقابلة الذكية واعتماد تقييمات الذكاء الاصطناعي أولاً.' : 'Issuing an official employment offer requires the candidate to complete the virtual interview and submit responses first.')}
              </div>
            </div>

            <div>
              {isCanceledDueToViolation ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 6,
                  color: '#991B1B',
                  fontSize: 12,
                  fontWeight: 800
                }}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <span>{language === 'ar' ? '✕ تم حجب العرض — مستبعد (مخالفة الشروط)' : '✕ Offer Blocked — Disqualified (Rule Violated)'}</span>
                </div>
              ) : currentApp?.finalSelected ? (
                <span className="badge green-badge" style={{ fontSize: 12, padding: '6px 14px' }}>
                  ✓ {language === 'ar' ? 'تم اعتماد الاختيار النهائي للمرشح' : 'Final Selection Approved & Synced'}
                </span>
              ) : hasTakenInterview ? (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 800 }}
                  onClick={handleApprove}
                >
                  <Award size={15} />
                  <span>{language === 'ar' ? 'اعتماد الاختيار النهائي وإصدار عرض العمل (أوراكل) ★' : 'Approve Final Selection & Issue Job Offer (Oracle HCM) ★'}</span>
                </button>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 6, color: '#92400E', fontSize: 12, fontWeight: 700 }}>
                  <Lock size={13} />
                  <span>{language === 'ar' ? 'عرض العمل مقفل (المقابلة معلقة)' : 'Offer Locked (Interview Pending)'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '12px 22px',
          backgroundColor: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (!hasTakenInterview) {
                alert(language === 'ar' ? 'لا يمكن تصدير تقرير المقابلة لأن المرشح لم يجرِ المقابلة بعد.' : 'Interview dossier PDF cannot be exported until the candidate completes and submits the interview.');
                return;
              }
              alert(language === 'ar' ? 'تم تصدير ملف المقابلة المعتمد بكامل الأسئلة والإجابات بصيغة PDF.' : 'Official interview audit dossier with all 5 questions and answers exported to PDF pack.');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: hasTakenInterview ? 1 : 0.6,
              cursor: hasTakenInterview ? 'pointer' : 'not-allowed'
            }}
          >
            <Download size={14} />
            <span>
              {hasTakenInterview
                ? (language === 'ar' ? 'تصدير التقرير المعتمد (PDF)' : 'Export Full Interview PDF (All 5 Q&A)')
                : (language === 'ar' ? 'تصدير التقرير (غير متاح — المقابلة معلقة)' : 'Export Full Interview PDF (Interview Pending)')}
            </span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* MODAL: PROCTORING SNAPSHOT ENLARGEMENT PREVIEW */}
      {selectedSnapshotForPreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '2px solid #059669'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={18} color="#10B981" />
                <span style={{ fontSize: 14, fontWeight: 800 }}>
                  {language === 'ar' ? `لقطة كاميرا المراقبة العشوائية (${selectedSnapshotForPreview.timestamp})` : `Proctoring Webcam Snapshot (${selectedSnapshotForPreview.timestamp})`}
                </span>
              </div>
              <button
                onClick={() => setSelectedSnapshotForPreview(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Preview with Telemetry */}
            <div style={{ position: 'relative', backgroundColor: '#020617', textAlign: 'center' }}>
              <img
                src={selectedSnapshotForPreview.imageUrl}
                alt="Enlarged Proctoring Snapshot"
                style={{
                  maxWidth: '100%',
                  maxHeight: 360,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />

              {/* Watermark HUD */}
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span>REC {selectedSnapshotForPreview.timestamp} &bull; {selectedSnapshotForPreview.realTime}</span>
              </div>

              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#34D399',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700
              }}>
                ✓ Face Confidence: {selectedSnapshotForPreview.faceConfidence}% (Nafath ID Verified)
              </div>
            </div>

            {/* Telemetry Details */}
            <div style={{ padding: '18px 22px', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>
                    {language === 'ar' ? 'اتجاه البصر (Gaze Tracking):' : 'Gaze Focus:'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                    {language === 'ar' ? selectedSnapshotForPreview.gazeDirectionAr || selectedSnapshotForPreview.gazeDirection : selectedSnapshotForPreview.gazeDirection}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>
                    {language === 'ar' ? 'الإضاءة والبيئة المحيطة:' : 'Ambient Lighting:'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                    {selectedSnapshotForPreview.lighting}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.5, backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                <strong style={{ color: '#065F46' }}>
                  {language === 'ar' ? 'ملاحظة فحص النزاهة:' : 'Proctoring Audit Summary:'}
                </strong>{' '}
                {language === 'ar' ? selectedSnapshotForPreview.notesAr || selectedSnapshotForPreview.notes : selectedSnapshotForPreview.notes}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedSnapshotForPreview(null)}
              >
                {language === 'ar' ? 'إغلاق المعاينة' : 'Done Reviewing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
