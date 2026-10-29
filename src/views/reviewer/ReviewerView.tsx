import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { voiceManager } from '../../utils/speechSynthesis';
import { InterviewQuestionItem } from '../../types';
import { 
  BrainCircuit, 
  Quote, 
  FileCheck, 
  CheckCircle2, 
  Award, 
  Download, 
  Eye, 
  BookOpen, 
  Volume2, 
  Plus, 
  X, 
  Play, 
  Square, 
  Layers, 
  Sparkles, 
  Sliders, 
  Check, 
  Edit3, 
  Trash2,
  Clock,
  ShieldAlert,
  Zap,
  Briefcase,
  RotateCcw,
  FileText
} from 'lucide-react';

export const ReviewerView: React.FC = () => {
  const { 
    candidates, 
    interviewQuestions, 
    addInterviewQuestion, 
    updateInterviewQuestion, 
    deleteInterviewQuestion,
    generateQuestionsForJob,
    allRequisitions
  } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab } = useAuthRbac();

  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0].id);
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  // Job Posting Selection & AI Generation State (Section 4.2.1)
  const [selectedJobCode, setSelectedJobCode] = useState<string>('REQ-2026-084');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [showAiGenModal, setShowAiGenModal] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generationSuccessMessage, setGenerationSuccessMessage] = useState<string | null>(null);

  // Interview Questions state
  const [questionTypeFilter, setQuestionTypeFilter] = useState<'All' | 'Technical' | 'Situational' | 'Behavioral'>('All');
  const [playingQuestionId, setPlayingQuestionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestionItem | null>(null);

  // Add/Edit Form State
  const [formRequisitionCode, setFormRequisitionCode] = useState('REQ-2026-084');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState<'Technical' | 'Situational' | 'Behavioral'>('Technical');
  const [formCompetency, setFormCompetency] = useState('');
  const [formRoleFamily, setFormRoleFamily] = useState('Air Traffic Control (ATC)');
  const [formQuestionEn, setFormQuestionEn] = useState('');
  const [formQuestionAr, setFormQuestionAr] = useState('');
  const [formAnswerEn, setFormAnswerEn] = useState('');
  const [formAnswerAr, setFormAnswerAr] = useState('');
  const [formRubricsEn, setFormRubricsEn] = useState('');
  const [formDuration, setFormDuration] = useState(120);
  const [formMandatory, setFormMandatory] = useState(true);
  const [formDifficulty, setFormDifficulty] = useState<'Standard' | 'Advanced' | 'Expert'>('Advanced');

  const targetRequisition = allRequisitions.find(r => r.code === selectedJobCode || r.id === selectedJobCode) || allRequisitions[0];

  const questionsForJob = interviewQuestions.filter(q => {
    if (selectedJobCode === 'ALL') return true;
    if (q.requisitionCode) {
      return q.requisitionCode === selectedJobCode;
    }
    return selectedJobCode === 'REQ-2026-084';
  });

  const filteredQuestions = questionsForJob.filter(q => {
    if (questionTypeFilter === 'All') return true;
    return q.questionType === questionTypeFilter;
  });

  const handleTriggerAiGeneration = () => {
    setShowAiGenModal(true);
    setIsGeneratingAi(true);
    setGenerationStep(1);

    setTimeout(() => {
      setGenerationStep(2);
      setTimeout(() => {
        setGenerationStep(3);
        setTimeout(() => {
          setGenerationStep(4);
          setTimeout(() => {
            setGenerationStep(5);
            const generated = generateQuestionsForJob(selectedJobCode);
            setIsGeneratingAi(false);
            setGenerationSuccessMessage(
              language === 'ar'
                ? `تم توليد واعتماد ${generated.length} أسئلة مقابلة ذكية لوظيفة (${targetRequisition.titleAr}) بنجاح!`
                : `Successfully AI-generated ${generated.length} specialized interview scenarios for (${targetRequisition.title})!`
            );
            setTimeout(() => setGenerationSuccessMessage(null), 6000);
          }, 450);
        }, 450);
      }, 450);
    }, 450);
  };

  const handlePlayVoice = (q: InterviewQuestionItem, lang: 'en' | 'ar') => {
    if (playingQuestionId === `${q.id}-${lang}`) {
      voiceManager.stop();
      setPlayingQuestionId(null);
      return;
    }
    const text = lang === 'ar' ? q.questionAr : q.questionEn;
    setPlayingQuestionId(`${q.id}-${lang}`);
    voiceManager.speak({
      text,
      lang,
      onEnd: () => setPlayingQuestionId(null),
      onError: () => setPlayingQuestionId(null)
    });
  };

  const handleOpenAdd = () => {
    setFormCategory('');
    setFormRequisitionCode(selectedJobCode === 'ALL' ? 'REQ-2026-084' : selectedJobCode);
    setFormType('Technical');
    setFormCompetency('');
    setFormRoleFamily(targetRequisition.department || 'Air Traffic Control (ATC)');
    setFormQuestionEn('');
    setFormQuestionAr('');
    setFormAnswerEn('');
    setFormAnswerAr('');
    setFormRubricsEn('');
    setFormDuration(120);
    setFormMandatory(true);
    setFormDifficulty('Advanced');
    setEditingQuestion(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (q: InterviewQuestionItem) => {
    setEditingQuestion(q);
    setFormCategory(q.category);
    setFormRequisitionCode(q.requisitionCode || selectedJobCode);
    setFormType(q.questionType || 'Technical');
    setFormCompetency(q.competency || '');
    setFormRoleFamily(q.roleFamily || 'Air Traffic Control (ATC)');
    setFormQuestionEn(q.questionEn);
    setFormQuestionAr(q.questionAr);
    setFormAnswerEn(q.suggestedAnswerEn);
    setFormAnswerAr(q.suggestedAnswerAr);
    setFormRubricsEn(q.keyRubricsEn.join('\n'));
    setFormDuration(q.durationSeconds || 120);
    setFormMandatory(q.mandatory ?? true);
    setFormDifficulty(q.difficulty || 'Advanced');
    setShowAddModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionEn || !formCategory) return;

    const rubricsArray = formRubricsEn.split('\n').filter(r => r.trim().length > 0);
    const targetJob = allRequisitions.find(r => r.code === formRequisitionCode) || targetRequisition;

    if (editingQuestion) {
      updateInterviewQuestion(editingQuestion.id, {
        category: formCategory,
        requisitionCode: formRequisitionCode,
        jobTitle: targetJob.title,
        questionType: formType,
        competency: formCompetency,
        roleFamily: formRoleFamily,
        questionEn: formQuestionEn,
        questionAr: formQuestionAr || formQuestionEn,
        suggestedAnswerEn: formAnswerEn,
        suggestedAnswerAr: formAnswerAr || formAnswerEn,
        keyRubricsEn: rubricsArray.length ? rubricsArray : ['Clear phraseology', 'Technical accuracy'],
        durationSeconds: formDuration,
        mandatory: formMandatory,
        difficulty: formDifficulty
      });
    } else {
      addInterviewQuestion({
        category: formCategory,
        requisitionCode: formRequisitionCode,
        jobTitle: targetJob.title,
        questionType: formType,
        competency: formCompetency,
        roleFamily: formRoleFamily,
        questionEn: formQuestionEn,
        questionAr: formQuestionAr || formQuestionEn,
        suggestedAnswerEn: formAnswerEn,
        suggestedAnswerAr: formAnswerAr || formAnswerEn,
        keyRubricsEn: rubricsArray.length ? rubricsArray : ['Clear phraseology', 'Technical accuracy'],
        keyRubricsAr: ['دقة المصطلحات الملاحية', 'سرعة الاستجابة ووضوح الإجراء'],
        durationSeconds: formDuration,
        mandatory: formMandatory,
        difficulty: formDifficulty,
        aiGenerated: false
      });
    }
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'مركز تقييم الكفاءات والاختبارات (Mercer Assessment Hub)' : 'Assessment Reviewer Hub — Mercer Cognitive & Verbatim Evaluation'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'دمج نتائج اختبارات القدرات العقلية لميرسر، وتحليل الاقتباسات الصوتية الدقيقة للمرشحين'
              : 'Consolidation of Mercer cognitive/psychometric percentiles and verbatim candidate speech evidence.'}
          </p>
        </div>
      </div>

      {/* 1. MERCER COGNITIVE & PSYCHOMETRIC REPORTS */}
      {(activeNavTab === 'reviewer_dashboard' || activeNavTab === 'mercer_integration' || !activeNavTab) && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'نتائج اختبارات ميرسر المعرفية والسلوكية المدمجة' : 'Mercer Assessment Provider Result Consolidation'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Direct API Webhook Ingestion &bull; Provider: Mercer Talent Alliances (SANS Master Agreement)
              </span>
            </div>
            <span className="badge green-badge">Provider: Mercer (Active)</span>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'المرشح' : 'Candidate'}</th>
                  <th>{language === 'ar' ? 'القدرات المعرفية (Mercer)' : 'Cognitive Reasoning'}</th>
                  <th>{language === 'ar' ? 'مواءمة السلامة والتحمل' : 'Stress & Safety Factor'}</th>
                  <th>{language === 'ar' ? 'درجة المقابلة الشفهية' : 'Oral Interview'}</th>
                  <th>{language === 'ar' ? 'النتيجة المركبة' : 'Composite Assessment'}</th>
                  <th>{language === 'ar' ? 'الملف' : 'Dossier'}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(cand => (
                  <tr key={cand.id}>
                    <td>
                      <strong>{language === 'ar' ? cand.nameAr : cand.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cand.id}</div>
                    </td>
                    <td>
                      <span className="badge green-badge">
                        {cand.mercerPercentile}th Percentile
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>
                        {cand.mercerPercentile >= 80 ? 'Superior (Low Risk)' : 'Acceptable'}
                      </strong>
                    </td>
                    <td>
                      <strong>{cand.virtualInterviewScore} / 100</strong>
                    </td>
                    <td>
                      <span className="badge score-high" style={{ fontWeight: 800 }}>
                        {Math.round((cand.mercerPercentile + cand.virtualInterviewScore + (cand.overrideScore ?? cand.rawMatchScore)) / 3)}%
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => alert(`Opening comprehensive psychometric & assessment dossier for ${cand.name}...`)}>
                        <Eye size={12} />
                        <span>View Pack</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INTERVIEW QUESTION BANK & RUBRICS (Section 4.2.1) */}
      {activeNavTab === 'interview_questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Job Posting Selector & AI Synthesis Hub */}
          <div className="card" style={{ padding: 18, backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                  {language === 'ar' ? 'تخصيص بنك الأسئلة حسب إعلان الوظيفة' : 'Requisition-Specific Question Bank'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  <Briefcase size={18} color="var(--color-primary)" />
                  <select
                    className="clean-input"
                    style={{ minWidth: 320, fontWeight: 700, fontSize: 13, borderColor: 'var(--color-primary)' }}
                    value={selectedJobCode}
                    onChange={(e) => setSelectedJobCode(e.target.value)}
                  >
                    <option value="ALL">
                      {language === 'ar' ? '✦ كافة الوظائف الشاغرة (عرض موحد)' : '✦ All SANS Job Requisitions (Combined Pool)'}
                    </option>
                    {allRequisitions.map(req => (
                      <option key={req.code} value={req.code}>
                        {req.code} — {language === 'ar' ? req.titleAr : req.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 800,
                    backgroundColor: '#0F5132',
                    borderColor: '#0F5132',
                    boxShadow: '0 2px 4px rgba(15, 81, 50, 0.25)',
                    padding: '8px 14px'
                  }}
                  onClick={handleTriggerAiGeneration}
                  disabled={isGeneratingAi}
                  title="Synthesize tailored interview scenarios using AI based on job requirements"
                >
                  <Zap size={15} color="#34D399" />
                  <span>
                    {isGeneratingAi
                      ? (language === 'ar' ? 'جاري توليد الأسئلة...' : 'Synthesizing Questions...')
                      : (language === 'ar' ? '⚡ توليد بنك الأسئلة بالذكاء الاصطناعي لهذه الوظيفة' : '⚡ Generate AI Interview Question Bank for this Job')}
                  </span>
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}
                  onClick={handleOpenAdd}
                >
                  <Plus size={14} />
                  <span>{language === 'ar' ? 'إضافة سؤال يدوي +' : 'Add Custom Question +'}</span>
                </button>
              </div>
            </div>

            {/* Requisition Snapshot Sub-card */}
            {selectedJobCode !== 'ALL' && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                backgroundColor: 'var(--color-subtle-green)',
                border: '1px solid var(--color-border-green)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                fontSize: 11
              }}>
                <div>
                  <strong>{language === 'ar' ? targetRequisition.titleAr : targetRequisition.title}</strong> &bull; {targetRequisition.code} &bull; {targetRequisition.location}
                  <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Requirements: {targetRequisition.requirements?.slice(0, 2).join(' • ') || 'SANS Operational Criteria'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="badge green-badge">
                    {questionsForJob.length} {language === 'ar' ? 'أسئلة معتمدة للوظيفة' : 'Questions Active for this Job'}
                  </span>
                  <span className="badge outline-badge">
                    {questionsForJob.filter(q => q.mandatory).length} Mandatory
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {generationSuccessMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#065F46',
              fontSize: 13,
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{generationSuccessMessage}</span>
            </div>
          )}

          {/* Quick Filter & Stats Row */}
          <div className="card" style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['All', 'Technical', 'Situational', 'Behavioral'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setQuestionTypeFilter(type)}
                    className={`btn btn-sm ${questionTypeFilter === type ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                  >
                    {type === 'All' ? (language === 'ar' ? `الكل (${questionsForJob.length})` : `All (${questionsForJob.length})`) : type}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span className="badge green-badge">Bilingual TTS Active</span>
                <span className="badge outline-badge">{questionsForJob.filter(q => q.mandatory).length} Mandatory Scenarios</span>
              </div>
            </div>
          </div>

          {/* Question Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredQuestions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <BookOpen size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  {language === 'ar' ? 'لا توجد أسئلة مقابلة مضافة لهذه الوظيفة حتى الآن' : 'No interview questions configured yet for this job posting.'}
                </h4>
                <p style={{ fontSize: 12, maxWidth: 500, margin: '6px auto 16px' }}>
                  {language === 'ar' 
                    ? 'يمكنك توليد بنك أسئلة متخصص فوراً بالذكاء الاصطناعي بناءً على متطلبات الوظيفة والمعايير الملاحية أو إضافة سؤال يدوياً.' 
                    : 'Click below to synthesize a tailored ICAO-compliant question bank with AI, or manually configure custom scenarios.'}
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={handleTriggerAiGeneration}
                  >
                    <Zap size={14} color="#34D399" />
                    <span>{language === 'ar' ? '⚡ توليد بنك الأسئلة بالذكاء الاصطناعي' : '⚡ Generate with AI Now'}</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleOpenAdd}
                  >
                    <Plus size={14} />
                    <span>{language === 'ar' ? 'إضافة سؤال يدوي' : 'Add Custom Question'}</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isPlayingEn = playingQuestionId === `${q.id}-en`;
                const isPlayingAr = playingQuestionId === `${q.id}-ar`;

                return (
                  <div key={q.id} className="card" style={{ padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                            #{idx + 1} &bull; {q.category}
                          </span>
                          <span className={`badge ${q.questionType === 'Technical' ? 'green-badge' : q.questionType === 'Situational' ? 'score-high' : 'score-mid'}`} style={{ fontSize: 10 }}>
                            {q.questionType || 'Technical'}
                          </span>
                          {q.aiGenerated !== false ? (
                            <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Zap size={10} color="#059669" />
                              AI Generated (Section 4.2.1)
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: 10 }}>
                              Specialist Custom
                            </span>
                          )}
                          {q.requisitionCode && (
                            <span className="badge outline-badge" style={{ fontSize: 10 }}>
                              {q.requisitionCode}
                            </span>
                          )}
                          {q.mandatory && (
                            <span className="badge outline-badge" style={{ fontSize: 10, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                              ★ Mandatory
                            </span>
                          )}
                          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: 10 }}>
                            {q.difficulty || 'Advanced'} &bull; {q.durationSeconds || 120}s
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                          <strong>Competency Target:</strong> {q.competency || 'ICAO/SANS Aviation Operations'} &bull; <strong>Job Family:</strong> {q.roleFamily || 'Air Traffic Control'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className={`btn btn-sm ${isPlayingEn ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handlePlayVoice(q, 'en')}
                          title="Listen to AI virtual interviewer read this question in English"
                        >
                          <Volume2 size={13} />
                          <span>{isPlayingEn ? 'Stop Voice' : 'Test Voice (EN)'}</span>
                        </button>

                        <button
                          className={`btn btn-sm ${isPlayingAr ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handlePlayVoice(q, 'ar')}
                          title="Listen to AI virtual interviewer read this question in Arabic"
                        >
                          <Volume2 size={13} />
                          <span>{isPlayingAr ? 'إيقاف الصوت' : 'استماع (عربي)'}</span>
                        </button>

                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handleOpenEdit(q)}
                        >
                          <Edit3 size={13} />
                          <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                        </button>

                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: 11, color: '#B91C1C', borderColor: '#FCA5A5' }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove question #${idx + 1} from this job's question bank?`)) {
                              deleteInterviewQuestion(q.id);
                            }
                          }}
                          title="Remove question from bank"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Question Content Box */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                          English Prompt (Spoken to Candidate)
                        </span>
                        <p style={{ fontSize: 12, color: 'var(--color-text-main)', marginTop: 4, lineHeight: 1.5 }}>
                          "{q.questionEn}"
                        </p>
                      </div>

                      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                          نص السؤال بالعربية (الموجه للمرشح)
                        </span>
                        <p style={{ fontSize: 12, color: 'var(--color-text-main)', marginTop: 4, lineHeight: 1.5, direction: 'rtl', textAlign: 'right' }}>
                          "{q.questionAr}"
                        </p>
                      </div>
                    </div>

                    {/* Rubric Evaluation Criteria & Benchmark Answer */}
                    <div style={{ marginTop: 12, padding: 12, backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                        {language === 'ar' ? 'معايير التقييم الخوارزمي ونموذج الإجابة المعيارية (Scoring Rubrics):' : 'AI Scoring Rubrics & Benchmark Response Criteria:'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                        <div>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Target Benchmark Answer:</span>
                          <p style={{ fontSize: 11, color: 'var(--color-text-main)', fontStyle: 'italic', margin: '2px 0 0' }}>
                            "{q.suggestedAnswerEn}"
                          </p>
                        </div>

                        <div style={{ backgroundColor: 'var(--color-subtle-green)', padding: 8, borderRadius: 4, border: '1px solid var(--color-border-green)' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary-dark)' }}>Key Assessment Indicators:</span>
                          <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 10, color: 'var(--color-primary-dark)' }}>
                            {q.keyRubricsEn.map((rubric, rIdx) => (
                              <li key={rIdx}>{rubric}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. SPEECH & VERBATIM RUBRICS */}
      {activeNavTab === 'interview_rubrics' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'تحليل الأداء اللغوي والسلوكي واقتباسات المقابلة' : 'Speech & Verbatim Interview Rubrics'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Analysis of phraseology consistency, speech tempo, and high-stress decisiveness
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Candidate:</span>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: 12 }}
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ICAO Phraseology Accuracy:</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)' }}>96.4%</div>
                <span style={{ fontSize: 10, color: 'var(--color-accent)' }}>Standard Annex 10 compliant</span>
              </div>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Speech Pacing &amp; Tempo:</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)' }}>128 WPM</div>
                <span style={{ fontSize: 10, color: 'var(--color-accent)' }}>Optimal radio clarity</span>
              </div>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Hesitation &amp; Filler Ratio:</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)' }}>1.2%</div>
                <span style={{ fontSize: 10, color: 'var(--color-accent)' }}>Extremely low hesitation</span>
              </div>
            </div>

            {/* Verbatim Quote evidence */}
            <div style={{ padding: 16, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                <Quote size={16} />
                <span>Verbatim Audio Transcript Evidence ({selectedCandidate.name}):</span>
              </div>
              <blockquote style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-main)', fontStyle: 'italic', paddingLeft: 12, borderLeft: '3px solid var(--color-primary)' }}>
                "{selectedCandidate.interviewTranscript.answer}"
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONSOLIDATED DOSSIERS */}
      {activeNavTab === 'final_dossiers' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'الملفات التقييمية الشاملة وحزم الاعتماد' : 'Consolidated Assessment Dossier Packs'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Combined GACA licensing, Mercer psychometrics, and oral interview transcripts
              </span>
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {candidates.map(cand => (
                <div key={cand.id} style={{
                  padding: 16,
                  backgroundColor: 'var(--color-subtle-green)',
                  border: '1px solid var(--color-border-green)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                        {cand.name}
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Ref: {cand.id} &bull; {cand.currentTitle}</span>
                    </div>
                    <span className="badge green-badge">Dossier Signed</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--color-text-main)', margin: '10px 0' }}>
                    <div><strong>Mercer Cognitive:</strong> {cand.mercerPercentile}th Percentile</div>
                    <div><strong>Virtual Interview:</strong> {cand.virtualInterviewScore} / 100</div>
                    <div><strong>Clearances:</strong> Nafath &amp; GACA Verified</div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => alert(`Exporting official consolidated candidate dossier for ${cand.name}...`)}
                  >
                    <Download size={13} />
                    <span>Download Signed PDF Dossier</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT INTERVIEW QUESTION MODAL (Section 4.2.1) */}
      {showAddModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color="var(--color-primary)" />
                  {editingQuestion 
                    ? (language === 'ar' ? 'تعديل سيناريو المقابلة ومعايير التقييم' : 'Edit Interview Scenario & Scoring Rubric')
                    : (language === 'ar' ? 'إضافة سيناريو مقابلة جديد لبنك الأسئلة' : 'Configure New Interview Question & Rubric')}
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  SANS AI Virtual Interview Configuration Engine &bull; Section 4.2.1
                </span>
              </div>
              <button 
                className="btn btn-sm btn-outline" 
                style={{ padding: '4px 8px' }}
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  Target Job Posting (Requisition) *
                </label>
                <select
                  className="clean-input"
                  style={{ width: '100%' }}
                  value={formRequisitionCode}
                  onChange={(e) => {
                    setFormRequisitionCode(e.target.value);
                    const req = allRequisitions.find(r => r.code === e.target.value);
                    if (req) {
                      setFormRoleFamily(req.department || 'Air Traffic Control (ATC)');
                    }
                  }}
                >
                  {allRequisitions.map(req => (
                    <option key={req.id} value={req.code}>
                      {req.code} - {language === 'ar' ? req.titleAr : req.title} ({req.department})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Category Title (e.g. Airspace Emergency Depressurization) *
                  </label>
                  <input
                    type="text"
                    required
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Enter category name..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Question Type (Section 4.2.1)
                  </label>
                  <select
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Situational">Situational &amp; Emergency</option>
                    <option value="Behavioral">Behavioral &amp; CRM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Competency Framework Reference
                  </label>
                  <input
                    type="text"
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formCompetency}
                    onChange={(e) => setFormCompetency(e.target.value)}
                    placeholder="e.g. SANS SOP 4.2 / ICAO Annex 11"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Job Family
                  </label>
                  <select
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formRoleFamily}
                    onChange={(e) => setFormRoleFamily(e.target.value)}
                  >
                    <option value="Air Traffic Control (ATC)">Air Traffic Control (ATC)</option>
                    <option value="CNS Radar Engineering">CNS Radar Engineering</option>
                    <option value="Aeronautical Information (AIM)">Aeronautical Information (AIM)</option>
                    <option value="Aviation Cybersecurity">Aviation Cybersecurity</option>
                    <option value="Flight Safety & Quality">Flight Safety &amp; Quality</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  English Question Prompt (Spoken by AI Avatar to Candidate) *
                </label>
                <textarea
                  required
                  rows={3}
                  className="clean-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={formQuestionEn}
                  onChange={(e) => setFormQuestionEn(e.target.value)}
                  placeholder="Enter verbatim interview question in English..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  نص السؤال باللغة العربية (الموجه للمرشح في المقابلة)
                </label>
                <textarea
                  rows={2}
                  className="clean-input"
                  style={{ width: '100%', resize: 'vertical', direction: 'rtl', textAlign: 'right' }}
                  value={formQuestionAr}
                  onChange={(e) => setFormQuestionAr(e.target.value)}
                  placeholder="أدخل نص السؤال الملاحي بالعربية..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  Target / Benchmark Candidate Answer (Reference for AI Scoring Rubric)
                </label>
                <textarea
                  rows={2}
                  className="clean-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={formAnswerEn}
                  onChange={(e) => setFormAnswerEn(e.target.value)}
                  placeholder="Expected ideal response details, phraseology, and protocols..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  Key Rubric Indicators (One per line)
                </label>
                <textarea
                  rows={2}
                  className="clean-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={formRubricsEn}
                  onChange={(e) => setFormRubricsEn(e.target.value)}
                  placeholder="Immediate altitude separation&#10;TCAS coordination confirmation&#10;Boundary sector advisory"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Max Duration (Seconds)
                  </label>
                  <select
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value, 10))}
                  >
                    <option value={60}>60 Seconds</option>
                    <option value={90}>90 Seconds</option>
                    <option value={120}>120 Seconds (Standard)</option>
                    <option value={180}>180 Seconds</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    Difficulty Level
                  </label>
                  <select
                    className="clean-input"
                    style={{ width: '100%' }}
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                  <input
                    type="checkbox"
                    id="mandatory-toggle"
                    checked={formMandatory}
                    onChange={(e) => setFormMandatory(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                  />
                  <label htmlFor="mandatory-toggle" style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Mandatory Question
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={14} />
                  <span>{editingQuestion ? 'Save Changes' : 'Publish Question to Bank'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI QUESTION SYNTHESIS MODAL (Section 4.2.1) */}
      {showAiGenModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: 580,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
              padding: '20px 24px',
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={20} color="#34D399" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                    {language === 'ar' ? 'توليد بنك أسئلة المقابلة الذكية بالذكاء الاصطناعي' : 'AI Interview Question Bank Synthesis'}
                  </h3>
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)' }}>
                    ICAO Doc 9835 &bull; GACA Aviation Assessment Engine &bull; Section 4.2.1
                  </span>
                </div>
              </div>
              <div style={{
                marginTop: 8,
                padding: '6px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 4,
                fontSize: 11,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span><strong>Target Job:</strong> {targetRequisition.code} - {targetRequisition.title}</span>
                <span>{targetRequisition.location}</span>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Progress bar */}
              <div style={{
                height: 6,
                backgroundColor: '#E5E7EB',
                borderRadius: 3,
                overflow: 'hidden',
                marginBottom: 20
              }}>
                <div style={{
                  height: '100%',
                  width: `${(generationStep / 5) * 100}%`,
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {/* Steps list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { step: 1, text: 'Parsing SANS Job Description, ICAO Annex & GACA Competencies...' },
                  { step: 2, text: 'Synthesizing Technical & Separation Criteria Scenarios...' },
                  { step: 3, text: 'Generating High-Stress Situational & Airspace Emergency Drills...' },
                  { step: 4, text: 'Formulating Crew Resource Management (CRM) & Behavioral Prompts...' },
                  { step: 5, text: 'Calibrating Benchmark Rubrics & Arabic/English TTS Phrasing...' }
                ].map((s) => {
                  const isDone = generationStep > s.step || (!isGeneratingAi && generationStep === 5);
                  const isCurrent = generationStep === s.step && isGeneratingAi;

                  return (
                    <div key={s.step} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: isCurrent ? 'var(--color-subtle-green)' : 'transparent',
                      border: isCurrent ? '1px solid var(--color-border-green)' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: isDone ? '#10B981' : isCurrent ? 'var(--color-primary)' : '#E5E7EB',
                        color: isDone || isCurrent ? '#FFFFFF' : '#6B7280'
                      }}>
                        {isDone ? <Check size={12} /> : s.step}
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? 'var(--color-primary-dark)' : isDone ? 'var(--color-text-main)' : 'var(--color-text-muted)'
                      }}>
                        {s.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status / Done action */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                {isGeneratingAi ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                    <Zap size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                    <span>Synthesizing Question Bank with AI Engine...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 20,
                      color: '#065F46',
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={15} color="#059669" />
                      <span>Job Question Bank Successfully Generated &amp; Ready for Specialist Review!</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 24px', fontSize: 13 }}
                      onClick={() => setShowAiGenModal(false)}
                    >
                      <span>Review &amp; Edit Questions</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
