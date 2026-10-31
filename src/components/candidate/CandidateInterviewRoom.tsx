import React, { useState, useEffect, useRef } from 'react';
import { CandidateApplication } from '../../types';
import { INTERVIEW_QUESTIONS } from '../../data/interviewQuestions';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { voiceManager } from '../../utils/speechSynthesis';
import interviewerImg from '../../assets/interviewer.jpg';
import candidateImg from '../../assets/candidate.jpg';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileText,
  Volume2,
  ChevronDown,
  Activity,
  Check,
  Zap,
  PhoneOff,
  Video,
  VideoOff,
  MicOff,
  Share2,
  Settings,
  Maximize2,
  Clock,
  ShieldCheck,
  Award,
  Lightbulb,
  MessageSquare,
  BarChart2,
  Globe,
  Radio,
  ArrowRight,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface CandidateInterviewRoomProps {
  initialApplication?: CandidateApplication | null;
  onCompleted?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  senderName: string;
  time: string;
  text: string;
  hasAudio?: boolean;
}

export const CandidateInterviewRoom: React.FC<CandidateInterviewRoomProps> = ({
  initialApplication,
  onCompleted
}) => {
  const { language, setLanguage } = useLanguage();
  const { applications, activeInterviewApp, recordCandidateInterviewResponse, cancelInterviewDueToRuleViolation, interviewQuestions } = useCandidate();

  const activeApp = initialApplication || activeInterviewApp || applications[0];
  const questionsForJob = interviewQuestions.filter(q => q.requisitionCode === activeApp?.requisitionCode);
  const questionsList = questionsForJob.length > 0 ? questionsForJob : (interviewQuestions.length > 0 ? interviewQuestions : INTERVIEW_QUESTIONS);

  const [questionIdx, setQuestionIdx] = useState(0);
  const currentQ = questionsList[questionIdx] || questionsList[0];

  // AI Interviewer Speaking State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Call controls
  const [micEnabled, setMicEnabled] = useState(true);

  // Response Mode: 'voice' | 'text'
  const [responseMode, setResponseMode] = useState<'voice' | 'text'>('voice');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(23); // realistic initial value matching screenshot
  const timerRef = useRef<any>(null);

  // 5-minute remaining countdown timer (starts at 300 seconds = 00:05:00)
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  useEffect(() => {
    const sTimer = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(sTimer);
  }, []);

  // Candidate Response Text
  const [responseText, setResponseText] = useState('');
  const [isCandidatePlaying, setIsCandidatePlaying] = useState(false);

  // Navigation tabs
  const [leftTab, setLeftTab] = useState<'transcript' | 'history'>('transcript');
  const [rightTab, setRightTab] = useState<'evaluation' | 'transcript'>('evaluation');

  // Evaluation state: ONLY SHOWN AT END OF INTERVIEW AFTER SUBMISSION
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Proctoring: Rule Violation State (Tab switch, window minimize, or external app focus)
  const [isRuleViolated, setIsRuleViolated] = useState(Boolean(
    activeApp?.status === 'Interview Canceled' ||
    activeApp?.interviewCanceled ||
    activeApp?.ruleViolated
  ));
  const [violationTrigger, setViolationTrigger] = useState<string>(activeApp?.cancellationReason || '');

  // Active anti-cheating monitor: switches tabs, minimizes browser, or opens another application
  useEffect(() => {
    if (isEvaluated || isRuleViolated || !activeApp) return;

    const handleViolation = (eventDetail: string) => {
      if (isRuleViolated || isEvaluated) return;

      setIsRuleViolated(true);
      setViolationTrigger(eventDetail);

      // Stop any active recordings and audio
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      voiceManager.stop();
      setIsAiSpeaking(false);

      // Report cancellation & rule violation immediately to HR portal
      cancelInterviewDueToRuleViolation(activeApp.id, {
        en: `Rule Violated: Candidate navigated away from interview screen (${eventDetail}). Under SANS proctoring policy, session is terminated.`,
        ar: `مخالفة الشروط: قام المرشح بمغادرة نافذة المقابلة (${eventDetail}). تم إلغاء الجلسة فورياً وفق سياسة النزاهة والمراقبة.`
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Browser tab switched or window minimized');
      }
    };

    const handleWindowBlur = () => {
      handleViolation('Window lost focus / external application opened');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isEvaluated, isRuleViolated, activeApp, cancelInterviewDueToRuleViolation]);

  const handleTriggerDemoViolation = () => {
    if (!activeApp) return;
    setIsRuleViolated(true);
    setViolationTrigger('Simulated tab switch / external app focus (Demo)');
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    voiceManager.stop();
    setIsAiSpeaking(false);
    cancelInterviewDueToRuleViolation(activeApp.id, {
      en: 'Rule Violated: Candidate navigated away from interview screen (switched tabs, minimized browser, or opened an external application).',
      ar: 'مخالفة الشروط: قام المرشح بمغادرة شاشة المقابلة (تبديل التبويب أو تصغير المتصفح أو فتح تطبيق خارجي أثناء المقابلة).'
    });
  };

  // Chat / Live Transcript messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'interviewer',
      senderName: 'Interviewer',
      time: '10:24 AM',
      text: 'Can you tell us about your experience in air traffic control?'
    },
    {
      id: 'm-2',
      sender: 'candidate',
      senderName: 'Candidate',
      time: '10:25 AM',
      text: 'Sure, I have over 5 years of experience working in air traffic control at King Khalid International Airport, handling aerodrome tower ops and approach separation...',
      hasAudio: true
    },
    {
      id: 'm-3',
      sender: 'interviewer',
      senderName: 'Interviewer',
      time: '10:26 AM',
      text: 'Great. How do you handle high-pressure situations?'
    },
    {
      id: 'm-4',
      sender: 'candidate',
      senderName: 'Candidate',
      time: '10:27 AM',
      text: 'I stay calm, prioritize tasks, and communicate clearly using standard ICAO phraseology, ensuring safety buffers are maintained at all times.',
      hasAudio: true
    }
  ]);

  // Stop voice playback on unmount
  useEffect(() => {
    return () => {
      voiceManager.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds to HH:MM:SS
  const formatHms = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Play AI question speech
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
    setIsPaused(false);
    setRecordingSeconds(0);
    setResponseText('');

    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

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
        console.warn('SpeechRecognition not permitted or supported:', e);
      }
    }

    // Graceful simulated live speech stream if mic input is empty after 2.5s
    setTimeout(() => {
      setResponseText(prev => {
        if (!prev) {
          return language === 'ar' 
            ? currentQ.suggestedAnswerAr 
            : currentQ.suggestedAnswerEn;
        }
        return prev;
      });
    }, 2500);
  };

  // Pause / Resume recording
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const rec = (window as any).__activeSpeechRec;
    if (rec) {
      try { rec.stop(); } catch (e) { /* ignore */ }
    }
    if (!responseText.trim()) {
      setResponseText(language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn);
    }
  };

  // Play candidate answer audio
  const handlePlayCandidateResponse = () => {
    if (isCandidatePlaying) {
      voiceManager.stop();
      setIsCandidatePlaying(false);
      return;
    }

    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(true);

    const textToSpeak = responseText || (language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn);
    voiceManager.speak({
      text: textToSpeak,
      lang: language,
      onStart: () => setIsCandidatePlaying(true),
      onEnd: () => setIsCandidatePlaying(false),
      onError: () => setIsCandidatePlaying(false)
    });
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    // Add candidate response to live transcript if available
    if (responseText.trim()) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `cand-${Date.now()}`,
          sender: 'candidate',
          senderName: 'Candidate',
          time: nowStr,
          text: responseText,
          hasAudio: true
        }
      ]);
    }

    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);
    setResponseText('');
    setRecordingSeconds(0);
    setIsRecording(false);

    if (questionIdx < questionsList.length - 1) {
      const nextIdx = questionIdx + 1;
      setQuestionIdx(nextIdx);

      // Append interviewer question to transcript
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nextQ = questionsList[nextIdx];
      setMessages(prev => [
        ...prev,
        {
          id: `int-${Date.now()}`,
          sender: 'interviewer',
          senderName: 'Interviewer',
          time: nowStr,
          text: language === 'ar' ? nextQ.questionAr : nextQ.questionEn
        }
      ]);
    } else {
      // Reached end of questions, trigger final evaluation
      handleSubmitFinalEvaluation();
    }
  };

  // SUBMIT & SCORE ANSWER: Generates final AI Evaluation at end of interview
  const handleSubmitFinalEvaluation = () => {
    setIsEvaluating(true);
    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);

    // If candidate answered current question, save it to messages
    if (responseText.trim()) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `cand-${Date.now()}`,
          sender: 'candidate',
          senderName: 'Candidate',
          time: nowStr,
          text: responseText,
          hasAudio: true
        }
      ]);
    }

    setTimeout(() => {
      setIsEvaluating(false);
      setIsEvaluated(true);

      // Record completed score to candidate context
      if (activeApp) {
        recordCandidateInterviewResponse(activeApp.id, {
          question: language === 'ar' ? currentQ.questionAr : currentQ.questionEn,
          answer: responseText || currentQ.suggestedAnswerEn,
          score: 85,
          feedbackEn: 'Strong technical air traffic knowledge, clear radio communication, and high procedural safety compliance.',
          feedbackAr: 'معرفة تقنية متميزة في المراقبة الجوية، وضوح تام في الاتصال اللاسلكي، والتزام صارم ببروتوكولات السلامة.',
          hasAudioVoice: true
        });
      }
    }, 800);
  };

  // Fixed 32 audio waveform heights for equalizer visualizer
  const waveformHeights = [
    18, 30, 42, 55, 75, 45, 68, 92, 60, 38, 80, 95, 72, 50, 88, 76,
    58, 42, 65, 82, 48, 62, 38, 28, 52, 68, 44, 32, 22, 38, 18, 14
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#EAF0F6',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0F172A'
    }}>
      {/* 1. TOP HEADER BAR (MATCHING SCREENSHOT) */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Left: SANS Logo & HCM status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#042F20',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 16,
              padding: '6px 14px',
              borderRadius: 8,
              letterSpacing: 1
            }}>
              SANS
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                Saudi Air Navigation Services
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>
                AI Screening & Assessment Platform
              </div>
            </div>
          </div>

          {/* Oracle HCM status pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span>Oracle Fusion HCM Connected</span>
          </div>

          {/* Proctoring Status Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: isRuleViolated ? '#FEF2F2' : '#FFFBEB',
            border: `1px solid ${isRuleViolated ? '#FCA5A5' : '#FDE68A'}`,
            color: isRuleViolated ? '#991B1B' : '#92400E',
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRuleViolated ? '#DC2626' : '#D97706',
              boxShadow: isRuleViolated ? '0 0 6px #DC2626' : '0 0 6px #D97706'
            }} />
            <ShieldAlert size={13} color={isRuleViolated ? '#DC2626' : '#D97706'} />
            <span>
              {isRuleViolated
                ? (language === 'ar' ? '✕ تم إلغاء المقابلة (مخالفة الشروط)' : '✕ Interview Canceled (Rule Violated)')
                : (language === 'ar' ? '🛡️ المراقبة نشطة: تغيير التبويب أو التطبيق يلغي الجلسة' : '🛡️ Proctoring Active: Tab/Window switch cancels session')}
            </span>
            {!isRuleViolated && (
              <button
                onClick={handleTriggerDemoViolation}
                title="Test proctoring rule violation"
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  marginLeft: 4
                }}
              >
                Test Violation
              </button>
            )}
          </div>
        </div>

        {/* Right: Persona dropdown, Language pill & Candidate profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Persona selector pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#1E293B'
          }}>
            <Radio size={13} color="#059669" />
            <span>PERSONA: Mohammad Al-Zahrani (Candidate Portal)</span>
            <ChevronDown size={13} color="#64748B" />
          </div>

          {/* Language toggle pill */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <Globe size={13} color="#0F5132" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Candidate profile pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            padding: '4px 12px 4px 6px',
            borderRadius: 24
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 11
            }}>
              MZ
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                Mohammad Al-Zahrani
              </div>
              <div style={{ fontSize: 9.5, color: '#64748B' }}>
                Applicant - Senior ATC Specialist
              </div>
            </div>
            <ChevronDown size={12} color="#64748B" />
          </div>
        </div>
      </header>

      {/* 2. MAIN THREE-COLUMN WORKSPACE (MATCHING SCREENSHOT) */}
      <main style={{
        flex: 1,
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr 320px',
        gap: 16,
        alignItems: 'start',
        maxWidth: 1600,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ==================== LEFT COLUMN: LIVE TRANSCRIPT & SESSION INFO ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Card: Tabs & Message Thread */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 520
          }}>
            {/* Top Pill Tabs */}
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              gap: 8
            }}>
              <button
                onClick={() => setLeftTab('transcript')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: leftTab === 'transcript' ? '#0F5132' : '#F1F5F9',
                  color: leftTab === 'transcript' ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={13} />
                <span>Live Transcript</span>
              </button>

              <button
                onClick={() => setLeftTab('history')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: leftTab === 'history' ? '#0F5132' : '#F1F5F9',
                  color: leftTab === 'history' ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.2s'
                }}
              >
                <Clock size={13} />
                <span>History</span>
              </button>
            </div>

            {/* Message Thread with Timeline Avatars */}
            <div style={{
              flex: 1,
              padding: '16px 14px',
              overflowY: 'auto',
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'relative'
            }}>
              {/* Connecting vertical timeline line */}
              <div style={{
                position: 'absolute',
                top: 24,
                bottom: 24,
                left: 27,
                width: 2,
                backgroundColor: '#E2E8F0',
                zIndex: 1
              }} />

              {messages.map((msg) => {
                const isInterviewer = msg.sender === 'interviewer';
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 2 }}>
                    {/* Avatar Icon */}
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: isInterviewer ? '#042F20' : '#1E3A8A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isInterviewer ? '2px solid #10B981' : '2px solid #60A5FA',
                      flexShrink: 0
                    }}>
                      {isInterviewer ? <Volume2 size={13} color="#34D399" /> : <Mic size={13} color="#93C5FD" />}
                    </div>

                    {/* Speech Bubble & Metadata */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                          {msg.senderName}
                        </span>
                        <span style={{ fontSize: 10, color: '#94A3B8' }}>
                          {msg.time}
                        </span>
                      </div>

                      <div style={{
                        backgroundColor: isInterviewer ? '#E8F8F0' : '#EEF4FF',
                        border: isInterviewer ? '1px solid #C6F0DC' : '1px solid #D7E6FF',
                        borderRadius: 12,
                        padding: '10px 12px',
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: '#1E293B',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 8
                      }}>
                        <span>{msg.text}</span>
                        {msg.hasAudio && (
                          <Volume2 size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Live typing transcription preview while recording */}
              {isRecording && (
                <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mic size={13} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>
                      Candidate (Speaking Now...)
                    </div>
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 12,
                      color: '#991B1B',
                      fontStyle: 'italic',
                      lineHeight: 1.5
                    }}>
                      {responseText || 'Transcribing spoken words in real time...'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Session Info Card (Matching Screenshot) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 10 }}>
              <Clock size={13} />
              <span>Session Info</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left' }}>
              <div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: remainingSeconds <= 60 ? '#EF4444' : '#0F172A',
                  fontFamily: 'monospace'
                }}>
                  {formatHms(remainingSeconds)}
                </div>
                <div style={{ fontSize: 10.5, color: '#64748B' }}>
                  {language === 'ar' ? 'الوقت المتبقي' : 'Remaining Time'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  {questionIdx + 1} / {questionsList.length}
                </div>
                <div style={{ fontSize: 10.5, color: '#64748B' }}>
                  Questions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MIDDLE COLUMN: VIDEO FEEDS, CURRENT QUESTION & WAVEFORM ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Main Video Call Stage (Side-by-Side with Floating Dock) */}
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid #CBD5E1'
          }}>
            {/* Split Video Feeds Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              height: 380,
              backgroundColor: '#1E293B',
              gap: 2
            }}>
              
              {/* FEED 1: INTERVIEWER AVATAR IMAGE */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: 176,
                  height: 176,
                  borderRadius: '50%',
                  padding: 4,
                  background: isAiSpeaking ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: isAiSpeaking ? '0 0 24px rgba(16, 185, 129, 0.45), 0 8px 25px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={interviewerImg}
                    alt="Interviewer"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Top-left Pill Badge: ● Interviewer */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: isAiSpeaking ? '0 0 8px #34D399' : 'none'
                  }} />
                  <span>Interviewer</span>
                </div>
              </div>

              {/* FEED 2: CANDIDATE AVATAR IMAGE */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: 176,
                  height: 176,
                  borderRadius: '50%',
                  padding: 4,
                  background: isRecording ? 'linear-gradient(135deg, #38BDF8, #0284C7)' : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: isRecording ? '0 0 24px rgba(56, 189, 248, 0.45), 0 8px 25px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={candidateImg}
                    alt="Candidate"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Top-left Pill Badge: ● Candidate */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#38BDF8' }} />
                  <span>Candidate</span>
                </div>

                {/* Top-right Signal Bars */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: 12
                }}>
                  <div style={{ width: 3, height: 6, background: '#10B981', borderRadius: 1 }} />
                  <div style={{ width: 3, height: 9, background: '#10B981', borderRadius: 1 }} />
                  <div style={{ width: 3, height: 13, background: '#10B981', borderRadius: 1 }} />
                  <div style={{ width: 3, height: 16, background: '#10B981', borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* Floating Call Action Dock (Matching Screenshot) */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '8px 18px',
              borderRadius: 30,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
              zIndex: 10
            }}>
              {/* Mic Toggle */}
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: micEnabled ? 'rgba(255,255,255,0.15)' : '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

              {/* Video Camera Icon */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default'
                }}
                title="Avatar Feed Active"
              >
                <Video size={16} />
              </button>

              {/* Screen Share */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Share Screen"
              >
                <Share2 size={16} />
              </button>

              {/* Red End Call Button */}
              <button
                onClick={() => onCompleted?.()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                }}
                title="End Interview"
              >
                <PhoneOff size={20} />
              </button>

              {/* Settings */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Call Settings"
              >
                <Settings size={16} />
              </button>

              {/* Maximize */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Current Question Card (Matching Screenshot) */}
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Green circular wave icon button */}
              <button
                onClick={handlePlayAiQuestion}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                }}
                title="Listen to question"
              >
                <Volume2 size={20} />
              </button>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46', marginBottom: 2 }}>
                  Current Question
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                  {language === 'ar' ? currentQ.questionAr : currentQ.questionEn}
                </div>
              </div>
            </div>

            {/* Question X / Y Pill */}
            <div style={{
              backgroundColor: '#D1FAE5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              Question {questionIdx + 1} / {questionsList.length}
            </div>
          </div>

          {/* Audio Recording & Waveform Card (Matching Screenshot) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            padding: '14px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            {/* Left: Red recording dot + timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                animation: isRecording && !isPaused ? 'pulseRedDot 1s infinite' : 'none'
              }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                {formatHms(recordingSeconds)}
              </span>
            </div>

            {/* Center: Dynamic Animated Equalizer Waveform */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: 36,
              overflow: 'hidden'
            }}>
              {waveformHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3.5,
                    height: `${h}%`,
                    backgroundColor: isRecording ? '#059669' : '#CBD5E1',
                    borderRadius: 2,
                    animation: isRecording && !isPaused ? `audioWaveDance 0.8s ease-in-out infinite alternate ${i * 0.04}s` : 'none',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </div>

            {/* Right: Pause & Stop / Record Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isRecording ? (
                <>
                  <button
                    onClick={handleTogglePause}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      padding: '7px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {isPaused ? <Play size={12} fill="#0F172A" /> : <Pause size={12} />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleStopRecording}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#DC2626',
                      padding: '7px 16px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Square size={12} fill="#DC2626" />
                    <span>Stop Recording</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartRecording}
                  style={{
                    background: '#059669',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  <Mic size={14} />
                  <span>{language === 'ar' ? 'تسجيل الإجابة' : 'Record Answer'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: AI EVALUATION & COMPETENCIES ==================== */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 520
        }}>
          {/* Top Pill Tabs: AI Evaluation vs Transcript */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            gap: 8
          }}>
            <button
              onClick={() => setRightTab('evaluation')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: rightTab === 'evaluation' ? '#0F5132' : '#F1F5F9',
                color: rightTab === 'evaluation' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              <span>AI Evaluation</span>
            </button>

            <button
              onClick={() => setRightTab('transcript')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: rightTab === 'transcript' ? '#0F5132' : '#F1F5F9',
                color: rightTab === 'transcript' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              <span>Transcript</span>
            </button>
          </div>

          {/* Right Column Body */}
          <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
            
            {rightTab === 'evaluation' ? (
              isEvaluated ? (
                /* ================= STATE A: EVALUATED AT END OF INTERVIEW (MATCHING SCREENSHOT) ================= */
                <>
                  {/* Circular Arc Score Gauge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                    <svg width="200" height="120" viewBox="0 0 200 120">
                      <defs>
                        <linearGradient id="scoreArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                      {/* Background Track Arc */}
                      <path
                        d="M 30 105 A 70 70 0 1 1 170 105"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      {/* Colored Score Arc (85%) */}
                      <path
                        d="M 30 105 A 70 70 0 1 1 170 105"
                        fill="none"
                        stroke="url(#scoreArcGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="300"
                        strokeDashoffset={300 * (1 - 0.85)}
                        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                      />
                      <text x="100" y="75" textAnchor="middle" fontSize="32" fontWeight="900" fill="#0F172A">
                        85%
                      </text>
                      <text x="100" y="96" textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748B">
                        Overall Score
                      </text>
                    </svg>
                  </div>

                  {/* 4 Competency Progress Bars (Matching Screenshot) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Communication */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                          <MessageSquare size={14} color="#3B82F6" />
                          <span>Communication</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>90%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#EFF6FF', overflow: 'hidden' }}>
                        <div style={{ width: '90%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Technical Knowledge */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                          <ShieldCheck size={14} color="#10B981" />
                          <span>Technical Knowledge</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>88%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#ECFDF5', overflow: 'hidden' }}>
                        <div style={{ width: '88%', height: '100%', backgroundColor: '#10B981', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Problem Solving */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                          <Sparkles size={14} color="#8B5CF6" />
                          <span>Problem Solving</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>85%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#F5F3FF', overflow: 'hidden' }}>
                        <div style={{ width: '85%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                          <Award size={14} color="#F59E0B" />
                          <span>Confidence</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>82%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#FFFBEB', overflow: 'hidden' }}>
                        <div style={{ width: '82%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>

                  {/* Key Insights Card (Matching Screenshot) */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                      <Lightbulb size={14} color="#EAB308" />
                      <span>Key Insights</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <span>Strong technical knowledge</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <span>Clear communication</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <span>Confident responses</span>
                      </div>
                    </div>
                  </div>

                  {/* Completed Final Action Button */}
                  <button
                    onClick={() => onCompleted?.()}
                    style={{
                      backgroundColor: '#0F5132',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '12px 20px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(15, 81, 50, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Return to Candidate Portal</span>
                  </button>
                </>
              ) : (
                /* ================= STATE B: IN-PROGRESS (AI EVALUATION PENDING AT END) ================= */
                <>
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      border: '2px solid #A7F3D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <Sparkles size={24} color="#059669" />
                    </div>

                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      Assessment In Progress
                    </h4>
                    <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      Answer the scenario questions. Your complete AI Evaluation &amp; competency breakdown will be revealed upon final submission.
                    </p>

                    {/* Monitored Competencies Preview */}
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                        Monitored Competencies:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                        <span>• Verbal Communication &amp; ICAO Clarity</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>Monitoring</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                        <span>• Radar Conflict &amp; Separation Rules</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>Monitoring</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                        <span>• Situational Problem Solving</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>Monitoring</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                        <span>• Stress Discipline &amp; Confidence</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>Monitoring</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Next Question OR Submit & Score Answer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questionIdx < questionsList.length - 1 ? (
                      <>
                        <button
                          onClick={handleNextQuestion}
                          style={{
                            backgroundColor: '#0F5132',
                            border: 'none',
                            color: '#FFFFFF',
                            padding: '11px 18px',
                            borderRadius: 10,
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            boxShadow: '0 2px 8px rgba(15, 81, 50, 0.2)'
                          }}
                        >
                          <span>Next Question ({questionIdx + 1}/{questionsList.length})</span>
                          <ArrowRight size={14} />
                        </button>

                        <button
                          onClick={handleSubmitFinalEvaluation}
                          disabled={isEvaluating}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            padding: '9px 16px',
                            borderRadius: 10,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: isEvaluating ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          <CheckCircle2 size={13} color="#059669" />
                          <span>Submit &amp; Score Answer Now</span>
                        </button>
                      </>
                    ) : (
                      /* Big Green Submit Button on final question (Matching Screenshot) */
                      <button
                        onClick={handleSubmitFinalEvaluation}
                        disabled={isEvaluating}
                        style={{
                          backgroundColor: '#0F5132',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '12px 20px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: isEvaluating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: '0 4px 12px rgba(15, 81, 50, 0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>{isEvaluating ? 'Evaluating Responses...' : 'Submit & Score Answer →'}</span>
                      </button>
                    )}
                  </div>
                </>
              )
            ) : (
              /* ================= RIGHT TAB: TRANSCRIPT VIEW ================= */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                  Full Interview Log:
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  padding: 12,
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  color: '#334155',
                  overflowY: 'auto',
                  maxHeight: 380
                }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <strong style={{ color: m.sender === 'interviewer' ? '#047857' : '#1D4ED8' }}>
                        {m.senderName}:
                      </strong>{' '}
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 3. BOTTOM DARK DOCK (MATCHING SCREENSHOT) */}
      <footer style={{
        backgroundColor: '#131E2E',
        color: '#FFFFFF',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        borderTop: '1px solid #1E293B'
      }}>
        {/* Left: Mode selector pill & Review Recording button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Mode:</span>
            <button
              onClick={() => setResponseMode(prev => prev === 'voice' ? 'text' : 'voice')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Mic size={13} color="#34D399" />
              <span>{responseMode === 'voice' ? 'Voice Recording' : 'Written Text'}</span>
              <ChevronDown size={12} color="#94A3B8" />
            </button>
          </div>

          {/* Review Recording Button */}
          <button
            onClick={handlePlayCandidateResponse}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Play size={12} fill="#FFFFFF" />
            <span>Review Recording</span>
          </button>
        </div>

        {/* Right: Connection Status & Signal Bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span>Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 3, height: 6, background: '#10B981', borderRadius: 1 }} />
            <div style={{ width: 3, height: 9, background: '#10B981', borderRadius: 1 }} />
            <div style={{ width: 3, height: 12, background: '#10B981', borderRadius: 1 }} />
            <div style={{ width: 3, height: 16, background: '#10B981', borderRadius: 1 }} />
          </div>
        </div>
      </footer>

      {/* Rule Violation / Disqualification Modal Overlay */}
      {isRuleViolated && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.35)',
            border: '2px solid #EF4444',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FCA5A5',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}>
                <AlertTriangle size={24} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#991B1B' }}>
                  {language === 'ar' ? 'تم إنهاء المقابلة فوراً — تم رصد مخالفة أمنية' : 'Interview Terminated — Proctoring Rule Violated'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#B91C1C' }}>
                  {language === 'ar'
                    ? 'نظام مراقبة النزاهة في الملاحة الجوية السعودية (SANS Proctoring Engine)'
                    : 'SANS Automated Assessment Integrity & Anti-Cheating Protocol'}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{
                backgroundColor: '#FFF1F2',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 20
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9F1239', marginBottom: 6 }}>
                  {language === 'ar' ? 'تفاصيل المخالفة المسجلة:' : 'Incident Details Reported to HR:'}
                </div>
                <div style={{ fontSize: 13, color: '#881337', lineHeight: 1.5 }}>
                  <strong>{language === 'ar' ? 'السبب:' : 'Reason:'}</strong>{' '}
                  <span style={{ color: '#DC2626', fontWeight: 800 }}>Rule Violated</span>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#9F1239' }}>
                    {language === 'ar'
                      ? 'تم رصد مغادرة نافذة المقابلة (تغيير التبويب، تصغير المتصفح، أو فتح تطبيق خارجي). بموجب معايير الهيئة العامة للطيران المدني، تم إلغاء الجلسة واعتبار النتيجة غير مؤهل.'
                      : 'Candidate switched browser tabs, minimized browser window, or opened another application. Under SANS and ICAO safety regulations, navigating away during an active assessment is strictly prohibited.'}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: 14,
                border: '1px solid #E2E8F0',
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'حالة المقابلة في بوابة التوظيف' : 'HR Portal Status'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                    Interview Canceled
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'الرمز الأمني للتقرير' : 'Incident Ref #'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 2 }}>
                    SEC-PROCT-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                {language === 'ar'
                  ? 'تم إرسال هذا التقرير مباشرة إلى لوحة تحكم الموارد البشرية وإرفاقه بملف التقديم مع تسجيل سبب الإلغاء (Rule Violated). يمكنك العودة إلى بوابة المتقدمين أو التواصل مع مسؤول التوظيف.'
                  : 'This incident report has been submitted to the HR Workspace and attached to your application dossier with status "Interview Canceled" and reason "Rule Violated". You may now exit to the candidate portal.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                onClick={() => onCompleted?.()}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>{language === 'ar' ? 'العودة إلى بوابة المتقدمين' : 'Exit to Candidate Portal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
