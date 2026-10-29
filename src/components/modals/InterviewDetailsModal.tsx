import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
  ListFilter
} from 'lucide-react';

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
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);
  const [selectedQuestionTab, setSelectedQuestionTab] = useState<number | 'ALL'>('ALL');

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
  ) || candidates[0];

  const candidateName = currentApp?.candidateName 
    ? (language === 'ar' ? (currentApp.candidateNameAr || candidateProfile.nameAr) : currentApp.candidateName)
    : (language === 'ar' ? candidateProfile.nameAr : candidateProfile.name);

  // All interview answers for this candidate
  const allAnswers = getCandidateAllInterviewAnswers(currentApp, candidateProfile);

  const interviewScore = currentApp?.interviewScore || candidateProfile.virtualInterviewScore || 94;
  const isInterviewDone = !!(currentApp?.interviewScore || candidateProfile.interviewCompleted);

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
                const scoreBadge = app.interviewScore ? `${app.interviewScore}/100` : (app.shortlistedByRecruiter ? 'Ready' : 'Pending');
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  {candidateName}
                </h3>
                <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#334155', fontSize: 11 }}>
                  {currentApp?.id}
                </span>
                {currentApp?.finalSelected && (
                  <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 700 }}>
                    ★ Offer Approved
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
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {interviewScore} <span style={{ fontSize: 12, fontWeight: 500 }}>/ 100</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'الأسئلة المجابة' : 'Questions Answered'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                  5 / 5 Complete
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

                    {/* Verbatim Transcript */}
                    <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                          {language === 'ar' ? 'التفريغ النصي الحرفي لإجابة المرشح (Verbatim Transcript):' : 'Candidate Verbatim Speech Transcript:'}
                        </span>
                        <span className="badge green-badge" style={{ fontSize: 10 }}>
                          {item.icaoCompliance}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-main)', margin: 0, fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 4, border: '1px solid var(--color-border-subtle)' }}>
                        &ldquo;{aText}&rdquo;
                      </p>
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

          {/* FINAL RECRUITER / HIRING MANAGER ACTION BLOCK */}
          <div style={{
            marginTop: 10,
            padding: 16,
            backgroundColor: 'var(--color-subtle-green)',
            border: '1px solid var(--color-border-green)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <strong style={{ fontSize: 13, color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'القرار النهائي لاعتماد المقابلة والترشيح:' : 'Final Interview Endorsement & Selection Decision:'}
              </strong>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {language === 'ar' ? 'الموافقة على النتيجة تنقل المرشح فورياً إلى مرحلة العرض ومزامنة أوراكل' : 'Endorsing the interview moves the candidate to Offer Stage & triggers Oracle HCM synchronization.'}
              </div>
            </div>

            <div>
              {currentApp?.finalSelected ? (
                <span className="badge green-badge" style={{ fontSize: 12, padding: '6px 14px' }}>
                  ✓ {language === 'ar' ? 'تم اعتماد الاختيار النهائي للمرشح' : 'Final Selection Approved & Synced'}
                </span>
              ) : isInterviewDone ? (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 800 }}
                  onClick={handleApprove}
                >
                  <Award size={15} />
                  <span>{language === 'ar' ? 'اعتماد الاختيار النهائي وإصدار عرض العمل (أوراكل) ★' : 'Approve Final Selection & Issue Job Offer (Oracle HCM) ★'}</span>
                </button>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Awaiting candidate submission
                </span>
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
            onClick={() => alert(language === 'ar' ? 'تم تصدير ملف المقابلة المعتمد بكامل الأسئلة والإجابات بصيغة PDF.' : 'Official interview audit dossier with all 5 questions and answers exported to PDF pack.')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} />
            <span>{language === 'ar' ? 'تصدير التقرير المعتمد (PDF)' : 'Export Full Interview PDF (All 5 Q&A)'}</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
