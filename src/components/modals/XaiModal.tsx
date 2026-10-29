import React, { useState } from 'react';
import { Candidate } from '../../types';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { X, CheckCircle, ShieldAlert } from 'lucide-react';

interface XaiModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const XaiModal: React.FC<XaiModalProps> = ({ candidate, onClose }) => {
  const { overrideCandidateScore } = useCandidate();
  const { language } = useLanguage();
  const { activePersona } = useAuthRbac();

  if (!candidate) return null;

  const currentScore = candidate.overrideScore !== null 
    ? candidate.overrideScore 
    : (candidate.computedScore || candidate.rawMatchScore);

  const [overrideInput, setOverrideInput] = useState<number>(currentScore);
  const [overrideReason, setOverrideReason] = useState('Confirmed Military Flight Ops Equivalence');

  const handleSaveOverride = () => {
    overrideCandidateScore(
      candidate.id,
      overrideInput,
      overrideReason,
      language === 'ar' ? activePersona.nameAr : activePersona.name
    );
    alert(
      language === 'ar'
        ? `تم اعتماد تعديل درجة المرشح ${candidate.nameAr} بنجاح!\nالدرجة الجديدة: ${overrideInput}%\nالمبرر: ${overrideReason}\nتم تسجيل العملية في سجل الامتثال المعتمد لنظام حماية البيانات (PDPL).`
        : `Recruiter override committed for ${candidate.name}!\nNew Score: ${overrideInput}%\nJustification: ${overrideReason}\nEvent logged to immutable PDPL audit trail.`
    );
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {language === 'ar' ? candidate.nameAr : candidate.name} ({candidate.id})
            </h3>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {language === 'ar' ? 'ملف التفسير الخوارزمي المعتمد • الذكاء الاصطناعي الشفاف' : 'Explainable AI (XAI) Candidate Evaluation Dossier'}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Score Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 14,
            backgroundColor: 'var(--color-subtle-green)',
            border: '1px solid var(--color-border-green)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{currentScore}%</span>
              <span style={{ fontSize: 8, textTransform: 'uppercase' }}>Match</span>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-primary-dark)', fontSize: 14, marginBottom: 2 }}>
                {language === 'ar' ? 'تحليل المطابقة الخوارزمية' : 'AI Match Analysis'}
              </h4>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {language === 'ar' ? candidate.keyStrengthsAr : candidate.keyStrengths}
              </p>
              {candidate.overrideScore !== null && (
                <span className="badge outline-badge" style={{ marginTop: 4, color: '#B45309' }}>
                  {language === 'ar' ? `معدل يدوياً من مسؤول التوظيف (المبرر: ${candidate.overrideReason})` : `Human Override Active: ${candidate.overrideReason}`}
                </span>
              )}
            </div>
          </div>

          {/* Citations Box */}
          <div>
            <h4 style={{ fontSize: 13, color: 'var(--color-primary)', marginBottom: 8, fontWeight: 700 }}>
              {language === 'ar' ? 'أدلة المطابقة المقتبسة من السيرة الذاتية (Citations):' : 'Verified CV Evidence Citations (Exact Text Excerpts):'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {candidate.citations.map((cit, idx) => (
                <div 
                  key={idx} 
                  style={{
                    padding: 10,
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderLeft: language === 'ar' ? '1px solid var(--color-border)' : '4px solid var(--color-primary)',
                    borderRight: language === 'ar' ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 12, color: 'var(--color-primary-dark)' }}>
                      {language === 'ar' ? cit.criterionAr : cit.criterion}
                    </strong>
                    <span className="badge green-badge">
                      {language === 'ar' ? cit.confidenceAr : cit.confidence}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontStyle: 'italic',
                    backgroundColor: '#EBF3EE',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-main)'
                  }}>
                    "{language === 'ar' ? cit.quoteAr : cit.quote}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Recruiter Override Control */}
          <div style={{
            padding: 14,
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ fontSize: 12, color: '#92400E' }}>
                {language === 'ar' ? 'الرقابة البشرية: تعديل درجة التقييم يدوياً' : 'Human-in-the-Loop: Recruiter Score Override'}
              </strong>
              <span className="badge outline-badge" style={{ fontSize: 10 }}>
                {language === 'ar' ? 'خاضع لتدقيق الأمن والخصوصية' : 'NCA / PDPL Traceable'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 11, fontWeight: 600 }}>
                  {language === 'ar' ? 'الدرجة المعدلة:' : 'Adjust Score:'}
                </label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  className="clean-input" 
                  style={{ width: 80, fontWeight: 700 }}
                  value={overrideInput}
                  onChange={(e) => setOverrideInput(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, fontWeight: 600 }}>
                  {language === 'ar' ? 'مبرر التعديل النظامي:' : 'Audit Justification Reason:'}
                </label>
                <select 
                  className="clean-select"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                >
                  <option value="Confirmed Military Flight Ops Equivalence">Confirmed Military Flight Ops Equivalence</option>
                  <option value="Committee Expert Endorsement">Direct ATC Committee Endorsement</option>
                  <option value="International License Exemption Verified">International Equivalent License Approved</option>
                  <option value="Senior Recruiter Discretionary Review">Senior Recruiter Discretionary Assessment</option>
                </select>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleSaveOverride}>
                {language === 'ar' ? 'حفظ التعديل والتوثيق' : 'Commit Override'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => {
              alert(language === 'ar' ? 'تم تنزيل تقرير الفرز الشامل للمرشح بصيغة PDF المعتمدة.' : 'Downloading SANS Official Candidate Screening Dossier (PDF)...');
            }}
          >
            {language === 'ar' ? 'تحميل ملف المرشح (PDF)' : 'Download PDF Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};
