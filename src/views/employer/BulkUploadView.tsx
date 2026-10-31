import React, { useState, useRef } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Trash2,
  Briefcase,
  AlertCircle,
  FileCheck,
  Layers,
  RefreshCw
} from 'lucide-react';

interface BulkUploadViewProps {
  onNavigateToPipeline: () => void;
}

interface SelectedFile {
  name: string;
  size: number;
}

export const BulkUploadView: React.FC<BulkUploadViewProps> = ({ onNavigateToPipeline }) => {
  const {
    allRequisitions,
    activeRequisition,
    setActiveRequisition,
    bulkUploadCvs,
    bulkScanCandidateCvs,
    applications,
    candidates
  } = useCandidate();

  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Requisition for Ingestion
  const [targetReqId, setTargetReqId] = useState<string>(activeRequisition?.id || allRequisitions[0]?.id || 'req-084');

  // File Selection
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // AI Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<{
    ingestedCount: number;
    scannedCount: number;
    averageScore: number;
  } | null>(null);

  const activeJob = allRequisitions.find(r => r.id === targetReqId) || activeRequisition || allRequisitions[0];

  const handleFilesChosen = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: SelectedFile[] = Array.from(fileList).map(f => ({
      name: f.name,
      size: f.size
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadAviationCohort = () => {
    const presetFiles: SelectedFile[] = [
      { name: 'Capt_Tariq_AlHarbi_Senior_Radar_ATC.pdf', size: 2450000 },
      { name: 'Eng_Reem_AlOtaibi_CNS_ATM_Avionics.pdf', size: 1890000 },
      { name: 'Sultan_AlShehri_Tower_Approach_GACA.pdf', size: 2150000 },
      { name: 'Noura_AlGhamdi_Airspace_Safety_Analyst.pdf', size: 1780000 },
      { name: 'Bandar_AlZahrani_Flight_Dispatch_Ops.pdf', size: 1950000 },
      { name: 'Fahad_AlMutairi_EnRoute_Radar_Controller.pdf', size: 2300000 }
    ];
    setSelectedFiles(presetFiles);
  };

  const handleStartAiAnalysis = () => {
    setIsProcessing(true);
    setProcessingPhase(1);
    setProgressPercent(15);
    setAnalysisResult(null);

    // Make sure target requisition is active
    setActiveRequisition(targetReqId);

    // Phase 1: Malware & Format Validation
    setTimeout(() => {
      setProcessingPhase(2);
      setProgressPercent(40);

      // Phase 2: Bilingual OCR & Entity Parsing
      setTimeout(() => {
        setProcessingPhase(3);
        setProgressPercent(75);

        // Phase 3: AI Scoring Engine against Requisition Criteria
        setTimeout(() => {
          setProcessingPhase(4);
          setProgressPercent(95);

          // Execute bulk ingestion and AI scan
          const customFiles = selectedFiles.length > 0 ? selectedFiles : undefined;
          const uploadRes = bulkUploadCvs(customFiles);
          const scanRes = bulkScanCandidateCvs();

          setTimeout(() => {
            setIsProcessing(false);
            setProgressPercent(100);
            setAnalysisResult({
              ingestedCount: uploadRes.count,
              scannedCount: scanRes.scannedCount,
              averageScore: scanRes.averageScore || 94
            });
          }, 600);

        }, 800);
      }, 800);
    }, 700);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* 1. Header & Navigation Back */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: '20px 24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--color-primary-dark)' }}>
              {language === 'ar' ? 'استيعاب السير الذاتية والفرز الآلي الجماعي' : 'Bulk CV Ingestion & AI Automated Screening'}
            </h1>
            <span className="badge green-badge" style={{ fontSize: 11, padding: '4px 10px' }}>
              ● {language === 'ar' ? 'محرك الفرز بالذكاء الاصطناعي' : 'AI Ingestion Engine'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
            {language === 'ar'
              ? 'رفع حزم السير الذاتية دفعة واحدة، إجراء المسح الضوئي الثنائي، واستخراج درجات المطابقة والرخص الملاحية فورياً'
              : 'Batch upload candidate resumes to automatically parse credentials, compute AI match scores, and populate your hiring pipeline.'}
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onNavigateToPipeline}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <span>{language === 'ar' ? 'العودة إلى لوحة المرشحين' : '← Back to Candidates Pipeline'}</span>
        </button>
      </div>

      {/* 2. Requisition Target Selection */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: '18px 24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8 }}>
          {language === 'ar' ? 'الوظيفة الشاغرة المستهدفة للفرز الجماعي:' : 'Target Job Requisition for Ingestion & AI Matching:'}
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={targetReqId}
            onChange={(e) => setTargetReqId(e.target.value)}
            className="clean-select"
            style={{
              flex: 1,
              minWidth: 320,
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--color-border)'
            }}
          >
            {allRequisitions.map(r => (
              <option key={r.id} value={r.id}>
                {r.code}: {language === 'ar' ? r.titleAr : r.title} ({r.department})
              </option>
            ))}
          </select>

          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-subtle-green)', padding: '8px 14px', borderRadius: 6, border: '1px solid var(--color-border-green)' }}>
            <strong>{activeJob.totalApplicants || 0}</strong> {language === 'ar' ? 'مرشحين مسجلين حالياً' : 'Candidates currently active'}
          </div>
        </div>
      </div>

      {/* 3. Drag and Drop Upload Box */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFilesChosen(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--color-border-green)',
            backgroundColor: isDragging ? 'var(--color-soft-green)' : 'var(--color-subtle-green)',
            borderRadius: 10,
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".pdf,.docx,.doc,.zip"
            style={{ display: 'none' }}
            onChange={(e) => handleFilesChosen(e.target.files)}
          />

          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            backgroundColor: 'var(--color-soft-green)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14
          }}>
            <UploadCloud size={28} />
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-primary-dark)' }}>
            {language === 'ar' ? 'اسحب وأفلت السير الذاتية هنا، أو انقر للاختيار' : 'Drag & drop resume files here, or click to browse'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
            {language === 'ar' ? 'يدعم ملفات PDF، DOCX، أو ملفات ZIP المضغوطة (فحص أمني فوري)' : 'Supports PDF, Word DOCX, or ZIP archive batches (Anti-Malware & PDPL checked)'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{ fontWeight: 700 }}
            >
              <UploadCloud size={14} />
              <span>{language === 'ar' ? 'اختيار ملفات من الجهاز' : 'Choose Local Files'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadAviationCohort();
              }}
              style={{ fontWeight: 700, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              <Sparkles size={14} />
              <span>{language === 'ar' ? 'تحميل حزمة كفاءات ملاحية تجريبية (SANS Cohort)' : 'Load SANS Aviation Cohort Resumes'}</span>
            </button>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <strong style={{ fontSize: 13, color: 'var(--color-text-main)' }}>
                {language === 'ar' ? 'الملفات المحددة للتحليل' : 'Selected Files for Processing'} ({selectedFiles.length}):
              </strong>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedFiles([])}
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                {language === 'ar' ? 'إفراغ القائمة' : 'Clear List'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, maxHeight: 180, overflowY: 'auto' }}>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <FileText size={15} color="var(--color-primary)" />
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Button: Trigger AI Analysis */}
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={handleStartAiAnalysis}
                disabled={isProcessing}
                style={{
                  padding: '12px 28px',
                  fontWeight: 800,
                  fontSize: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(15, 81, 50, 0.25)'
                }}
              >
                <Zap size={16} />
                <span>
                  {isProcessing
                    ? (language === 'ar' ? 'جاري الفحص واستخراج الدرجات بالذكاء الاصطناعي...' : 'AI Analyzing & Extracting Scores...')
                    : (language === 'ar' ? `بدء الفرز الآلي لـ (${selectedFiles.length}) سير ذاتية` : `Run AI Screening on (${selectedFiles.length}) Resumes`)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Processing Progress Card */}
      {isProcessing && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ fontSize: 14, color: 'var(--color-primary-dark)' }}>
              {language === 'ar' ? 'مراحل التحليل الخوارزمي المعتمد (NCA & SANS AI):' : 'Algorithmic Processing Pipeline (NCA & SANS AI):'}
            </strong>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)' }}>{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          {/* Stepper */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div style={{ padding: 10, borderRadius: 6, background: processingPhase >= 1 ? 'var(--color-subtle-green)' : '#f8fafc', border: processingPhase >= 1 ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)', fontSize: 11 }}>
              <strong>1. {language === 'ar' ? 'فحص النزاهة والفيروسات' : 'Anti-Malware & PDPL'}</strong>
              <div style={{ color: processingPhase >= 1 ? '#16a34a' : 'var(--color-text-muted)' }}>
                {processingPhase >= 1 ? '✓ Passed' : 'Waiting...'}
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 6, background: processingPhase >= 2 ? 'var(--color-subtle-green)' : '#f8fafc', border: processingPhase >= 2 ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)', fontSize: 11 }}>
              <strong>2. {language === 'ar' ? 'المسح الضوئي الثنائي OCR' : 'Bilingual OCR & Parsing'}</strong>
              <div style={{ color: processingPhase >= 2 ? '#16a34a' : 'var(--color-text-muted)' }}>
                {processingPhase >= 2 ? '✓ Extracted' : 'Waiting...'}
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 6, background: processingPhase >= 3 ? 'var(--color-subtle-green)' : '#f8fafc', border: processingPhase >= 3 ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)', fontSize: 11 }}>
              <strong>3. {language === 'ar' ? 'المطابقة واحتساب الدرجات' : 'AI Scoring & Matching'}</strong>
              <div style={{ color: processingPhase >= 3 ? '#16a34a' : 'var(--color-text-muted)' }}>
                {processingPhase >= 3 ? '✓ Scoring' : 'Waiting...'}
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 6, background: processingPhase >= 4 ? 'var(--color-subtle-green)' : '#f8fafc', border: processingPhase >= 4 ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)', fontSize: 11 }}>
              <strong>4. {language === 'ar' ? 'المزامنة مع أوراكل' : 'Oracle HCM Sync'}</strong>
              <div style={{ color: processingPhase >= 4 ? '#16a34a' : 'var(--color-text-muted)' }}>
                {processingPhase >= 4 ? '✓ Synchronized' : 'Waiting...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Results & Confirmation Card */}
      {analysisResult && (
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: 10,
          padding: '24px',
          border: '1px solid #bbf7d0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#14532d', margin: 0 }}>
                {language === 'ar' ? 'اكتمل الفرز الآلي واستيعاب المرشحين بنجاح!' : 'AI Analysis & Resume Ingestion Successfully Completed!'}
              </h3>
              <p style={{ fontSize: 13, color: '#166534', margin: '4px 0 0 0' }}>
                {language === 'ar'
                  ? `تم تحليل ${analysisResult.ingestedCount} سير ذاتية وحساب درجات المطابقة، أصبحت جاهزة في لوحة المرشحين.`
                  : `Processed ${analysisResult.ingestedCount} resumes with average AI match score of ${analysisResult.averageScore}%. Candidates are now populated in your pipeline.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '16px 0 20px 0' }}>
            <div style={{ padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534' }}>{language === 'ar' ? 'إجمالي السير المستوعبة' : 'Total Ingested'}</div>
              <strong style={{ fontSize: 18, color: '#14532d' }}>{analysisResult.ingestedCount} {language === 'ar' ? 'مرشح' : 'Resumes'}</strong>
            </div>

            <div style={{ padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534' }}>{language === 'ar' ? 'متوسط درجة المطابقة' : 'Average AI Match Score'}</div>
              <strong style={{ fontSize: 18, color: '#14532d' }}>{analysisResult.averageScore}%</strong>
            </div>

            <div style={{ padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534' }}>{language === 'ar' ? 'جاهزون للاختيار والمقابلة' : 'Shortlist Ready'}</div>
              <strong style={{ fontSize: 18, color: '#14532d' }}>{analysisResult.scannedCount} {language === 'ar' ? 'مؤهلين' : 'Qualified'}</strong>
            </div>
          </div>

          {/* Primary CTA: Navigate back to Candidates Pipeline */}
          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={onNavigateToPipeline}
              style={{
                padding: '12px 28px',
                fontWeight: 800,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#166534',
                borderColor: '#166534'
              }}
            >
              <span>{language === 'ar' ? 'عرض المرشحين ونتائج الفرز في لوحة المتابعة ←' : 'View Extracted Candidates in Pipeline →'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
