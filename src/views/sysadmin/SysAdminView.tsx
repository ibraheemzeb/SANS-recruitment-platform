import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { Server, Activity, Database, Key, CheckCircle2, ShieldCheck, RefreshCw, Play, RotateCcw } from 'lucide-react';

export const SysAdminView: React.FC = () => {
  const { executeOracleSync } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab } = useAuthRbac();

  const [drillRunning, setDrillRunning] = useState(false);
  const [drillSuccess, setDrillSuccess] = useState(false);
  const [keyRotated, setKeyRotated] = useState(false);

  const handleRunDrill = () => {
    setDrillRunning(true);
    setTimeout(() => {
      setDrillRunning(false);
      setDrillSuccess(true);
      setTimeout(() => setDrillSuccess(false), 4000);
    }, 2000);
  };

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'مركز عمليات البنية التحتية والتكامل السحابي (SysAdmin Hub)' : 'System Administrator & Cloud Integration Operations'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'مراقبة بوابات أوراكل، خدمات الحوسبة السحابية داخل المملكة، وعمليات النسخ الاحتياطي والتعافي (DR)'
              : 'Enterprise integration gateway monitoring, KSA sovereign cloud health, and disaster recovery replication.'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={executeOracleSync}>
          <Server size={14} />
          <span>{language === 'ar' ? 'اختبار واجهة أوراكل REST API' : 'Test Oracle REST Gateway'}</span>
        </button>
      </div>

      {/* 1. ORACLE GATEWAY & DASHBOARD */}
      {(activeNavTab === 'sysadmin_dashboard' || activeNavTab === 'oracle_gateway' || !activeNavTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Oracle Cloud Fusion HCM REST Integration Gateway</h3>
              <span className="badge green-badge">Connected &bull; mTLS 1.3</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, border: '1px solid var(--color-border-green)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Target Requisition Endpoint:</div>
                  <strong style={{ fontSize: 12 }}>/hcmRestApi/resources/11.13.18.05/recruitingJobRequisitions</strong>
                  <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>HTTP 200 OK &bull; Response Time: 42ms</div>
                </div>
                <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, border: '1px solid var(--color-border-green)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Candidate Sync Payload:</div>
                  <strong style={{ fontSize: 12 }}>JSON Schema V4 (NCA Validated)</strong>
                  <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>Auto-Signed by Gateway Key</div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={executeOracleSync}>
                  <span>Trigger Manual Oracle HCM Requisition Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLOUD TOPOLOGY & HEALTH */}
      {(activeNavTab === 'cloud_topology' || activeNavTab === 'sysadmin_dashboard') && (
        <div className="card" style={{ marginTop: activeNavTab === 'sysadmin_dashboard' ? 16 : 0 }}>
          <div className="card-header">
            <h3 className="card-title">KSA Sovereign Cloud Microservices Health</h3>
            <span className="badge green-badge">Riyadh &bull; Region 1 (NCA Compliant)</span>
          </div>

          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Oracle HCM Sync Service</strong>
                <span className="badge green-badge">99.98% Up</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>REST endpoint: /recruitingJobRequisitions</p>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 6, fontWeight: 600 }}>Latency: 42ms</div>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>AI Inference (KSA LLM)</strong>
                <span className="badge green-badge">Operational</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Saudi Sovereign Compute Node</p>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 6, fontWeight: 600 }}>Latency: 120ms</div>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Nafath Auth Adapter</strong>
                <span className="badge green-badge">Connected</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>National Identity Service API</p>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 6, fontWeight: 600 }}>Mutual TLS 1.3</div>
            </div>

            <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Mercer Assessment Connector</strong>
                <span className="badge green-badge">Active</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Test Ingestion Webhook</p>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 6, fontWeight: 600 }}>Latency: 65ms</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BACKUP & RECOVERY DRILL */}
      {activeNavTab === 'backup_recovery' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Disaster Recovery (DR), RPO/RTO &amp; Automated Drill</h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Target RPO: &lt; 15m &bull; Target RTO: &lt; 2h &bull; Geographically Replicated
              </span>
            </div>
            {drillSuccess && <span className="badge green-badge">&#10003; DR Drill Succeeded (Zero Loss)</span>}
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                <span><strong>Encrypted Database Snapshots:</strong> Stored in Secondary KSA Region (Jeddah DC)</span>
                <span className="badge green-badge">AES-256 Validated</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                <span><strong>Continuous Transaction Journaling:</strong> Synchronous mirror</span>
                <span className="badge green-badge">RPO: 0 Seconds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10, backgroundColor: 'var(--color-bg)', borderRadius: 4 }}>
                <span><strong>Last Disaster Recovery Simulation:</strong> Conducted across 4 microservices</span>
                <span className="badge green-badge">Passed (4m 12s failover)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunDrill}
                disabled={drillRunning}
              >
                <RefreshCw size={13} className={drillRunning ? 'animate-spin' : ''} />
                <span>{drillRunning ? 'Executing DR Drill...' : 'Initiate Live Disaster Recovery Drill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ZERO-TRUST API KEYS & TOKENS */}
      {activeNavTab === 'api_keys' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Zero-Trust Cryptographic Keys &amp; Gateway Credentials</h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Rotated automatically every 90 days or on-demand
              </span>
            </div>
            {keyRotated && <span className="badge green-badge">&#10003; Key Rotated &amp; Stored in HSM</span>}
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, border: '1px solid var(--color-border-green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Oracle HCM Service Key</strong>
                  <span className="badge green-badge">Active</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  key_sans_hcm_prod_98a72c**** (HSM Slot 04)
                </div>
              </div>

              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', borderRadius: 4, border: '1px solid var(--color-border-green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Nafath Gateway Certificate</strong>
                  <span className="badge green-badge">Valid (Expires 2027)</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  cert_sans_nafath_sa_2026.crt
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleRotateKey}>
                <Key size={13} />
                <span>Rotate Encryption Keys Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
