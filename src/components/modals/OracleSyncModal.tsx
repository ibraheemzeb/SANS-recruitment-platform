import React from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle2, Server, ShieldCheck } from 'lucide-react';

export const OracleSyncModal: React.FC = () => {
  const { syncToOracleModalOpen, setSyncToOracleModalOpen, lastSyncPayload } = useCandidate();
  const { language } = useLanguage();

  if (!syncToOracleModalOpen || !lastSyncPayload) return null;

  return (
    <div className="modal-backdrop" onClick={() => setSyncToOracleModalOpen(false)}>
      <div className="modal-dialog" style={{ maxWidth: 740 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={20} color="var(--color-primary)" />
            <div>
              <h3 className="modal-title">
                {language === 'ar' ? 'بوابة التكامل مع نظام أوراكل فيوجن للموارد البشرية' : 'Oracle Fusion HCM REST Gateway Simulator'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {language === 'ar' ? 'معاملة مزامنة بيانات المرشحين المؤهلين • REQ-2026-084' : 'Outbound Shortlist Synchronization • Requisition REQ-2026-084'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setSyncToOracleModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: 'var(--color-soft-green)',
            border: '1px solid var(--color-border-green)',
            borderRadius: 'var(--radius-md)'
          }}>
            <CheckCircle2 size={24} color="var(--color-primary)" />
            <div>
              <strong style={{ color: 'var(--color-primary-dark)', fontSize: 13, display: 'block' }}>
                HTTP 200 OK — REST Transaction Acknowledged
              </strong>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {language === 'ar' 
                  ? 'تم استلام وتوثيق قائمة المرشحين بنجاح في قاعدة بيانات أوراكل المركزية مع روابط الوثائق المعتمدة.'
                  : 'Candidate evaluation outcomes and secure dossier references committed to Oracle Fusion Recruiting Service.'}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'حزمة بيانات واجهة برمجة التطبيقات (JSON REST Payload):' : 'Outbound JSON REST API Payload:'}
              </h4>
              <span className="badge green-badge" style={{ fontSize: 10 }}>
                Mutual TLS 1.3 &bull; OAuth 2.0 Bearer
              </span>
            </div>
            
            <pre style={{
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              padding: 14,
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: 11.5,
              lineHeight: 1.45,
              maxHeight: 300,
              overflowY: 'auto',
              border: '1px solid #334155'
            }}>
              {JSON.stringify(lastSyncPayload, null, 2)}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setSyncToOracleModalOpen(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              alert(language === 'ar' 
                ? 'تم فحص استجابة الويب هوك من أوراكل (Oracle Webhook Callback) بنجاح!' 
                : 'Verified Oracle Fusion HCM Webhook Callback & Trace Token!');
              setSyncToOracleModalOpen(false);
            }}
          >
            <ShieldCheck size={14} />
            <span>{language === 'ar' ? 'التحقق من سجل أوراكل المعتمد' : 'Verify Oracle Audit Token'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
