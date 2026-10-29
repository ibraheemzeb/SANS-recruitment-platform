import React, { useState, useEffect } from 'react';
import { CandidateApplication } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, CheckCircle2, ShieldCheck, Video, ArrowRight, Activity, X } from 'lucide-react';

interface AiScreeningSimulationModalProps {
  application: CandidateApplication;
  onClose: () => void;
  onProceedToInterview?: (app: CandidateApplication) => void;
  isRecruiterMode?: boolean;
  onApproveShortlist?: (app: CandidateApplication) => void;
}

export const AiScreeningSimulationModal: React.FC<AiScreeningSimulationModalProps> = ({
  application,
  onClose,
  onProceedToInterview,
  isRecruiterMode = false,
  onApproveShortlist
}) => {
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    {
      titleEn: 'Optical Character Recognition (OCR) & Parsing',
      titleAr: 'المسح الضوئي واستخلاص بيانات السيرة الذاتية',
      descEn: 'Extracting aeronautical credentials, radar endorsements, and flight hours from CV.',
      descAr: 'استخراج الأهلية الملاحية وساعات العمل الراداري من ملف السيرة الذاتية.'
    },
    {
      titleEn: 'Mandatory GACA Licensing Verification',
      titleAr: 'التحقق الإلزامي من رخص وهيئة الطيران المدني (GACA)',
      descEn: 'Querying GACA National Aviation Registry for active Air Traffic Controller rating.',
      descAr: 'مطابقة رقم الرخصة مع السجل الوطني الملاحي والتأكد من سريان الأهلية.'
    },
    {
      titleEn: 'ICAO English & Phraseology Fit',
      titleAr: 'تقييم كفاءة مصطلحات الطيران الدولي (ICAO)',
      descEn: 'Assessing Level 5 operational fluency and radio telephony discipline.',
      descAr: 'قياس الطلاقة التشغيلية المستوى الخامس والمصطلحات المعتمدة.'
    },
    {
      titleEn: 'Saudi PDPL & Sovereign Security Audit',
      titleAr: 'تدقيق نظام حماية البيانات الشخصية والأمن السيبراني',
      descEn: 'Validating zero data egress outside KSA cloud boundary.',
      descAr: 'التأكد من حفظ وتحليل البيانات بالكامل داخل السحابة الوطنية.'
    },
    {
      titleEn: 'Composite AI Scoring & Requisition Match',
      titleAr: 'حساب درجة المطابقة والتوصية الآلية النهائية',
      descEn: 'Calculating weighted compatibility matrix against requisition benchmarks.',
      descAr: 'احتساب التوافق الإجمالي وإعداد التوصية للمقابلة الذكية.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsCompleted(true);
          clearInterval(timer);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 54, 34, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div className="card" style={{
        maxWidth: 700,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        border: '2px solid var(--color-accent)'
      }}>
        {/* Header */}
        <div className="card-header" style={{
          backgroundColor: 'var(--color-primary-dark)',
          color: '#fff',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, margin: 0, color: '#fff', fontWeight: 700 }}>
                {language === 'ar' ? 'نظام الفرز الذكي الفوري (SANS AI Screening Engine)' : 'Real-Time AI Candidate Screening Pipeline'}
              </h3>
              <span style={{ fontSize: 11, color: '#C8E6C9' }}>
                Ref: {application.id} &bull; {language === 'ar' ? application.jobTitleAr : application.jobTitle}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Progress Banner */}
          <div style={{
            backgroundColor: 'var(--color-subtle-green)',
            border: '1px solid var(--color-border-green)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ color: 'var(--color-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={16} />
                <span>
                  {isCompleted
                    ? (language === 'ar' ? 'اكتمل الفرز الذكي بنجاح (100%)' : 'AI Screening Complete — Candidate Qualified')
                    : (language === 'ar' ? 'جاري الفرز والتحليل الآلي...' : 'AI Algorithm Running Candidate Evaluation...')}
                </span>
              </strong>
              <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>
                {Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100))}%
              </span>
            </div>

            <div style={{ height: 8, backgroundColor: 'var(--color-border-green)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100))}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {steps.map((step, idx) => {
              const isPast = isCompleted || idx < currentStep;
              const isCurrent = !isCompleted && idx === currentStep;

              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCurrent ? '#E8F5E9' : isPast ? 'var(--color-bg)' : '#FAFBFB',
                  border: isCurrent ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                  opacity: idx > currentStep && !isCompleted ? 0.45 : 1
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPast ? 'var(--color-primary)' : isCurrent ? 'var(--color-accent)' : 'var(--color-border)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: isCurrent ? 'var(--color-primary-dark)' : 'var(--color-text-main)' }}>
                      {language === 'ar' ? step.titleAr : step.titleEn}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {language === 'ar' ? step.descAr : step.descEn}
                    </div>
                  </div>

                  <div>
                    {isPast && (
                      <span className="badge green-badge" style={{ fontSize: 11 }}>
                        &#10003; {language === 'ar' ? 'تم الفحص' : 'Validated'}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="badge" style={{ backgroundColor: '#FFF3CD', color: '#856404', fontSize: 11 }}>
                        {language === 'ar' ? 'جاري الفحص...' : 'Analyzing...'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FINAL RESULTS DOSSIER */}
          {isCompleted && (
            <div style={{
              backgroundColor: '#F4FBF7',
              border: '2px solid var(--color-border-green)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span className="badge green-badge" style={{ fontSize: 12, padding: '4px 10px' }}>
                    {language === 'ar' ? 'اجتاز الفرز الآلي بنجاح — مؤهل للمقابلة' : 'AI Screening Passed — Top Tier Candidate'}
                  </span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 4 }}>
                    {language === 'ar' ? 'بطاقة نتائج الفرز الآلي' : 'Candidate AI Screening Assessment Dossier'}
                  </h4>
                </div>
                <div style={{ textAlign: 'center', padding: '6px 14px', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', color: '#fff' }}>
                  <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
                    {application.screeningScore || 95}%
                  </div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {language === 'ar' ? 'درجة الملاءمة' : 'Match Score'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12, marginBottom: 12 }}>
                <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Mandatory GACA Criteria:</div>
                  <strong style={{ color: 'var(--color-primary)' }}>100% Met (5 of 5)</strong>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Radar Flight Hours:</div>
                  <strong>8+ Years Experience (Riyadh ACC)</strong>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>ICAO English Level:</div>
                  <strong style={{ color: 'var(--color-primary)' }}>Level 5 (Operational Extended)</strong>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--color-text-main)', borderTop: '1px dashed var(--color-border-green)', paddingTop: 10 }}>
                <strong>{language === 'ar' ? 'توصية الذكاء الاصطناعي:' : 'AI Screening Recommendation:'}</strong>{' '}
                {language === 'ar' 
                  ? 'تم التحقق من مطابقة السيرة الذاتية لمتطلبات قطاع الملاحة الجوية بنسبة 95%. تم فتح مرحلة المقابلة الذكية التفاعلية (صوت ونص).'
                  : 'Candidate satisfies 100% of mandatory radar requirements with superior experience. Virtual Voice & Text Interview stage unlocked.'}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-secondary" onClick={onClose}>
              <span>{language === 'ar' ? 'إغلاق' : 'Close'}</span>
            </button>

            {isRecruiterMode ? (
              <button
                className="btn btn-primary"
                disabled={!isCompleted}
                onClick={() => {
                  if (onApproveShortlist) onApproveShortlist(application);
                  onClose();
                }}
                style={{ padding: '10px 22px', fontWeight: 800 }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {language === 'ar' ? 'اعتماد القائمة القصيرة ودعوة المرشح للمقابلة ←' : 'Approve Shortlist & Unlock Interview →'}
                </span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!isCompleted}
                onClick={() => {
                  if (onProceedToInterview) onProceedToInterview(application);
                }}
                style={{ padding: '10px 22px', fontWeight: 800 }}
              >
                <Video size={16} />
                <span>
                  {language === 'ar' ? 'بدء المقابلة الذكية (صوت ونص) الآن ←' : 'Start Interactive AI Interview Now →'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
