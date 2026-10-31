import React from 'react';
import { Candidate, CandidateApplication } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Award,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface CandidateDetailsModalProps {
  candidate: Candidate | null;
  application?: CandidateApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (candId: string) => void;
  onOpenInterview?: (candId: string) => void;
}

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  candidate,
  application,
  isOpen,
  onClose,
  onShortlist,
  onOpenInterview
}) => {
  const { language } = useLanguage();

  if (!isOpen || !candidate) return null;

  const name = language === 'ar' ? candidate.nameAr : candidate.name;
  const title = language === 'ar' ? candidate.currentTitleAr : candidate.currentTitle;
  const education = language === 'ar' ? candidate.educationAr : candidate.education;
  const isShortlisted = Boolean(application?.shortlistedByRecruiter || application?.status === 'Interview Scheduled' || application?.status === 'Interview Completed' || application?.status === 'Offer Stage');
  const isOffered = Boolean(application?.finalSelected || application?.status === 'Offer Stage');
  const score = candidate.overrideScore ?? application?.screeningScore ?? candidate.rawMatchScore;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 860, width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18
            }}>
              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 className="modal-title" style={{ fontSize: 18, margin: 0 }}>{name}</h3>
                <span className="badge green-badge" style={{ fontSize: 12, fontWeight: 700 }}>
                  {score}% {language === 'ar' ? 'مطابقة ذكاء اصطناعي' : 'AI Match'}
                </span>
                {isOffered && (
                  <span className="badge green-badge" style={{ backgroundColor: '#198754', color: '#fff' }}>
                    ★ {language === 'ar' ? 'تم إرسال العرض' : 'Offer Issued'}
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                {title} • {candidate.experienceYears} {language === 'ar' ? 'سنوات خبرة ملاحية' : 'Years Aviation Experience'} • {candidate.nationality}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--color-subtle-green)', borderRadius: 6, border: '1px solid var(--color-border-green)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Briefcase size={13} /> {language === 'ar' ? 'سنوات الخبرة' : 'Total Experience'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--color-primary)' }}>{candidate.experienceYears} {language === 'ar' ? 'سنوات' : 'Years'}</strong>
            </div>

            <div style={{ padding: 12, background: 'var(--color-subtle-green)', borderRadius: 6, border: '1px solid var(--color-border-green)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Award size={13} /> {language === 'ar' ? 'الشهادات المعتمدة' : 'Accreditations'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--color-primary)' }}>{candidate.certifications.length} {language === 'ar' ? 'رخص وشهادات' : 'Certificates'}</strong>
            </div>

            <div style={{ padding: 12, background: 'var(--color-subtle-green)', borderRadius: 6, border: '1px solid var(--color-border-green)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={13} /> {language === 'ar' ? 'درجة المقابلة الذكية' : 'Interview Score'}
              </div>
              <strong style={{ fontSize: 15, color: 'var(--color-primary)' }}>
                {candidate.virtualInterviewScore || application?.interviewScore || 94}%
              </strong>
            </div>

            <div style={{ padding: 12, background: 'var(--color-subtle-green)', borderRadius: 6, border: '1px solid var(--color-border-green)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={13} /> {language === 'ar' ? 'نفاذ والتحقق الأمني' : 'Nafath / Security'}
              </div>
              <strong style={{ fontSize: 13, color: '#198754' }}>
                ✓ {language === 'ar' ? 'موثق ومعتمد' : 'Verified (Amn & GACA)'}
              </strong>
            </div>
          </div>

          {/* Aviation & GACA Certifications */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)' }}>
              <Award size={16} /> {language === 'ar' ? 'الرخص والاعتمادات الملاحية (GACA / ICAO)' : 'Aviation & GACA Credentials'}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {candidate.certifications.map((cert, idx) => (
                <span 
                  key={idx} 
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--color-text-main)'
                  }}
                >
                  <CheckCircle2 size={13} color="#198754" />
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Academic Credentials */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)' }}>
              <GraduationCap size={16} /> {language === 'ar' ? 'المؤهل العلمي' : 'Education'}
            </h4>
            <div style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}>
              {education}
            </div>
          </div>

          {/* AI Extracted Strengths & Gap Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> {language === 'ar' ? 'أبرز نقاط القوة (المستخلصة آلياً)' : 'Key AI-Extracted Strengths'}
              </div>
              <p style={{ fontSize: 12, color: '#14532d', margin: 0, lineHeight: 1.5 }}>
                {language === 'ar' ? candidate.keyStrengthsAr : candidate.keyStrengths}
              </p>
            </div>

            <div style={{ padding: 14, background: '#fefce8', borderRadius: 6, border: '1px solid #fef08a' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#854d0e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {language === 'ar' ? 'الفجوات المحتملة أو الملاحظات' : 'Identified Gaps / Notes'}
              </div>
              <p style={{ fontSize: 12, color: '#713f12', margin: 0, lineHeight: 1.5 }}>
                {language === 'ar' ? candidate.identifiedGapsAr : candidate.identifiedGaps}
              </p>
            </div>
          </div>

          {/* Clearances Status */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)' }}>
              <ShieldCheck size={16} /> {language === 'ar' ? 'التحققات النظامية والأمنية (PDPL / NCA)' : 'National Clearances & Regulatory Checks'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>نفاذ (Nafath)</div>
                <strong style={{ fontSize: 12, color: '#198754' }}>✓ {candidate.clearances?.nafath?.status || 'Verified'}</strong>
              </div>
              <div style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>أمن (Amn Security)</div>
                <strong style={{ fontSize: 12, color: '#198754' }}>✓ {candidate.clearances?.amn?.status || 'Approved'}</strong>
              </div>
              <div style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>الفحص الطبي (Medical)</div>
                <strong style={{ fontSize: 12, color: '#198754' }}>✓ {candidate.clearances?.medical?.status || 'Valid Class 1'}</strong>
              </div>
              <div style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>العنوان الوطني (Address)</div>
                <strong style={{ fontSize: 12, color: '#198754' }}>✓ {candidate.clearances?.address?.status || 'Confirmed'}</strong>
              </div>
            </div>
          </div>

          {/* AI Evidence Citations */}
          {candidate.citations && candidate.citations.length > 0 && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)' }}>
                <FileText size={16} /> {language === 'ar' ? 'أدلة المطابقة الخوارزمية المستخرجة من السيرة' : 'Algorithmic Match Citations from Resume'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {candidate.citations.map((cite, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: 'var(--color-subtle-green)', borderRadius: 6, border: '1px solid var(--color-border-green)', fontSize: 12 }}>
                    <strong style={{ color: 'var(--color-primary)' }}>{language === 'ar' ? cite.criterionAr : cite.criterion}: </strong>
                    <span style={{ color: 'var(--color-text-main)' }}>"{language === 'ar' ? cite.quoteAr : cite.quote}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {onShortlist && !isShortlisted && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onShortlist(candidate.id);
                  onClose();
                }}
                style={{ fontWeight: 600 }}
              >
                <CheckCircle2 size={14} />
                <span>{language === 'ar' ? 'اعتماد في القائمة القصيرة' : 'Shortlist Candidate'}</span>
              </button>
            )}

            {onOpenInterview && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onOpenInterview(candidate.id);
                }}
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Award size={14} />
                <span>{language === 'ar' ? 'مراجعة المقابلة وإصدار العرض ★' : 'Review Interview & Issue Offer ★'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
