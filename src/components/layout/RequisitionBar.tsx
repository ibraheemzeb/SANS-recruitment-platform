import React from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { RefreshCw, FileText } from 'lucide-react';

export const RequisitionBar: React.FC = () => {
  const { activeRequisition, allRequisitions, setActiveRequisition, executeOracleSync } = useCandidate();
  const { language, t } = useLanguage();
  const { role } = useAuthRbac();

  if (role === 'candidate') {
    return (
      <div className="sub-header-bar">
        <div className="sub-bar-inner">
          <div className="req-selector-box">
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {language === 'ar' ? 'طلب التوظيف النشط:' : 'Active Application:'}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: 13 }}>
              {language === 'ar' ? activeRequisition.titleAr : activeRequisition.title} ({activeRequisition.code})
            </span>
          </div>
          <div className="req-quick-stats">
            <div className="stat-pill pill-highlight">
              <strong>{language === 'ar' ? 'المرحلة: الفرز واختبار المقابلة الذكية' : 'Phase: AI Screening & Virtual Interview'}</strong>
            </div>
            <div className="stat-pill">
              {language === 'ar' ? 'رقم الطلب: #APP-2026-981' : 'Application Ref: #APP-2026-981'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-header-bar">
      <div className="sub-bar-inner">
        <div className="req-selector-box">
          <label htmlFor="active-req-select">{t('active.req')}</label>
          <select 
            id="active-req-select"
            className="clean-select" 
            style={{ fontWeight: 600, minWidth: 320 }}
            value={activeRequisition.id}
            onChange={(e) => setActiveRequisition(e.target.value)}
          >
            {allRequisitions.map(r => (
              <option key={r.id} value={r.id}>
                {r.code}: {language === 'ar' ? r.titleAr : r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="req-quick-stats">
          <div className="stat-pill">
            <strong>{activeRequisition.totalApplicants}</strong> {t('total.ingested')}
          </div>
          <div className="stat-pill">
            <strong>{activeRequisition.screenedCount}</strong> {t('ai.screened')}
          </div>
          <div className="stat-pill pill-highlight">
            <strong>{activeRequisition.shortlistCount}</strong> {t('high.match')}
          </div>
          <div className="stat-pill">
            <strong>{activeRequisition.interviewCompletedCount}</strong> {t('interviews.done')}
          </div>
          <div className="stat-pill">
            <strong>{activeRequisition.clearedCount}</strong> {t('cleared.candidates')}
          </div>
        </div>

        <div className="sub-bar-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => alert('Pulling updated job requisitions and candidate submissions from Oracle Fusion HCM (REST endpoint: /hcmRestApi/resources/11.13.18.05/recruitingJobRequisitions)... 200 OK Synchronized!')}
          >
            <RefreshCw size={13} />
            <span>{t('pull.oracle')}</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={executeOracleSync}
          >
            <FileText size={13} />
            <span>{t('export.dossier')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
