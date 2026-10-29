import React from 'react';
import { CandidateApplication } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import {
  Compass,
  CheckCircle2,
  Video,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck,
  Calendar,
  Building2,
  MapPin,
  Fingerprint,
  Plus,
  Clock
} from 'lucide-react';

interface MyApplicationsViewProps {
  onAttendInterview: (app: CandidateApplication) => void;
  onExploreJobs: () => void;
  onInspectScreening: (app: CandidateApplication) => void;
}

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({
  onAttendInterview,
  onExploreJobs,
  onInspectScreening
}) => {
  const { language } = useLanguage();
  const { applications } = useCandidate();
  const { setActiveNavTab } = useAuthRbac();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Overview Metric Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {language === 'ar' ? 'سجل طلبات التوظيف ومسار المراحل (My Applications & Milestones)' : 'Candidate Job Applications & Milestone Progression'}
            </h3>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              Candidate: Mohammad Al-Zahrani &bull; National ID: 1084920481 &bull; Nafath Verified
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onExploreJobs}>
            <Plus size={14} />
            <span>{language === 'ar' ? 'تقديم على وظيفة جديدة' : 'Apply for New Opening'}</span>
          </button>
        </div>

        {/* Quick Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '16px 20px', backgroundColor: 'var(--color-subtle-green)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total Submitted:</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{applications.length} Requisitions</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>AI Screening Passed:</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent)' }}>100% Qualified</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>AI Voice Interviews:</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-dark)' }}>Ready to Attend</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Security Clearances:</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>Nafath Active</div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {applications.map(app => {
          return (
            <div
              key={app.id}
              className="card"
              style={{
                border: '1px solid var(--color-border)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '14px 20px',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span className="badge outline-badge" style={{ fontWeight: 800, fontSize: 11 }}>
                      Ref: {app.id}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#E8F5E9', color: 'var(--color-primary-dark)', fontSize: 11, fontWeight: 700 }}>
                      Req: {app.requisitionCode}
                    </span>
                    <span className="badge green-badge" style={{ fontSize: 11 }}>
                      {app.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                    {language === 'ar' ? app.jobTitleAr : app.jobTitle}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={13} />
                      <span>{language === 'ar' ? app.departmentAr : app.department}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} />
                      <span>{app.location}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      <span>Submitted: {app.submittedAt}</span>
                    </span>
                  </div>
                </div>

                {/* Screening Score Badge */}
                {app.screeningScore && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                      {app.screeningScore}%
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      AI Match Score
                    </span>
                  </div>
                )}
              </div>

              {/* 4-STAGE MILESTONE STEPPER */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  marginBottom: 16
                }}>
                  {/* Stage 1 */}
                  <div style={{
                    padding: 12,
                    backgroundColor: app.stageIndex >= 1 ? 'var(--color-subtle-green)' : 'var(--color-bg)',
                    border: app.stageIndex >= 1 ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 700, fontSize: 12 }}>
                      <CheckCircle2 size={15} />
                      <span>1. Application &amp; CV Uploaded</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      CV Received &bull; Sent to Recruiter Portal.
                    </p>
                  </div>

                  {/* Stage 2 */}
                  <div style={{
                    padding: 12,
                    backgroundColor: app.cvScannedByRecruiter ? 'var(--color-subtle-green)' : 'var(--color-bg)',
                    border: app.cvScannedByRecruiter ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: app.cvScannedByRecruiter ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: 12 }}>
                      {app.cvScannedByRecruiter ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                      <span>2. HR AI Screening</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {app.cvScannedByRecruiter 
                        ? `${app.screeningScore || 94}% Match &bull; Criteria Validated`
                        : 'Awaiting Recruiter AI Scanning'}
                    </p>
                  </div>

                  {/* Stage 3 */}
                  <div style={{
                    padding: 12,
                    backgroundColor: app.shortlistedByRecruiter ? (app.interviewScore ? 'var(--color-subtle-green)' : '#E8F5E9') : 'var(--color-bg)',
                    border: app.shortlistedByRecruiter ? (app.interviewScore ? '1px solid var(--color-border-green)' : '2px solid var(--color-accent)') : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    opacity: app.shortlistedByRecruiter ? 1 : 0.75
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: app.shortlistedByRecruiter ? 'var(--color-primary-dark)' : 'var(--color-text-muted)', fontWeight: 800, fontSize: 12 }}>
                      {app.interviewScore ? (
                        <CheckCircle2 size={15} color="var(--color-primary)" />
                      ) : (
                        <Video size={15} color={app.shortlistedByRecruiter ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                      )}
                      <span>3. Virtual AI Interview</span>
                    </div>
                    <p style={{ fontSize: 11, color: app.shortlistedByRecruiter ? 'var(--color-primary)' : 'var(--color-text-muted)', marginTop: 4, fontWeight: app.shortlistedByRecruiter ? 600 : 400 }}>
                      {app.interviewScore 
                        ? `Scored ${app.interviewScore}/100 &bull; Submitted to Recruiter`
                        : app.shortlistedByRecruiter 
                          ? 'Approved by HR &bull; Ready to Attend Now →'
                          : 'Locked: Awaiting Recruiter Shortlist Approval'}
                    </p>
                  </div>

                  {/* Stage 4 */}
                  <div style={{
                    padding: 12,
                    backgroundColor: app.finalSelected ? '#E8F5E9' : 'var(--color-bg)',
                    border: app.finalSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    opacity: app.finalSelected ? 1 : 0.75
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: app.finalSelected ? 'var(--color-primary-dark)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: 12 }}>
                      <ShieldCheck size={15} />
                      <span>4. Clearances &amp; Final Offer</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {app.finalSelected
                        ? 'Final Selection Approved &bull; Offer Synced to Oracle'
                        : 'Awaiting Recruiter Final Selection'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                  {app.cvScannedByRecruiter && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => onInspectScreening(app)}
                    >
                      <Sparkles size={14} />
                      <span>{language === 'ar' ? 'تقرير الفرز الآلي' : 'AI Screening Report'}</span>
                    </button>
                  )}

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveNavTab('nafath_verification')}
                  >
                    <Fingerprint size={14} />
                    <span>{language === 'ar' ? 'توثيق نفاذ' : 'Nafath ID'}</span>
                  </button>

                  {app.shortlistedByRecruiter ? (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onAttendInterview(app)}
                      style={{ fontWeight: 700 }}
                    >
                      <Video size={14} />
                      <span>
                        {app.interviewScore
                          ? (language === 'ar' ? 'مراجعة إجابات المقابلة' : 'Review Interview Responses')
                          : (language === 'ar' ? 'حضور المقابلة الذكية التفاعلية (صوت ونص) ←' : 'Attend Virtual AI Interview (Voice & Text) →')}
                      </span>
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        alert(language === 'ar'
                          ? 'طلبك وسيرتك الذاتية قيد المراجعة لدى فريق استقطاب المواهب (سارة الحربي). ستتاح لك المقابلة الذكية فور قيام مسؤولة التوظيف بفرز السيرة واعتماد القائمة القصيرة.'
                          : 'Your CV is currently awaiting AI scanning & shortlist approval from Recruiter Sarah Al-Harbi. You can switch to the Recruiter Portal at the top to scan the CV and approve the shortlist.');
                      }}
                      style={{ color: '#856404', backgroundColor: '#FFF3CD', borderColor: '#FFEEBA' }}
                    >
                      <Clock size={14} />
                      <span>{language === 'ar' ? 'بانتظار الفرز والاعتماد من التوظيف' : 'Awaiting Recruiter Shortlist Approval'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
