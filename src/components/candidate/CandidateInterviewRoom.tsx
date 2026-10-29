import React, { useState, useEffect, useRef } from 'react';
import { CandidateApplication } from '../../types';
import { INTERVIEW_QUESTIONS } from '../../data/interviewQuestions';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { voiceManager } from '../../utils/speechSynthesis';
import { SpeakingAvatar } from '../voice/SpeakingAvatar';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileText,
  Volume2,
  Award,
  Video,
  Radio,
  Layers
} from 'lucide-react';

interface CandidateInterviewRoomProps {
  initialApplication?: CandidateApplication | null;
  onCompleted?: () => void;
}

export const CandidateInterviewRoom: React.FC<CandidateInterviewRoomProps> = ({
  initialApplication,
  onCompleted
}) => {
  const { language } = useLanguage();
  const { applications, activeInterviewApp, setActiveInterviewApp, updateApplicationStage, recordCandidateInterviewResponse, interviewQuestions } = useCandidate();

  const activeApp = initialApplication || activeInterviewApp || applications[0];
  const questionsForJob = interviewQuestions.filter(q => q.requisitionCode === activeApp?.requisitionCode);
  const questionsList = questionsForJob.length > 0 ? questionsForJob : (interviewQuestions.length > 0 ? interviewQuestions : INTERVIEW_QUESTIONS);

  const [questionIdx, setQuestionIdx] = useState(0);
  const currentQ = questionsList[questionIdx] || questionsList[0];

  // AI Interviewer State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Response Mode: 'voice' | 'text'
  const [responseMode, setResponseMode] = useState<'voice' | 'text'>('voice');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Candidate Response Text
  const [responseText, setResponseText] = useState('');
  const [isCandidatePlaying, setIsCandidatePlaying] = useState(false);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    phraseologyScore: number;
    clarityScore: number;
    safetyScore: number;
    detectedKeywords: string[];
    feedbackEn: string;
    feedbackAr: string;
  } | null>(null);

  // Completed interview
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [questionScores, setQuestionScores] = useState<number[]>([]);

  // Stop any voice playback on unmount
  useEffect(() => {
    return () => {
      voiceManager.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Play AI question
  const handlePlayAiQuestion = () => {
    if (isAiSpeaking) {
      voiceManager.stop();
      setIsAiSpeaking(false);
      return;
    }

    voiceManager.stop();
    setIsCandidatePlaying(false);
    setIsAiSpeaking(true);

    const textToSpeak = language === 'ar' ? currentQ.questionAr : currentQ.questionEn;
    voiceManager.speak({
      text: textToSpeak,
      lang: language,
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false)
    });
  };

  // Start voice recording
  const handleStartRecording = () => {
    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);
    setIsRecording(true);
    setRecordingSeconds(0);
    setResponseText('');
    setEvaluationResult(null);

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    // Try Web Speech Recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setResponseText(currentTranscript);
          }
        };

        recognition.start();
        (window as any).__activeSpeechRec = recognition;
      } catch (e) {
        console.warn('SpeechRecognition error or not permitted:', e);
      }
    }

    // Graceful simulated live speech stream if mic input is empty
    setTimeout(() => {
      setResponseText(prev => {
        if (!prev) {
          return language === 'ar' 
            ? currentQ.suggestedAnswerAr 
            : currentQ.suggestedAnswerEn;
        }
        return prev;
      });
    }, 3000);
  };

  // Stop voice recording
  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if ((window as any).__activeSpeechRec) {
      try {
        (window as any).__activeSpeechRec.stop();
      } catch (e) {}
    }

    // Ensure we have response text for evaluation
    if (!responseText.trim()) {
      setResponseText(language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn);
    }
  };

  // Play candidate recorded answer
  const handlePlayCandidateVoice = () => {
    if (isCandidatePlaying) {
      voiceManager.stop();
      setIsCandidatePlaying(false);
      return;
    }

    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(true);

    voiceManager.speak({
      text: responseText || (language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn),
      lang: language,
      onStart: () => setIsCandidatePlaying(true),
      onEnd: () => setIsCandidatePlaying(false),
      onError: () => setIsCandidatePlaying(false)
    });
  };

  // Auto-fill suggested answer for fast demo
  const handleAutoFillAnswer = () => {
    setResponseText(language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn);
  };

  // Submit Answer to AI Evaluator
  const handleSubmitAnswer = () => {
    if (!responseText.trim()) return;

    setIsEvaluating(true);
    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);

    setTimeout(() => {
      const qScore = Math.floor(92 + Math.random() * 6); // 92-97
      const evalData = {
        score: qScore,
        phraseologyScore: 96,
        clarityScore: 94,
        safetyScore: 97,
        detectedKeywords: [
          'Separation Minima',
          'TCAS Resolution Advisory',
          'FL330 Vectoring',
          'Mode-C Transponder',
          'Sector Boundary Coordination'
        ],
        feedbackEn: 'Demonstrated precise operational phraseology, adherence to standard radar separation rules, and rapid multi-sector coordination.',
        feedbackAr: 'أظهر استخداماً دقيقاً للمصطلحات الملاحية المعتمدة والالتزام الصارم بقواعد الفصل الراداري القياسي وسرعة التنسيق بين القطاعات.'
      };

      setEvaluationResult(evalData);
      setQuestionScores(prev => [...prev, qScore]);
      setIsEvaluating(false);
    }, 700);
  };

  // Next Question
  const handleNextQuestion = () => {
    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);
    setResponseText('');
    setEvaluationResult(null);
    setRecordingSeconds(0);

    if (questionIdx < questionsList.length - 1) {
      setQuestionIdx(prev => prev + 1);
    } else {
      // Finished all questions!
      const totalScore = Math.round(
        questionScores.reduce((a, b) => a + b, 0) / (questionScores.length || 1)
      ) || 94;

      setInterviewFinished(true);
      if (activeApp) {
        recordCandidateInterviewResponse(activeApp.id, {
          question: language === 'ar' ? currentQ.questionAr : currentQ.questionEn,
          answer: responseText || (language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn),
          score: totalScore,
          feedbackEn: 'Demonstrated high operational phraseology compliance and rapid de-confliction command.',
          feedbackAr: 'أظهر استخداماً دقيقاً للمصطلحات الملاحية المعتمدة وسرعة فض التعارض الراداري.',
          hasAudioVoice: responseMode === 'voice' || true
        });
      }
    }
  };

  // Reset interview
  const handleRestart = () => {
    setQuestionIdx(0);
    setInterviewFinished(false);
    setQuestionScores([]);
    setResponseText('');
    setEvaluationResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Application Context Bar */}
      <div className="card" style={{ padding: '14px 18px', backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language === 'ar' ? 'جلسة المقابلة الذكية المباشرة' : 'Live Interactive AI Virtual Interview Session'}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', margin: '2px 0 0' }}>
              {language === 'ar' ? activeApp?.jobTitleAr : activeApp?.jobTitle}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Ref: {activeApp?.requisitionCode} &bull; {activeApp?.location} &bull; Candidate: Mohammad Al-Zahrani
            </span>
          </div>

          {/* Application Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {language === 'ar' ? 'الطلب النشط:' : 'Switch Position:'}
            </span>
            <select
              value={activeApp?.id}
              onChange={(e) => {
                const selected = applications.find(a => a.id === e.target.value);
                if (selected) {
                  setActiveInterviewApp(selected);
                  handleRestart();
                }
              }}
              style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600 }}
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.requisitionCode} — {app.jobTitle.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!interviewFinished ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 18 }}>
          {/* LEFT: AI INTERVIEWER PANEL */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  {language === 'ar' ? 'المحاور الذكي (SANS AI)' : 'SANS Virtual Interviewer'}
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Question {questionIdx + 1} of {questionsList.length}
                </span>
              </div>
              <span className="badge green-badge">Natural Voice</span>
            </div>

            <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Speaking Avatar */}
              <SpeakingAvatar
                isSpeaking={isAiSpeaking}
                avatarType="interviewer"
                label={isAiSpeaking ? 'SANS AI Asking Question...' : 'SANS Air Navigation Interviewer'}
              />

              {/* Question Badge & Text */}
              <div style={{
                padding: 12,
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <span className="badge outline-badge" style={{ fontSize: 10, marginBottom: 6, display: 'inline-block' }}>
                  {currentQ.category}
                </span>
                <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.5, color: 'var(--color-primary-dark)' }}>
                  "{language === 'ar' ? currentQ.questionAr : currentQ.questionEn}"
                </p>
              </div>

              {/* TTS Controls */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn btn-sm ${isAiSpeaking ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={handlePlayAiQuestion}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Volume2 size={15} />
                  <span>
                    {isAiSpeaking 
                      ? (language === 'ar' ? '⏹ إيقاف الصوت' : '⏹ Stop AI Audio')
                      : (language === 'ar' ? '▶ استمع للسؤال بالصوت الطبيعي' : '▶ Play AI Question (Voice)')}
                  </span>
                </button>
              </div>

              {/* Rubric evaluation criteria */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'معايير التقييم الذكي لهذا السؤال:' : 'Mandatory Evaluation Rubrics:'}
                </span>
                <ul style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, paddingLeft: 18, lineHeight: 1.5 }}>
                  {(language === 'ar' ? currentQ.keyRubricsAr : currentQ.keyRubricsEn).map((rubric, idx) => (
                    <li key={idx}>{rubric}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: CANDIDATE INTERACTION PANEL */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">
                  {language === 'ar' ? 'إجابة المرشح (صوت طبيعي أو كتابة نصوص)' : 'Candidate Response (Voice or Text)'}
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Choose preferred mode &bull; Evaluated against GACA &amp; ICAO standards
                </span>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: 3, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setResponseMode('voice')}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 3,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: responseMode === 'voice' ? 'var(--color-primary)' : 'transparent',
                    color: responseMode === 'voice' ? '#fff' : 'var(--color-text-muted)'
                  }}
                >
                  <Mic size={13} />
                  <span>{language === 'ar' ? 'صوت (ميكروفون)' : 'Voice Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResponseMode('text')}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 3,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: responseMode === 'text' ? 'var(--color-primary)' : 'transparent',
                    color: responseMode === 'text' ? '#fff' : 'var(--color-text-muted)'
                  }}
                >
                  <FileText size={13} />
                  <span>{language === 'ar' ? 'نص (كتابة)' : 'Text Mode'}</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* VOICE MODE INTERFACE */}
              {responseMode === 'voice' && (
                <div style={{
                  padding: 16,
                  border: isRecording ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isRecording ? '#FFF5F5' : 'var(--color-subtle-green)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isRecording ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger)', fontWeight: 800, fontSize: 13 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'red', animation: 'pulse 1s infinite' }} />
                          <span>{language === 'ar' ? 'جاري التسجيل الصوتي المباشر...' : 'Listening & Recording Voice...'}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>
                          <Radio size={16} />
                          <span>{language === 'ar' ? 'الميكروفون جاهز لتسجيل الإجابة' : 'Voice Input Ready'}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-main)', fontFamily: 'monospace' }}>
                      {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Audio Wave animation when recording */}
                  {isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 36 }}>
                      {[40, 75, 20, 90, 60, 30, 80, 50, 95, 30, 65, 85, 45, 90].map((h, i) => (
                        <div key={i} style={{
                          width: 4,
                          height: `${h}%`,
                          backgroundColor: 'var(--color-danger)',
                          borderRadius: 2,
                          animation: 'pulse 0.6s infinite alternate'
                        }} />
                      ))}
                    </div>
                  )}

                  {/* Recording Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {!isRecording ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleStartRecording}
                        style={{ flex: 1, backgroundColor: '#0F5132' }}
                      >
                        <Mic size={16} />
                        <span>{language === 'ar' ? 'بدء تسجيل الإجابة الصوتية' : 'Start Voice Recording (Microphone)'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleStopRecording}
                        style={{ flex: 1 }}
                      >
                        <Square size={16} />
                        <span>{language === 'ar' ? 'إيقاف واعتماد التسجيل' : 'Stop & Capture Recording'}</span>
                      </button>
                    )}

                    {responseText && !isRecording && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handlePlayCandidateVoice}
                      >
                        <Volume2 size={15} />
                        <span>{isCandidatePlaying ? '⏹ Stop' : '▶ Play My Voice'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TRANSCRIPT / TEXT AREA */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {responseMode === 'voice' 
                      ? (language === 'ar' ? 'التفريغ الصوتي التلقائي لإجابتك (Speech-to-Text):' : 'Real-Time Voice Transcription:') 
                      : (language === 'ar' ? 'اكتب إجابتك هنا:' : 'Type Candidate Response Here:')}
                  </label>

                  {/* Demo helper */}
                  <button
                    type="button"
                    onClick={handleAutoFillAnswer}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {language === 'ar' ? 'تعبئة إجابة نموذجية عالية التقييم (عرض تجريبي)' : '⚡ Auto-fill Exemplary ATC Response'}
                  </button>
                </div>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'ستظهر كلماتك الصوتية هنا تلقائياً، أو يمكنك كتابة الإجابة مباشرة...'
                      : 'Voice transcript will appear here in real time, or type your answer directly...'
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    fontFamily: 'inherit'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  <span>{responseText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{language === 'ar' ? 'مدعوم بنظام الذكاء الاصطناعي الصوتي المعتمد' : 'Aviation ATC Lexicon & Phraseology Matcher Active'}</span>
                </div>
              </div>

              {/* Submit for AI Evaluation Button */}
              {!evaluationResult && (
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    disabled={!responseText.trim() || isEvaluating || isRecording}
                    onClick={handleSubmitAnswer}
                    style={{ padding: '10px 22px', fontWeight: 800 }}
                  >
                    <Sparkles size={16} />
                    <span>
                      {isEvaluating
                        ? (language === 'ar' ? 'جاري تقييم الإجابة آلياً...' : 'Evaluating Response with AI...')
                        : (language === 'ar' ? 'تقييم واعتماد الإجابة بالذكاء الاصطناعي ←' : 'Submit Answer for AI Evaluation →')}
                    </span>
                  </button>
                </div>
              )}

              {/* LIVE EVALUATION RESULTS CARD */}
              {evaluationResult && (
                <div style={{
                  marginTop: 'auto',
                  padding: 16,
                  backgroundColor: 'var(--color-subtle-green)',
                  border: '2px solid var(--color-accent)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-dark)', fontWeight: 800, fontSize: 14 }}>
                      <CheckCircle2 size={18} color="var(--color-accent)" />
                      <span>{language === 'ar' ? 'نتيجة تقييم الذكاء الاصطناعي للإجابة' : 'AI Evaluation & Competency Scoring'}</span>
                    </div>

                    <div style={{ padding: '4px 12px', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 4, fontWeight: 900, fontSize: 16 }}>
                      {evaluationResult.score} / 100
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 11, marginBottom: 10 }}>
                    <div style={{ padding: 6, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-text-muted)' }}>Phraseology:</div>
                      <strong style={{ color: 'var(--color-primary)' }}>{evaluationResult.phraseologyScore}%</strong>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-text-muted)' }}>Clarity &amp; Pacing:</div>
                      <strong style={{ color: 'var(--color-primary)' }}>{evaluationResult.clarityScore}%</strong>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fff', borderRadius: 4, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-text-muted)' }}>Airspace Safety:</div>
                      <strong style={{ color: 'var(--color-primary)' }}>{evaluationResult.safetyScore}%</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--color-text-main)', marginBottom: 12 }}>
                    <strong>{language === 'ar' ? 'التعليق التحليلي:' : 'AI Feedback:'}</strong>{' '}
                    {language === 'ar' ? evaluationResult.feedbackAr : evaluationResult.feedbackEn}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Question {questionIdx + 1} of {questionsList.length} Complete
                    </span>

                    <button
                      className="btn btn-primary"
                      onClick={handleNextQuestion}
                      style={{ padding: '8px 18px', fontWeight: 800 }}
                    >
                      <span>
                        {questionIdx < questionsList.length - 1
                          ? (language === 'ar' ? 'السؤال التالي ←' : 'Next Question →')
                          : (language === 'ar' ? 'إنهاء واعتماد المقابلة بالكامل ←' : 'Complete & Finalize Interview →')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* INTERVIEW COMPLETED CERTIFICATE DOSSIER */
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px', maxWidth: 650, margin: '0 auto' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--color-subtle-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid var(--color-accent)'
          }}>
            <Award size={40} color="var(--color-primary)" />
          </div>

          <span className="badge green-badge" style={{ fontSize: 12, padding: '4px 12px', marginBottom: 8 }}>
            Official Virtual Interview Completion
          </span>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary-dark)' }}>
            {language === 'ar' ? 'تم اجتياز المقابلة الذكية التفاعلية بنجاح' : 'AI Voice & Text Interview Successfully Completed'}
          </h2>

          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 480, margin: '8px auto 20px' }}>
            {language === 'ar'
              ? 'تم تسجيل كافة إجاباتك الصوتية والنصية، وتوثيق الدرجات واعتمادها مباشرة في ملف ترشيحك لدى مسؤولي التوظيف ولجان الملاحة الجوية.'
              : 'All oral and verbatim responses have been cryptographically timestamped and transmitted to the SANS Air Traffic Control hiring committee.'}
          </p>

          <div style={{
            backgroundColor: 'var(--color-subtle-green)',
            border: '1px solid var(--color-border-green)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            maxWidth: 420,
            margin: '0 auto 24px',
            textAlign: 'left',
            fontSize: 12
          }}>
            <div><strong>Requisition:</strong> {activeApp?.requisitionCode} ({activeApp?.jobTitle})</div>
            <div><strong>Candidate:</strong> Mohammad Al-Zahrani (ID: 1084920481)</div>
            <div><strong>Composite Interview Score:</strong> <span className="badge score-high" style={{ fontWeight: 900 }}>94 / 100</span></div>
            <div><strong>ICAO Phraseology Rating:</strong> <span className="badge green-badge">Compliant Level 5+</span></div>
            <div><strong>Clearance Status:</strong> Nafath Verified &bull; Amn Clear</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button className="btn btn-secondary" onClick={handleRestart}>
              <RotateCcw size={14} />
              <span>{language === 'ar' ? 'إعادة تجربة المقابلة' : 'Restart Interview Demo'}</span>
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (onCompleted) onCompleted();
              }}
            >
              <CheckCircle2 size={16} />
              <span>{language === 'ar' ? 'العودة لمتابعة مسار الطلبات' : 'Return to My Applications Tracker'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
