import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { JobCatalog } from '../../components/candidate/JobCatalog';
import { MyApplicationsView } from '../../components/candidate/MyApplicationsView';
import { CandidateInterviewRoom } from '../../components/candidate/CandidateInterviewRoom';
import { ApplyJobModal } from '../../components/candidate/ApplyJobModal';
import { AiScreeningSimulationModal } from '../../components/candidate/AiScreeningSimulationModal';
import { CertificateModal } from '../../components/modals/CertificateModal';
import { JobRequisition, CandidateApplication } from '../../types';
import {
  Compass,
  Fingerprint,
  Video,
  FileBadge,
  CheckCircle2,
  ShieldCheck,
  Award,
  Upload,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const CandidateView: React.FC = () => {
  const { candidates, applications, setActiveInterviewApp } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab, setActiveNavTab } = useAuthRbac();

  // Modals state
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobRequisition | null>(null);
  const [activeScreeningApp, setActiveScreeningApp] = useState<CandidateApplication | null>(null);
  const [selectedCertForModal, setSelectedCertForModal] = useState<string | null>(null);

  // Nafath interactive simulation state
  const [nafathVerified, setNafathVerified] = useState(true);
  const [nafathSimulating, setNafathSimulating] = useState(false);
  const [nafathChallengeNumber, setNafathChallengeNumber] = useState('42');

  // Candidate reference
  const candidate = candidates[0];

  const handleLaunchApply = (job: JobRequisition) => {
    setSelectedJobForApply(job);
  };

  const handleApplicationSubmitted = (_newApp: CandidateApplication) => {
    // Candidate simply submits CV. CV scanning belongs on recruiter side.
  };

  const handleAttendInterview = (app: CandidateApplication) => {
    setActiveInterviewApp(app);
    setActiveNavTab('virtual_interview_room');
  };

  const handleProceedFromScreeningToInterview = (app: CandidateApplication) => {
    setActiveScreeningApp(null);
    setActiveInterviewApp(app);
    setActiveNavTab('virtual_interview_room');
  };

  const handleTriggerNafathChallenge = () => {
    setNafathSimulating(true);
    const randomCode = String(Math.floor(10 + Math.random() * 89));
    setNafathChallengeNumber(randomCode);

    setTimeout(() => {
      setNafathVerified(true);
      setNafathSimulating(false);
    }, 2500);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'بوابة المتقدم للخدمة الذاتية (SANS Candidate Experience)' : 'Candidate Self-Service Experience Portal'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'استكشف الوظائف الملاحية الشاغرة، قدّم طلبك للخضوع للفرز الآلي الفوري، واحضر المقابلة الذكية التفاعلية بالصوت أو النص'
              : 'Explore open air navigation roles, undergo real-time automated AI screening, and attend your interactive voice/text interview.'}
          </p>
        </div>

        {/* Quick Tab Switcher Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeNavTab === 'candidate_status' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveNavTab('candidate_status')}
          >
            <Compass size={14} />
            <span>{language === 'ar' ? 'طلباتي' : 'My Applications'} ({applications.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeNavTab === 'explore_jobs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveNavTab('explore_jobs')}
          >
            <Sparkles size={14} />
            <span>{language === 'ar' ? 'استعراض الوظائف' : 'Browse Open Jobs'}</span>
          </button>
          <button
            className={`btn btn-sm ${activeNavTab === 'virtual_interview_room' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveNavTab('virtual_interview_room')}
          >
            <Video size={14} />
            <span>{language === 'ar' ? 'غرفة المقابلة الذكية' : 'AI Interview Room'}</span>
          </button>
        </div>
      </div>

      {/* 1. MY APPLICATIONS & STATUS TRACKER */}
      {(activeNavTab === 'candidate_status' || !activeNavTab) && (
        <MyApplicationsView
          onAttendInterview={handleAttendInterview}
          onExploreJobs={() => setActiveNavTab('explore_jobs')}
          onInspectScreening={(app) => setActiveScreeningApp(app)}
        />
      )}

      {/* 2. EXPLORE JOBS & APPLY */}
      {activeNavTab === 'explore_jobs' && (
        <JobCatalog
          onApplyJob={handleLaunchApply}
        />
      )}

      {/* 3. INTERACTIVE AI VOICE & TEXT INTERVIEW ROOM */}
      {activeNavTab === 'virtual_interview_room' && (
        <CandidateInterviewRoom
          onCompleted={() => setActiveNavTab('candidate_status')}
        />
      )}

      {/* 4. NAFATH DIGITAL IDENTITY VERIFICATION */}
      {activeNavTab === 'nafath_verification' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'التوثيق الرقمي المعتمد عبر تطبيق نفاذ الوطني (Nafath Single Sign-On)' : 'National Digital Identity Verification (Nafath SSO)'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Compliant with Saudi National Cybersecurity Authority (NCA) &amp; SDAIA Regulations
              </span>
            </div>
            <span className="badge green-badge">Official KSA Gateway</span>
          </div>

          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--color-soft-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid var(--color-border-green)'
            }}>
              <Fingerprint size={44} color="var(--color-primary)" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              {nafathVerified 
                ? (language === 'ar' ? 'الهوية الوطنية الرقمية: موثقة ونشطة' : 'National Digital Identity: Verified & Active')
                : (language === 'ar' ? 'في انتظار استكمال التوثيق عبر تطبيق نفاذ' : 'Pending Nafath App Biometric Authorization')}
            </h3>

            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 480, margin: '8px auto 20px' }}>
              {language === 'ar'
                ? 'تم ربط بيانات المرشح بالسجل المدني المركزي للتحقق من الأهلية الأمنية وتفويض معالجة البيانات لنظام التوظيف الملاحي.'
                : 'Candidate identity confirmed through biometric and OTP token exchange in compliance with Saudi NCA ECC standards.'}
            </p>

            {/* Nafath Challenge Box */}
            <div style={{
              maxWidth: 380,
              margin: '0 auto 24px',
              padding: 16,
              backgroundColor: 'var(--color-subtle-green)',
              border: '1.5px solid var(--color-border-green)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
                <Smartphone size={16} />
                <span>{language === 'ar' ? 'رمز التأكيد في تطبيق نفاذ:' : 'Nafath Mobile App Verification Number:'}</span>
              </div>

              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-primary-dark)', letterSpacing: 4, fontFamily: 'monospace' }}>
                {nafathChallengeNumber}
              </div>

              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
                {language === 'ar'
                  ? 'افتح تطبيق نفاذ على هاتفك المحمول واختر الرقم أعلاه للمصادقة الحيوية.'
                  : 'Open Nafath app on your smartphone and select this number to authenticate.'}
              </p>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleTriggerNafathChallenge}
                disabled={nafathSimulating}
                style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={13} className={nafathSimulating ? 'animate-spin' : ''} />
                <span>
                  {nafathSimulating
                    ? (language === 'ar' ? 'جاري الاتصال بنفاذ...' : 'Communicating with Nafath Gateway...')
                    : (language === 'ar' ? 'محاكاة تأكيد التوثيق في نفاذ' : 'Simulate Nafath App Approval')}
                </span>
              </button>
            </div>

            {/* Cryptographic metadata */}
            <div style={{
              display: 'inline-block',
              textAlign: 'left',
              backgroundColor: 'var(--color-bg)',
              padding: '14px 20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              lineHeight: 1.8
            }}>
              <div><strong>National ID:</strong> {candidate.nationalId} (Mohammad Al-Zahrani)</div>
              <div><strong>Token Ref:</strong> {candidate.clearances.nafath.token}</div>
              <div><strong>Verification Time:</strong> {candidate.clearances.nafath.date}</div>
              <div><strong>Cryptographic Seal:</strong> <span className="badge green-badge">SHA-256 Validated</span></div>
              <div><strong>Security Status:</strong> <span className="badge green-badge">NCA-ECC-2-1 Compliant</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MY DOCUMENTS & AVIATION CREDENTIALS */}
      {activeNavTab === 'my_documents' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'الوثائق والتراخيص الملاحية المرفوعة' : 'Uploaded Licensing & Aviation Credentials'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Synchronized with General Authority of Civil Aviation (GACA)
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => alert(language === 'ar' ? 'تم فتح نافذة تحميل وثيقة جديدة' : 'Upload dialog initialized!')}
            >
              <Upload size={14} />
              <span>{language === 'ar' ? 'رفع وثيقة أو ترخيص جديد' : 'Upload New Credential'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
            {candidate.certifications.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-subtle-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border-green)'
                  }}>
                    <Award size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--color-primary-dark)' }}>{cert}</strong>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Verified by GACA Electronic Registry API &bull; Valid through 2027
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge green-badge">&#10003; Active &amp; Valid</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedCertForModal(cert)}
                  >
                    {language === 'ar' ? 'عرض الوثيقة' : 'View'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION SUBMISSION */}
      {selectedJobForApply && (
        <ApplyJobModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSubmitted={handleApplicationSubmitted}
        />
      )}

      {/* MODAL: ANIMATED AI SCREENING SIMULATION */}
      {activeScreeningApp && (
        <AiScreeningSimulationModal
          application={activeScreeningApp}
          onClose={() => setActiveScreeningApp(null)}
          onProceedToInterview={handleProceedFromScreeningToInterview}
        />
      )}

      {/* MODAL: OFFICIAL AVIATION CERTIFICATE VIEWER */}
      {selectedCertForModal && (
        <CertificateModal
          certificateTitle={selectedCertForModal}
          candidateName={candidate.name}
          candidateNameAr={candidate.nameAr}
          nationalId={candidate.nationalId}
          onClose={() => setSelectedCertForModal(null)}
        />
      )}
    </div>
  );
};
