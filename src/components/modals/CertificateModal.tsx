import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Award, 
  ShieldCheck, 
  Download, 
  Printer, 
  CheckCircle2, 
  FileCheck, 
  QrCode, 
  Lock,
  Building,
  Calendar,
  UserCheck
} from 'lucide-react';

interface CertificateModalProps {
  certificateTitle: string | null;
  candidateName: string;
  candidateNameAr: string;
  nationalId: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificateTitle,
  candidateName,
  candidateNameAr,
  nationalId,
  onClose
}) => {
  const { language } = useLanguage();

  if (!certificateTitle) return null;

  // Resolve certificate specific details
  const isRadar = certificateTitle.toLowerCase().includes('radar') || certificateTitle.toLowerCase().includes('atc');
  const isIcao = certificateTitle.toLowerCase().includes('icao') || certificateTitle.toLowerCase().includes('english');
  const isOjti = certificateTitle.toLowerCase().includes('ojti') || certificateTitle.toLowerCase().includes('instructor');
  const isMedical = certificateTitle.toLowerCase().includes('medical');

  let certCode = 'GACA-ATC-7891-SA';
  let issuerEn = 'General Authority of Civil Aviation (GACA) & SANS';
  let issuerAr = 'الهيئة العامة للطيران المدني وشركة خدمات الملاحة الجوية السعودية';
  let issueDate = '14 Jan 2024';
  let expiryDate = '31 Dec 2027';
  let authorityTitleEn = 'Aviation Safety & Air Traffic Management Directorate';
  let authorityTitleAr = 'الإدارة العامة لسلامة الطيران وإدارة الحركة الجوية';
  let scopeEn = 'Authorized to exercise all privileges of Air Traffic Control En-Route Radar Surveillance across Kingdom Airspace.';
  let scopeAr = 'مخوّل بممارسة كافة صلاحيات مراقبة الملاحة الجوية ورادار المسار الجوي في كامل المجال الجوي للمملكة.';

  if (isIcao) {
    certCode = 'ICAO-ELP-5-SANS-992';
    issueDate = '10 Mar 2025';
    expiryDate = '09 Mar 2028';
    authorityTitleEn = 'ICAO Aviation Radiotelephony Assessment Board';
    authorityTitleAr = 'لجنة اختبارات الكفاءة اللغوية الملاحية (إيكاو)';
    scopeEn = 'Demonstrated Operational Level 5 proficiency in aviation English radiotelephony communications under ICAO Annex 1 standards.';
    scopeAr = 'أثبت كفاءة ملاحية معتمدة من المستوى الخامس (Level 5) في الاتصالات اللاسلكية وفق ملحق 1 لمنظمة الطيران المدني الدولي.';
  } else if (isOjti) {
    certCode = 'SANS-OJTI-2025-412';
    issueDate = '20 Aug 2025';
    expiryDate = '19 Aug 2029';
    authorityTitleEn = 'SANS Air Navigation Training Academy';
    authorityTitleAr = 'أكاديمية تدريب الملاحة الجوية السعودية (SANS Academy)';
    scopeEn = 'Certified On-the-Job Training Instructor (OJTI) qualified to instruct, supervise, and certify operational radar air traffic controllers.';
    scopeAr = 'مدرب تدريب ميداني معتمد (OJTI) لتأهيل وتدريب وتقييم مراقبي الملاحة الجوية على الرادارات التشغيلية.';
  } else if (isMedical) {
    certCode = 'MED-GACA-CL1-2026-88';
    issueDate = '15 Dec 2025';
    expiryDate = '14 Dec 2027';
    authorityTitleEn = 'Aeromedical Certification Center - Jeddah';
    authorityTitleAr = 'المركز الطبي لطب الطيران المدني - جدة';
    scopeEn = 'Certified Class 1 Medical Fitness for Air Traffic Controllers in compliance with GACA Part 67 regulations.';
    scopeAr = 'شهادة اللياقة الطبية من الفئة الأولى (Class 1) لمراقبي الحركة الجوية متوافقة مع لوائح الطيران المدني.';
  }

  const displayName = language === 'ar' ? candidateNameAr : candidateName;

  const handleDownload = () => {
    alert(language === 'ar' 
      ? `جاري تحميل نسخة PDF الرسمية المشفرة لشهادة: ${certificateTitle}` 
      : `Downloading official cryptographically signed PDF certificate for: ${certificateTitle}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 25, 18, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: 16
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 820,
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* MODAL CONTROL BAR */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--color-primary-dark)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={18} color="#D1E7DD" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {language === 'ar' ? 'عرض الوثيقة والترخيص الملاحي المعتمد' : 'Official Aviation Credential Viewer'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleDownload}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
            >
              <Download size={13} />
              <span>{language === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
            >
              <Printer size={13} />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY: CERTIFICATE CANVAS */}
        <div style={{
          padding: 24,
          overflowY: 'auto',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {/* THE CERTIFICATE SHEET */}
          <div style={{
            width: '100%',
            maxWidth: 740,
            backgroundColor: '#FFFFFF',
            border: '4px double #0F5132',
            borderRadius: 'var(--radius-sm)',
            padding: '32px 36px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            position: 'relative'
          }}>
            {/* INNER WATERMARK BORDER */}
            <div style={{
              border: '1px solid #D1E7DD',
              padding: '24px 28px',
              position: 'relative',
              backgroundColor: '#FAFCFA'
            }}>
              {/* TOP EMBLEM & AUTHORITY HEADINGS */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-subtle-green)',
                    border: '2px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={28} color="var(--color-primary)" />
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-dark)', letterSpacing: '0.5px' }}>
                  المملكة العربية السعودية &bull; KINGDOM OF SAUDI ARABIA
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                  {language === 'ar' ? issuerAr : issuerEn}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {language === 'ar' ? authorityTitleAr : authorityTitleEn}
                </div>
              </div>

              {/* CERTIFICATE RIBBON TITLE */}
              <div style={{
                textAlign: 'center',
                margin: '18px 0',
                padding: '8px 16px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                  OFFICIAL AVIATION OPERATIONAL CERTIFICATE OF COMPETENCY
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 0 0', color: '#FFFFFF' }}>
                  {certificateTitle}
                </h2>
              </div>

              {/* RECIPIENT RECOGNITION TEXT */}
              <div style={{ textAlign: 'center', margin: '22px 0 16px 0' }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  {language === 'ar'
                    ? 'تشهد شركة خدمات الملاحة الجوية السعودية والهيئة العامة للطيران المدني بأن:'
                    : 'This is to officially certify that the aviation professional named herein:'}
                </div>

                <div style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'var(--color-primary-dark)',
                  margin: '8px 0',
                  textDecoration: 'underline',
                  textDecorationColor: '#D1E7DD',
                  textUnderlineOffset: '6px'
                }}>
                  {displayName}
                </div>

                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  National ID: <strong>{nationalId}</strong> &bull; License Ref: <strong>{certCode}</strong>
                </div>
              </div>

              {/* SCOPE STATEMENT */}
              <div style={{
                margin: '18px 0',
                padding: '12px 16px',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border-green)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--color-text-main)'
              }}>
                {language === 'ar' ? scopeAr : scopeEn}
              </div>

              {/* METADATA GRID: DATES, VERIFICATION, QR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 20,
                fontSize: 11
              }}>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'تاريخ الإصدار:' : 'Date of Issue:'}</div>
                  <strong style={{ color: 'var(--color-text-main)' }}>{issueDate}</strong>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'تاريخ الانتهاء:' : 'Valid Until:'}</div>
                  <strong style={{ color: 'var(--color-success)' }}>{expiryDate} (Valid)</strong>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'حالة الاعتماد:' : 'Registry Status:'}</div>
                  <strong style={{ color: 'var(--color-primary)' }}>&#10003; GACA Verified API</strong>
                </div>
              </div>

              {/* SIGNATURES & OFFICIAL SEAL */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 28,
                paddingTop: 16,
                borderTop: '1px dashed var(--color-border)'
              }}>
                {/* Signature 1 */}
                <div style={{ textAlign: 'center', minWidth: 160 }}>
                  <div style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: 15, color: 'var(--color-primary-dark)', marginBottom: 2 }}>
                    Khalid Al-Otaibi
                  </div>
                  <div style={{ borderTop: '1px solid #94A3B8', paddingTop: 4 }}>
                    <strong style={{ fontSize: 11, display: 'block', color: 'var(--color-text-main)' }}>Capt. Khalid Al-Otaibi</strong>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Director of Air Traffic Control</span>
                  </div>
                </div>

                {/* Central Seal Badge */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: '3px solid #D1E7DD',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    <ShieldCheck size={22} color="#FFFFFF" />
                    <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>SEALED</span>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-primary-dark)', marginTop: 4 }}>
                    SANS OFFICIALLY SEALED
                  </div>
                </div>

                {/* Signature 2 */}
                <div style={{ textAlign: 'center', minWidth: 160 }}>
                  <div style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: 15, color: 'var(--color-primary-dark)', marginBottom: 2 }}>
                    Faisal Al-Harthi
                  </div>
                  <div style={{ borderTop: '1px solid #94A3B8', paddingTop: 4 }}>
                    <strong style={{ fontSize: 11, display: 'block', color: 'var(--color-text-main)' }}>Dr. Faisal Al-Harthi</strong>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>GACA Aviation Licensing Registrar</span>
                  </div>
                </div>
              </div>

              {/* CRYPTOGRAPHIC VERIFICATION FOOTER */}
              <div style={{
                marginTop: 20,
                padding: '8px 12px',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: 10,
                color: 'var(--color-text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={12} color="var(--color-primary)" />
                  <span>SHA-256 Hash: <strong>e8f491c0b9a...7129</strong></span>
                </div>
                <div>
                  Blockchain Registry: <strong>GACA-LEDGER-MAIN-BLOCK-9812</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BOTTOM BAR */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={14} color="var(--color-success)" />
            <span>{language === 'ar' ? 'تمت مطابقة هذا الترخيص عبر الربط الرقمي مع هيئة الطيران المدني.' : 'This credential has been digitally verified with GACA Aviation Registry.'}</span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
