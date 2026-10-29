import React, { useState } from 'react';
import { JobRequisition, CandidateApplication } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { X, CheckCircle2, FileUp, Sparkles, ShieldCheck, Award, Clock, ArrowRight, UserCheck } from 'lucide-react';

interface ApplyJobModalProps {
  job: JobRequisition;
  onClose: () => void;
  onSubmitted: (app: CandidateApplication) => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, onClose, onSubmitted }) => {
  const { language } = useLanguage();
  const { submitApplication } = useCandidate();
  const { setRole, setActiveNavTab } = useAuthRbac();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdApp, setCreatedApp] = useState<CandidateApplication | null>(null);

  const [formData, setFormData] = useState({
    fullName: 'Mohammad Al-Zahrani',
    fullNameAr: 'محمد بن عبدالمحسن الزهراني',
    nationalId: '1084920481',
    email: 'm.alzahrani@sans-candidate.sa',
    phone: '+966 50 491 8823',
    licenseNumber: 'GACA-ATC-R84920',
    licenseType: 'GACA Air Traffic Controller (Radar Rating)',
    experienceYears: 8,
    icaoLevel: 'Level 5 (Extended)',
    medicalExpiry: '2027-08-15',
    resumeFileName: 'Mohammad_AlZahrani_Senior_ATC_CV.pdf',
    consentPdpl: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newApp = submitApplication(job.id, {
        jobTitle: job.title,
        jobTitleAr: job.titleAr,
        requisitionCode: job.code,
        department: job.department,
        departmentAr: job.departmentAr,
        location: job.location,
        cvFileName: formData.resumeFileName,
        status: 'Submitted',
        stageIndex: 1,
        cvScannedByRecruiter: false,
        shortlistedByRecruiter: false
      });
      setIsSubmitting(false);
      setCreatedApp(newApp);
      setStep(4);
      onSubmitted(newApp);
    }, 600);
  };

  const handleSwitchToRecruiter = () => {
    onClose();
    setRole('recruiter');
    setActiveNavTab('ai_screening');
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 54, 34, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div className="card" style={{
        maxWidth: 680,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        border: '2px solid var(--color-primary)'
      }}>
        <div className="card-header" style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-white)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#C8E6C9' }}>
              {language === 'ar' ? 'بوابة التقديم المباشر على وظائف الملاحة الجوية' : 'Official SANS Career Application Gateway'}
            </span>
            <h3 style={{ fontSize: 17, margin: '2px 0 0', color: 'var(--color-white)', fontWeight: 700 }}>
              {language === 'ar' ? job.titleAr : job.title}
            </h3>
            <span style={{ fontSize: 11, color: '#E8F5E9' }}>{job.code} &bull; {job.location}</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Breadcrumb */}
        {step !== 4 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-subtle-green)' }}>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: step === 1 ? 700 : 500,
              borderBottom: step === 1 ? '3px solid var(--color-primary)' : 'none',
              color: step === 1 ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}>
              1. {language === 'ar' ? 'البيانات الشخصية' : 'Personal Info'}
            </div>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: step === 2 ? 700 : 500,
              borderBottom: step === 2 ? '3px solid var(--color-primary)' : 'none',
              color: step === 2 ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}>
              2. {language === 'ar' ? 'رخص الطيران المدني (GACA)' : 'Aviation Licensing'}
            </div>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: step === 3 ? 700 : 500,
              borderBottom: step === 3 ? '3px solid var(--color-primary)' : 'none',
              color: step === 3 ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}>
              3. {language === 'ar' ? 'رفع السيرة الذاتية' : 'CV Upload'}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'الاسم الكامل (بالعربية)' : 'Full Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameAr}
                    onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'رقم الهوية الوطنية (نفاذ)' : 'National ID (Nafath)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'رقم الجوال السعودي' : 'Mobile Phone'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                >
                  <span>{language === 'ar' ? 'التالي: بيانات الرخص الملاحية ←' : 'Next: Aviation Licensing →'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>
                  <Award size={16} />
                  <span>{language === 'ar' ? 'التحقق الآلي عبر سجل هيئة الطيران المدني (GACA API)' : 'Mandatory GACA Aviation Registry API'}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {language === 'ar'
                    ? 'سيتم التحقق الفوري من سريان رخصتك الطبية والملاحية عبر الربط الحكومي المباشر.'
                    : 'Your licensing numbers and medical credentials will be validated against official GACA flight registries.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'رقم رخصة المراقبة الجوية (GACA)' : 'GACA License Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'سنوات الخبرة الميدانية' : 'Years of Radar Experience'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'مستوى كفاءة لغة الطيران (ICAO)' : 'ICAO Aviation English Level'}
                  </label>
                  <select
                    value={formData.icaoLevel}
                    onChange={(e) => setFormData({ ...formData, icaoLevel: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                  >
                    <option value="Level 4 (Operational)">Level 4 (Operational)</option>
                    <option value="Level 5 (Extended)">Level 5 (Extended - Recommended)</option>
                    <option value="Level 6 (Expert)">Level 6 (Expert Native)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    {language === 'ar' ? 'سريان الليونة الطبية (Class 1)' : 'Medical Certificate Validity'}
                  </label>
                  <input
                    type="date"
                    value={formData.medicalExpiry}
                    onChange={(e) => setFormData({ ...formData, medicalExpiry: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  <span>&larr; {language === 'ar' ? 'السابق' : 'Back'}</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                >
                  <span>{language === 'ar' ? 'التالي: السيرة الذاتية والتقديم ←' : 'Next: Upload CV →'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* CV Ingestion Box */}
              <div style={{
                border: '2px dashed var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--color-subtle-green)'
              }}>
                <FileUp size={34} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ color: 'var(--color-primary-dark)', fontSize: 14, fontWeight: 700 }}>
                  {formData.resumeFileName}
                </h4>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {language === 'ar' 
                    ? 'تم إرفاق السيرة الذاتية المهنية المعتمدة متضمنة مسارات الرادار وساعات التحكم التشغيلي.' 
                    : 'Certified SANS Candidate Resume attached (En-Route Radar, 8+ Years, ICAO Level 5, OJTI).'}
                </p>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => alert(language === 'ar' ? 'تم تحديث ملف السيرة الذاتية' : 'Resume file refreshed!')}
                >
                  <span>{language === 'ar' ? 'استبدال الملف (PDF/DOCX)' : 'Replace File (PDF/DOCX)'}</span>
                </button>
              </div>

              {/* PDPL Consent */}
              <div style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: 12,
                backgroundColor: 'var(--color-bg)',
                borderRadius: 4,
                border: '1px solid var(--color-border)'
              }}>
                <input
                  type="checkbox"
                  id="pdpl-consent"
                  checked={formData.consentPdpl}
                  onChange={(e) => setFormData({ ...formData, consentPdpl: e.target.checked })}
                  style={{ marginTop: 3, accentColor: 'var(--color-primary)' }}
                  required
                />
                <label htmlFor="pdpl-consent" style={{ fontSize: 11, color: 'var(--color-text-main)', cursor: 'pointer' }}>
                  <strong>{language === 'ar' ? 'الموافقة على الإرسال الآمن (نظام حماية البيانات الشخصية PDPL):' : 'Saudi PDPL & Processing Consent:'}</strong>{' '}
                  {language === 'ar'
                    ? 'أوافق على قيام مسؤولي التوظيف بشركة خدمات الملاحة الجوية بتحليل سيرتي الذاتية واستخراج التقييمات الآلية مع الحفاظ التام على خصوصية البيانات واستضافتها حصرياً داخل المملكة العربية السعودية.'
                    : 'I consent to SANS talent acquisition recruiters processing my credentials under Saudi Data & AI Authority (SDAIA) and PDPL compliance, hosted exclusively inside KSA cloud borders.'}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  <span>&larr; {language === 'ar' ? 'السابق' : 'Back'}</span>
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting || !formData.consentPdpl}
                  style={{ padding: '10px 22px', fontWeight: 700 }}
                >
                  <FileUp size={16} />
                  <span>
                    {isSubmitting 
                      ? (language === 'ar' ? 'جاري رفع الطلب...' : 'Submitting to HR Portal...')
                      : (language === 'ar' ? 'رفع السيرة وإرسال الطلب لإدارة التوظيف' : 'Submit CV & Application to HR Portal →')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & EXPLANATION */}
          {step === 4 && createdApp && (
            <div style={{ textAlign: 'center', padding: '16px 10px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-subtle-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                border: '2px solid var(--color-border-green)'
              }}>
                <CheckCircle2 size={36} color="var(--color-primary)" />
              </div>

              <span className="badge green-badge" style={{ fontSize: 12, padding: '4px 12px', marginBottom: 8 }}>
                Application &amp; CV Uploaded
              </span>

              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                {language === 'ar' ? 'تم استلام سيرتك الذاتية في بوابة مسؤولي التوظيف' : 'CV Successfully Transmitted to SANS Recruiter Portal'}
              </h3>

              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 460, margin: '8px auto 18px', lineHeight: 1.6 }}>
                {language === 'ar'
                  ? 'تم إرسال ملف سيرتك الذاتية وبياناتك الملاحية إلى مسؤولة استقطاب الكفاءات (سارة الحربي). سيقوم فريق الموارد البشرية بإجراء الفرز الذكي وفحص السيرة آلياً واعتماد القائمة القصيرة. فور اعتمادها، ستتاح لك المقابلة الذكية التفاعلية.'
                  : 'Your resume and aviation profile have been transmitted to Senior Recruiter Sarah Al-Harbi. Once the HR team scans your CV with the AI engine and approves the shortlist, your Virtual AI Voice & Text Interview will be unlocked.'}
              </p>

              <div style={{
                backgroundColor: 'var(--color-subtle-green)',
                border: '1px solid var(--color-border-green)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                maxWidth: 420,
                margin: '0 auto 20px',
                textAlign: 'left',
                fontSize: 11,
                lineHeight: 1.8
              }}>
                <div><strong>Application Ref:</strong> {createdApp.id}</div>
                <div><strong>Requisition:</strong> {createdApp.requisitionCode} ({createdApp.jobTitle})</div>
                <div><strong>Current Stage:</strong> <span className="badge" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>Stage 1: Awaiting Recruiter AI Scan</span></div>
                <div><strong>Next Step:</strong> Recruiter Sarah Al-Harbi reviews CV &amp; Approves Shortlist</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <span>{language === 'ar' ? 'إغلاق وعرض طلباتي' : 'View in My Applications'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSwitchToRecruiter}
                  style={{ fontWeight: 800 }}
                >
                  <UserCheck size={15} />
                  <span>
                    {language === 'ar' 
                      ? 'التبديل لبوابة التوظيف (سارة الحربي) لفحص السيرة واعتماد القائمة ←' 
                      : 'Switch to Recruiter Portal to Scan & Approve Shortlist →'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
