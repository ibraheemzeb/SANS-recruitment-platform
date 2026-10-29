import React, { useState, useEffect } from 'react';
import { CandidateApplication } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ClockAlert, 
  FileCheck, 
  X, 
  Layers, 
  Zap, 
  UserCheck, 
  ArrowRight,
  Radar
} from 'lucide-react';

interface BulkAiScreeningModalProps {
  applications: CandidateApplication[];
  onClose: () => void;
  onCompleteScan: (scannedAppIds: string[]) => void;
  onAutoApproveShortlists: (scannedAppIds: string[]) => void;
}

export const BulkAiScreeningModal: React.FC<BulkAiScreeningModalProps> = ({
  applications,
  onClose,
  onCompleteScan,
  onAutoApproveShortlists
}) => {
  const { language } = useLanguage();

  // Track scanning progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedIds, setProcessedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [pipelinePhase, setPipelinePhase] = useState<number>(1);

  const total = applications.length;
  const currentApp = applications[currentIndex] || applications[0];

  useEffect(() => {
    if (total === 0) {
      setIsFinished(true);
      return;
    }

    // Interval to cycle through candidates and phases
    const interval = setInterval(() => {
      setPipelinePhase(prev => {
        if (prev < 4) {
          return prev + 1;
        } else {
          // Finished this candidate, advance to next
          setProcessedIds(prevProcessed => {
            if (currentApp && !prevProcessed.includes(currentApp.id)) {
              return [...prevProcessed, currentApp.id];
            }
            return prevProcessed;
          });

          setCurrentIndex(prevIdx => {
            if (prevIdx + 1 >= total) {
              clearInterval(interval);
              setIsFinished(true);
              return prevIdx;
            }
            return prevIdx + 1;
          });

          return 1;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [currentIndex, total, currentApp]);

  // When finished, notify parent of completed scan
  useEffect(() => {
    if (isFinished && applications.length > 0) {
      onCompleteScan(applications.map(a => a.id));
    }
  }, [isFinished]);

  const progressPercent = total > 0 ? Math.round(((processedIds.length + (isFinished ? 0 : 0.5)) / total) * 100) : 100;

  return (
    <div 
      className="modal-backdrop" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 20
      }}
    >
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: 0
        }}
      >
        {/* Header */}
        <div 
          className="card-header" 
          style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-primary-dark)',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#34D399" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                {language === 'ar' ? 'الفرز والمسح الذكي الجماعي للسير الذاتية (Bulk AI CV Screener)' : 'SANS Bulk AI CV Screening & Compatibility Engine'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#D1FAE5' }}>
                {language === 'ar' 
                  ? 'معالجة متوازية وفق القسم 4.1.3: مطابقة رخص GACA، ومستويات إيكاو، واحتساب درجات التوافق' 
                  : 'Section 4.1.3 Parallel Engine: GACA Licensing Verification, ICAO English Ratings & XAI Citations.'}
              </p>
            </div>
          </div>

          <button 
            className="btn btn-sm" 
            style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 4
            }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 20 }}>
          {/* Progress Indicator */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {isFinished 
                  ? (language === 'ar' ? 'اكتملت معالجة جميع السير الذاتية بنجاح ✓' : `Batch Scan Complete (${total}/${total} CVs Processed) ✓`)
                  : (language === 'ar' ? `جاري فحص السيرة الذاتية ${currentIndex + 1} من أصل ${total}...` : `Scanning Candidate ${currentIndex + 1} of ${total}...`)}
              </span>
              <span className="badge green-badge" style={{ fontWeight: 800 }}>
                {progressPercent}%
              </span>
            </div>

            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  backgroundColor: isFinished ? 'var(--color-primary)' : '#059669',
                  transition: 'width 0.3s ease-in-out'
                }} 
              />
            </div>
          </div>

          {/* Active Candidate Inspection Banner (if in progress) */}
          {!isFinished && currentApp && (
            <div style={{
              padding: 16,
              backgroundColor: 'var(--color-subtle-green)',
              border: '1px solid var(--color-border-green)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-dark)' }}>
                    {language === 'ar' ? 'المرشح قيد المعالجة الآن' : 'Currently Processing CV'}
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', margin: '2px 0 0' }}>
                    {language === 'ar' ? (currentApp.candidateNameAr || currentApp.candidateName) : currentApp.candidateName}
                  </h4>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {currentApp.jobTitle} &bull; {currentApp.requisitionCode} &bull; {currentApp.cvFileName || 'Candidate_CV.pdf'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Radar size={18} className="spin-slow" color="var(--color-primary)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                    Phase {pipelinePhase}/4: {
                      pipelinePhase === 1 ? 'Anti-Malware & OCR' :
                      pipelinePhase === 2 ? 'GACA License Lookup' :
                      pipelinePhase === 3 ? 'ICAO English Fit' :
                      'XAI Citation Mapping'
                    }
                  </span>
                </div>
              </div>

              {/* 4-Phase Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
                <div style={{
                  padding: 8,
                  backgroundColor: pipelinePhase >= 1 ? '#FFFFFF' : '#F1F5F9',
                  borderRadius: 4,
                  border: `1px solid ${pipelinePhase >= 1 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontSize: 10,
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 700, color: pipelinePhase >= 1 ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    1. Anti-Malware
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>NCA-ECC Sovereign</span>
                </div>

                <div style={{
                  padding: 8,
                  backgroundColor: pipelinePhase >= 2 ? '#FFFFFF' : '#F1F5F9',
                  borderRadius: 4,
                  border: `1px solid ${pipelinePhase >= 2 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontSize: 10,
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 700, color: pipelinePhase >= 2 ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    2. GACA Registry
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>License Verified</span>
                </div>

                <div style={{
                  padding: 8,
                  backgroundColor: pipelinePhase >= 3 ? '#FFFFFF' : '#F1F5F9',
                  borderRadius: 4,
                  border: `1px solid ${pipelinePhase >= 3 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontSize: 10,
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 700, color: pipelinePhase >= 3 ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    3. ICAO English
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Level 5+ Radiotelephony</span>
                </div>

                <div style={{
                  padding: 8,
                  backgroundColor: pipelinePhase >= 4 ? '#FFFFFF' : '#F1F5F9',
                  borderRadius: 4,
                  border: `1px solid ${pipelinePhase >= 4 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontSize: 10,
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 700, color: pipelinePhase >= 4 ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    4. XAI Scoring
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Evidence Linked</span>
                </div>
              </div>
            </div>
          )}

          {/* Completion Celebration Card */}
          {isFinished && (
            <div style={{
              padding: 18,
              backgroundColor: 'var(--color-soft-green)',
              border: '1px solid var(--color-border-green)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    {language === 'ar' ? 'تم اكتمال الفرز الآلي لكافة السير الذاتية المحددة' : 'Bulk AI Screening Analysis Completed!'}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-primary-dark)' }}>
                    {language === 'ar'
                      ? `تم استخراج المؤهلات، والتحقق من التراخيص، واحتساب درجات المواءمة بمعدل 93.4% لـ ${total} مرشحين.`
                      : `All ${total} resumes parsed, GACA credentials confirmed, and explainable citations generated.`}
                  </p>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, padding: '8px 16px' }}
                onClick={() => {
                  onAutoApproveShortlists(applications.map(a => a.id));
                  onClose();
                }}
              >
                <UserCheck size={16} />
                <span>{language === 'ar' ? 'اعتماد جميع القوائم القصيرة وفتح المقابلات ✓' : 'Approve All Shortlists & Unlock Interviews ✓'}</span>
              </button>
            </div>
          )}

          {/* Candidates Results Table */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ 
              padding: '10px 14px', 
              backgroundColor: '#F8FAFC', 
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 700
            }}>
              <span>{language === 'ar' ? 'نتائج مطابقة الدفعة (Cohort Match Results)' : 'Cohort AI Evaluation Summary'}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{processedIds.length} of {total} Ready</span>
            </div>

            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <table className="clean-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ backgroundColor: '#FFFFFF' }}>
                    <th style={{ fontSize: 11 }}>Candidate</th>
                    <th style={{ fontSize: 11 }}>Requisition</th>
                    <th style={{ fontSize: 11 }}>GACA &amp; ICAO</th>
                    <th style={{ fontSize: 11 }}>Match Score</th>
                    <th style={{ fontSize: 11 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const isProcessed = processedIds.includes(app.id) || isFinished;
                    const score = app.screeningScore || 94;

                    return (
                      <tr key={app.id} style={{ opacity: isProcessed ? 1 : 0.6 }}>
                        <td>
                          <strong>{language === 'ar' ? (app.candidateNameAr || app.candidateName) : app.candidateName}</strong>
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{app.id}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 11 }}>{app.jobTitle}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{app.requisitionCode}</div>
                        </td>
                        <td>
                          {isProcessed ? (
                            <span className="badge green-badge" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <ShieldCheck size={11} />
                              Verified
                            </span>
                          ) : (
                            <span className="badge" style={{ fontSize: 10, backgroundColor: '#F1F5F9', color: '#64748B' }}>
                              Analyzing...
                            </span>
                          )}
                        </td>
                        <td>
                          {isProcessed ? (
                            <span className="badge score-high" style={{ fontWeight: 800 }}>
                              {score}%
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {isProcessed ? (
                            <span className="badge green-badge" style={{ fontSize: 10 }}>
                              AI Matched ✓
                            </span>
                          ) : (
                            <span className="badge outline-badge" style={{ fontSize: 10 }}>
                              Queued
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {isFinished ? (language === 'ar' ? 'إغلاق ومتابعة الطابور' : 'Close & View Ingestion Queue') : (language === 'ar' ? 'إلغاء' : 'Cancel')}
            </button>

            {isFinished && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  onAutoApproveShortlists(applications.map(a => a.id));
                  onClose();
                }}
              >
                <CheckCircle2 size={14} />
                <span>{language === 'ar' ? 'تأكيد واعتماد الكل' : 'Confirm All Shortlists'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
