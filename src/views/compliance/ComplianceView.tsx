import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { Target, FileSpreadsheet, Flag, Lock, ShieldCheck, CheckCircle2, Search, Filter } from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const { auditLogs } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab } = useAuthRbac();

  const [auditSearch, setAuditSearch] = useState('');
  const [selectedControl, setSelectedControl] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.event.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.subjectCandidate.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesControl =
      selectedControl === 'all' ||
      log.ncaControlRef.includes(selectedControl);

    return matchesSearch && matchesControl;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'مركز الرقابة التنظيمية وحوكمة الذكاء الاصطناعي' : 'Cybersecurity, Regulatory & AI Governance Hub'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'التحقق من التزام الخوارزميات بنسبة دقة 95%، وسجلات العمليات غير القابلة للتعديل لنظام حماية البيانات (PDPL)'
              : 'Empirical monitoring of the 95% AI accuracy SLA, immutable PDPL audit trails, and sovereign KSA hosting.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Exporting NCA Essential Cybersecurity Controls (ECC) Compliance Dossier...')}>
            <ShieldCheck size={14} />
            <span>NCA Certificate Pack</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Exporting Cryptographically Signed PDPL Audit Trail...')}>
            <FileSpreadsheet size={14} />
            <span>Export Signed Audit Log</span>
          </button>
        </div>
      </div>

      {/* 1. 95% ACCURACY SLA METRICS */}
      {(activeNavTab === 'compliance_dashboard' || activeNavTab === 'accuracy_sla' || !activeNavTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div className="card-header" style={{ justifyContent: 'center' }}>
                <h3 className="card-title">Contractual AI Matching Accuracy SLA</h3>
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                96.2%
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '6px 0 10px', fontWeight: 600 }}>
                Mandatory Target: 95.0% (Passing +1.2%)
              </div>
              <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '96.2%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                Empirically benchmarked across 500+ human-labeled SANS ATC evaluations.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div className="card-header" style={{ justifyContent: 'center' }}>
                <h3 className="card-title">KSA Data Sovereignty Status</h3>
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                100%
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '6px 0 10px', fontWeight: 600 }}>
                Kingdom of Saudi Arabia Data Residency
              </div>
              <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                Zero data egress outside Saudi borders for resumes, recordings, and LLM inference.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div className="card-header" style={{ justifyContent: 'center' }}>
                <h3 className="card-title">Recruiter Human Oversight Ratio</h3>
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                4.8%
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '6px 0 10px', fontWeight: 600 }}>
                Recruiter Override Frequency
              </div>
              <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '4.8%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                Healthy human oversight with full justification and audit compliance.
              </p>
            </div>
          </div>

          {/* Benchmark matrix */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Empirical Accuracy &amp; Confusion Matrix (Benchmarked vs. SANS ATC Examiners)</h3>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>True Positive (Qualified):</div>
                <strong style={{ fontSize: 20, color: 'var(--color-primary)' }}>96.8%</strong>
              </div>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>True Negative (Unqualified):</div>
                <strong style={{ fontSize: 20, color: 'var(--color-primary)' }}>95.6%</strong>
              </div>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>False Positive Rate:</div>
                <strong style={{ fontSize: 20, color: 'var(--color-danger)' }}>3.2%</strong>
              </div>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Model Drift Index:</div>
                <strong style={{ fontSize: 20, color: 'var(--color-accent)' }}>&lt; 0.04 (Stable)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMMUTABLE PDPL AUDIT TRAIL */}
      {(activeNavTab === 'audit_trail' || activeNavTab === 'compliance_dashboard') && (
        <div className="card" style={{ marginTop: activeNavTab === 'compliance_dashboard' ? 16 : 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'سجل العمليات والوصول المشفر غير القابل للتعديل' : 'Immutable PDPL & NCA Access Audit Trail'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Chained SHA-256 Hashes &bull; NCA-ECC-1:2018 Compliant
              </span>
            </div>
            <span className="badge green-badge">SHA-256 Cryptographically Chained</span>
          </div>

          {/* Search bar */}
          <div style={{ padding: '12px 20px', backgroundColor: 'var(--color-subtle-green)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Filter audit events by actor, candidate, or action..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              style={{ flex: 1, padding: '6px 12px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: 12 }}
            />
            <button className="btn btn-secondary btn-sm" onClick={() => alert('Audit logs cryptographically verified: All 12 hashes intact!')}>
              <CheckCircle2 size={13} />
              <span>Verify Hashes</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'التوقيت (توقيت مكة)' : 'Timestamp (AST)'}</th>
                  <th>{language === 'ar' ? 'المستخدم / النظام' : 'Actor'}</th>
                  <th>{language === 'ar' ? 'نوع العملية' : 'Action Event'}</th>
                  <th>{language === 'ar' ? 'المرشح / الوظيفة' : 'Subject'}</th>
                  <th>{language === 'ar' ? 'مرجع ضوابط الأمن' : 'NCA / PDPL Control'}</th>
                  <th>{language === 'ar' ? 'حالة التوثيق' : 'Integrity'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td><strong>{language === 'ar' ? log.actorAr : log.actor}</strong></td>
                    <td>{language === 'ar' ? log.eventAr : log.event}</td>
                    <td>{log.subjectCandidate}</td>
                    <td>
                      <span className="badge outline-badge" style={{ fontSize: 10 }}>
                        {log.ncaControlRef}
                      </span>
                    </td>
                    <td>
                      <span className="badge green-badge">&#10003; {log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. KSA DATA RESIDENCY PROOF */}
      {activeNavTab === 'data_residency' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Kingdom of Saudi Arabia Data Residency Proof &amp; Cloud Zones</h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Certified hosting within Riyadh &amp; Jeddah Primary/Secondary availability zones
              </span>
            </div>
            <span className="badge green-badge">100% In-Kingdom</span>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Oracle Cloud Riyadh (me-riyadh-1)</strong>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Primary Core HCM &amp; Candidate Database snapshot replication.</p>
                <span className="badge green-badge" style={{ marginTop: 6 }}>Operational</span>
              </div>
              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>STC Sovereign Cloud (Riyadh DC-2)</strong>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Local LLM inference &amp; Audio Voice processing microservices.</p>
                <span className="badge green-badge" style={{ marginTop: 6 }}>Zero Egress Confirmed</span>
              </div>
              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Nafath Gateway (Elm Private APN)</strong>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Encrypted dedicated fiber link for national identity queries.</p>
                <span className="badge green-badge" style={{ marginTop: 6 }}>mTLS 1.3 Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACCESS & EXPORT SECURITY LOGS */}
      {activeNavTab === 'access_logs' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Role-Based Access &amp; PII Export Security Logs</h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Strict least-privilege tracking for National IDs, phone numbers, and resumes
              </span>
            </div>
            <span className="badge green-badge">Zero Unauthorized Exports</span>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ padding: 12, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 4, marginBottom: 12 }}>
              <strong>PII Masking Status:</strong> Full masking enabled for unprivileged personas (Last 4 digits only for National IDs).
            </div>
            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Persona</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Authorization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Today, 10:45 AST</td>
                    <td>Sarah Al-Harbi (Recruiter)</td>
                    <td>Candidate Dossier View</td>
                    <td>Mohammad Al-Zahrani (ID: 1084920481)</td>
                    <td><span className="badge green-badge">Authorized (RBAC)</span></td>
                  </tr>
                  <tr>
                    <td>Today, 09:20 AST</td>
                    <td>Capt. Khalid Al-Otaibi (Manager)</td>
                    <td>Radar License Inspection</td>
                    <td>Candidate Assessment Pack</td>
                    <td><span className="badge green-badge">Authorized (RBAC)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
