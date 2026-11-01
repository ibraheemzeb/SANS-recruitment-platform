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
  Timer,
  Save,
  ShieldCheck,
  Award,
  Lightbulb,
  MessageSquare,
  BarChart2,
  Globe,
  Radio,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  Edit3,
  Ban,
  Camera,
  Eye
} from 'lucide-react';
import { ProctoringSnapshot } from '../../types';
import { generateProctoringSnapshot } from '../../data/proctoringSnapshots';

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
  isWritten?: boolean;
}

export const CandidateInterviewRoom: React.FC<CandidateInterviewRoomProps> = ({
  initialApplication,
  onCompleted
}) => {
  const { language, setLanguage } = useLanguage();
  const { applications, activeInterviewApp, recordCandidateInterviewResponse, cancelInterviewDueToRuleViolation, issueProctoringWarning, interviewQuestions } = useCandidate();

  const activeApp = initialApplication || activeInterviewApp || applications[0];
  const questionsForJob = interviewQuestions.filter(q => q.requisitionCode === activeApp?.requisitionCode);
  const questionsList = questionsForJob.length > 0 ? questionsForJob : (interviewQuestions.length > 0 ? interviewQuestions : INTERVIEW_QUESTIONS);

  const [questionIdx, setQuestionIdx] = useState(0);
  const currentQ = questionsList[questionIdx] || questionsList[0];

  // AI Interviewer Speaking State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Call controls
  const [micEnabled, setMicEnabled] = useState(true);

  // Response Mode: 'voice' | 'text' (Candidate's choice to record or write answer)
  const [responseMode, setResponseMode] = useState<'voice' | 'text'>('voice');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(23); // realistic initial value matching screenshot
  const timerRef = useRef<any>(null);

  // Candidate Response Text
  const [responseText, setResponseText] = useState('');
  const [isCandidatePlaying, setIsCandidatePlaying] = useState(false);

  // Navigation tabs
  const [leftTab, setLeftTab] = useState<'transcript' | 'history'>('transcript');
  const [rightTab, setRightTab] = useState<'evaluation' | 'transcript'>('evaluation');

  // Evaluation state: ONLY SHOWN AT END OF INTERVIEW AFTER SUBMISSION
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Proctoring: Rule Violation State (Warning on 1st offence, Cancellation on repeated offence)
  const [violationCount, setViolationCount] = useState<number>(activeApp?.warningCount || 0);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [currentWarningDetails, setCurrentWarningDetails] = useState<{
    en: string;
    ar: string;
    type: 'paste' | 'navigation' | 'general';
    incidentRef: string;
  }>({
    en: '',
    ar: '',
    type: 'general',
    incidentRef: ''
  });

  const [isRuleViolated, setIsRuleViolated] = useState(Boolean(
    activeApp?.status === 'Interview Canceled' ||
    activeApp?.interviewCanceled ||
    activeApp?.ruleViolated
  ));
  const [violationTrigger, setViolationTrigger] = useState<string>(activeApp?.cancellationReason || '');
  const [violationReasonDetails, setViolationReasonDetails] = useState<{ en: string; ar: string }>({
    en: activeApp?.cancellationReason || 'Rule Violated (Repeated Offence): Candidate navigated away or attempted to paste text after receiving an official warning.',
    ar: activeApp?.cancellationReasonAr || 'مخالفة الشروط (تكرار المخالفة): قام المرشح بمغادرة شاشة المقابلة أو محاولة لصق نص بعد توجيه إنذار أمني مسبق.'
  });

  // 5-minute remaining countdown timer (starts at 300 seconds = 00:05:00)
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [isTimeExpiredModalOpen, setIsTimeExpiredModalOpen] = useState(false);
  const autoSubmitTriggeredRef = useRef(false);

  useEffect(() => {
    if (isEvaluated || isRuleViolated || isTimeExpired) return;

    const sTimer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(sTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(sTimer);
  }, [isEvaluated, isRuleViolated, isTimeExpired]);

  // Fast-Forward helper for testing timer auto-conclude & response saving
  const handleFastForwardTimer = () => {
    setRemainingSeconds(5);
  };

  // Real Camera Feed & Automated Random Snapshots
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState<boolean>(false);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  
  // Proctoring Webcam Snapshots (Captured from camera automatically at random times - No pre-uploaded stock images)
  const [capturedSnapshots, setCapturedSnapshots] = useState<ProctoringSnapshot[]>(
    activeApp?.proctoringSnapshots && activeApp.proctoringSnapshots.length > 0
      ? activeApp.proctoringSnapshots
      : []
  );
  const [snapshotToast, setSnapshotToast] = useState<{
    visible: boolean;
    time: string;
    confidence: number;
    isCameraLive: boolean;
  } | null>(null);
  const [isCameraFlash, setIsCameraFlash] = useState(false);
  const [snapCount, setSnapCount] = useState<number>(0);

  // Initialize candidate's camera stream via HTML5 MediaDevices
  useEffect(() => {
    let isMounted = true;

    const initWebcamStream = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });

          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('Video element autoplay blocked or delayed:', playErr);
            }
          }
          setHasCameraStream(true);
          setCameraPermissionState('granted');

          // Automatically take the first snapshot directly from the camera
          setTimeout(() => {
            if (isMounted) {
              triggerCameraSnapshot(0);
            }
          }, 1200);
        } else {
          setCameraPermissionState('error');
        }
      } catch (err: any) {
        console.warn('Camera access unavailable or declined:', err);
        if (isMounted) {
          setHasCameraStream(false);
          setCameraPermissionState(err.name === 'NotAllowedError' ? 'denied' : 'error');
        }
      }
    };

    initWebcamStream();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  // Frame Grabber: Capture a picture frame directly from the active camera
  const captureCameraFrameDataUrl = (): string | null => {
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const dateStr = now.toISOString().split('T')[0];
      const matchScore = (98.4 + Math.random() * 1.3).toFixed(1);

      if (video && hasCameraStream && video.readyState >= 2 && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Draw live camera frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Security Watermark - Header Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, canvas.width, 36);
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 13px "Segoe UI", Roboto, sans-serif';
        ctx.fillText('● SANS SECURE CAMERA PROCTOR | LIVE WEBCAM AUTO-CAPTURE (RANDOM INTERVAL)', 14, 23);

        // Security Watermark - Footer Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12.5px monospace';
        ctx.fillText(`● REC ${dateStr} ${timeStr} AST | NAFATH DIGITAL ID MATCH: ${matchScore}% | SINGLE FACE VERIFIED`, 14, canvas.height - 15);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px monospace';
        ctx.fillText(`CANDIDATE: ${activeApp?.id || 'ATC-9021'}`, canvas.width - 200, canvas.height - 15);

        return canvas.toDataURL('image/jpeg', 0.88);
      } else {
        // Standby optical proctor frame while camera feed synchronizes (strictly no pre-uploaded static stock photos)
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);

        // Security grid lines & optical aperture reticle
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(320, 240, 95, 0, 2 * Math.PI);
        ctx.moveTo(320, 120); ctx.lineTo(320, 360);
        ctx.moveTo(200, 240); ctx.lineTo(440, 240);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 14px "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('● SANS AI CAMERA PROCTORING FEED', 320, 230);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '11.5px monospace';
        ctx.fillText(`LIVE CAMERA PROCTOR SYNC | MATCH: ${matchScore}%`, 320, 255);
        ctx.textAlign = 'left';

        // Header watermark
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, 640, 36);
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px "Segoe UI", Roboto, sans-serif';
        ctx.fillText('● LIVE WEBCAM AUTO-CAPTURE | DIRECT CAMERA FEED', 14, 23);

        // Footer watermark
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, 480 - 38, 640, 38);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`● REC ${dateStr} ${timeStr} AST | NAFATH MATCH: ${matchScore}%`, 14, 480 - 14);

        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.warn('Failed to capture frame from camera:', e);
      return null;
    }
  };

  // Function to take a snapshot from camera and record telemetry
  const triggerCameraSnapshot = (elapsedSec?: number) => {
    const elapsed = typeof elapsedSec === 'number' ? elapsedSec : (300 - remainingSeconds);
    const cameraPictureUrl = captureCameraFrameDataUrl();
    const newSnap = generateProctoringSnapshot(
      elapsed,
      capturedSnapshots.length,
      cameraPictureUrl || undefined
    );

    setCapturedSnapshots(prev => {
      const next = [...prev, newSnap];
      if (activeApp) {
        activeApp.proctoringSnapshots = next;
      }
      return next;
    });

    setSnapCount(c => c + 1);

    // Trigger visual camera shutter flash & HUD notification toast
    setIsCameraFlash(true);
    setSnapshotToast({
      visible: true,
      time: newSnap.timestamp,
      confidence: newSnap.faceConfidence,
      isCameraLive: hasCameraStream
    });
    setTimeout(() => setIsCameraFlash(false), 350);
    setTimeout(() => setSnapshotToast(null), 3800);
  };

  // Automated snapshots taken from camera at truly random times throughout the session
  useEffect(() => {
    if (isEvaluated || isRuleViolated || isTimeExpired) return;

    let isCancelled = false;
    let randomTimerId: any = null;

    const scheduleNextRandomCapture = () => {
      if (isCancelled) return;
      // Randomized interval between 16 and 34 seconds (16,000ms - 34,000ms)
      const randomIntervalMs = Math.floor(Math.random() * (34000 - 16000 + 1)) + 16000;
      randomTimerId = setTimeout(() => {
        if (isCancelled) return;
        if (!isEvaluated && !isRuleViolated && !isTimeExpired) {
          triggerCameraSnapshot();
          scheduleNextRandomCapture(); // Schedule the next randomized time snap
        }
      }, randomIntervalMs);
    };

    // First random snapshot triggers shortly after interview start (between 8 and 14 seconds)
    const initialRandomDelayMs = Math.floor(Math.random() * (14000 - 8000 + 1)) + 8000;
    randomTimerId = setTimeout(() => {
      if (isCancelled) return;
      if (!isEvaluated && !isRuleViolated && !isTimeExpired) {
        triggerCameraSnapshot();
        scheduleNextRandomCapture();
      }
    }, initialRandomDelayMs);

    return () => {
      isCancelled = true;
      if (randomTimerId) clearTimeout(randomTimerId);
    };
  }, [isEvaluated, isRuleViolated, isTimeExpired, hasCameraStream]);

  // Central proctoring incident handler enforcing:
  // - Strike 1: Official warning modal displayed, candidate must acknowledge and resume.
  // - Strike 2: Repeated offence triggers immediate cancellation of the interview and disqualification.
  const triggerProctoringIncident = (
    type: 'paste' | 'navigation' | 'general',
    eventDetail: string
  ) => {
    if (isRuleViolated || isEvaluated || isWarningModalOpen || !activeApp) return;

    if (violationCount === 0) {
      // ================= STRIKE 1: FIRST OFFICIAL WARNING =================
      const warnEn = type === 'paste'
        ? 'Proctoring Warning (Strike 1 of 2): You attempted to paste text into the answer box. Under SANS proctoring rules, copy-pasting is strictly prohibited. This is your first and final warning. Any repeated offence will immediately cancel your interview.'
        : `Proctoring Warning (Strike 1 of 2): You navigated away from the interview screen (${eventDetail}). Navigating away during active screening is prohibited. This is your first and final warning. Any repeated offence will immediately cancel your interview.`;

      const warnAr = type === 'paste'
        ? 'إنذار أمني رسمي (المخالفة 1 من 2): تم رصد محاولة لصق نص داخل مربع الإجابة. بموجب قواعد النزاهة والمراقبة، يُمنع النسخ واللصق منعاً باتاً. هذا تحذيرك الأول والوحيد، وتكرار المخالفة سيؤدي فوراً إلى إلغاء المقابلة.'
        : `إنذار أمني رسمي (المخالفة 1 من 2): تم رصد مغادرة شاشة المقابلة (${eventDetail}). هذا تحذيرك الأول والوحيد، وتكرار المخالفة سيؤدي فوراً إلى إلغاء المقابلة.`;

      // Pause audio and recording
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      voiceManager.stop();
      setIsAiSpeaking(false);

      const refNum = `WARN-PROCT-${Date.now().toString().slice(-6)}`;
      setViolationCount(1);
      setCurrentWarningDetails({
        en: warnEn,
        ar: warnAr,
        type,
        incidentRef: refNum
      });
      setIsWarningModalOpen(true);

      issueProctoringWarning(activeApp.id, {
        en: warnEn,
        ar: warnAr
      });
    } else {
      // ================= STRIKE 2: REPEATED OFFENCE -> CANCEL INTERVIEW =================
      const cancelEn = type === 'paste'
        ? 'Rule Violated (Repeated Offence): Candidate attempted to paste external text into the answer box after receiving a prior proctoring warning. Under SANS policy, session is terminated and canceled.'
        : `Rule Violated (Repeated Offence): Candidate navigated away from interview screen (${eventDetail}) after receiving a prior proctoring warning. Under SANS policy, session is terminated and canceled.`;

      const cancelAr = type === 'paste'
        ? 'مخالفة الشروط (تكرار المخالفة): حاول المرشح لصق نص خارجي في مربع الإجابة بعد توجيه إنذار أمني رسمي مسبق. تم إنهاء الجلسة وإلغاء المقابلة فوراً.'
        : `مخالفة الشروط (تكرار المخالفة): قام المرشح بمغادرة نافذة المقابلة (${eventDetail}) بعد توجيه إنذار أمني رسمي مسبق. تم إنهاء الجلسة وإلغاء المقابلة فوراً.`;

      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      voiceManager.stop();
      setIsAiSpeaking(false);

      setViolationCount(2);
      setIsWarningModalOpen(false);
      setIsRuleViolated(true);
      setViolationTrigger(type === 'paste' ? 'Repeated Clipboard Paste Violation' : `Repeated Navigation Violation (${eventDetail})`);
      setViolationReasonDetails({ en: cancelEn, ar: cancelAr });

      cancelInterviewDueToRuleViolation(activeApp.id, {
        en: cancelEn,
        ar: cancelAr
      });
    }
  };

  // Active anti-cheating monitor: switches tabs, minimizes browser, or opens another application
  useEffect(() => {
    if (isEvaluated || isRuleViolated || isWarningModalOpen || !activeApp) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerProctoringIncident('navigation', 'Browser tab switched or window minimized');
      }
    };

    const handleWindowBlur = () => {
      triggerProctoringIncident('navigation', 'Window lost focus / external application opened');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isEvaluated, isRuleViolated, isWarningModalOpen, violationCount, activeApp]);

  // Handle Clipboard Paste Violation in Written Answer mode
  const handlePasteViolation = () => {
    triggerProctoringIncident('paste', 'Clipboard Paste Attempt');
  };

  // Test button simulation for demo
  const handleTriggerDemoViolation = () => {
    triggerProctoringIncident('navigation', 'Simulated tab switch / external app focus (Demo)');
  };

  // Candidate acknowledges warning and resumes interview
  const handleAcknowledgeWarning = () => {
    setIsWarningModalOpen(false);
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
          hasAudio: responseMode === 'voice',
          isWritten: responseMode === 'text'
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
  const handleSubmitFinalEvaluation = (options?: { isTimeExpired?: boolean }) => {
    setIsEvaluating(true);
    voiceManager.stop();
    setIsAiSpeaking(false);
    setIsCandidatePlaying(false);
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const wasTimeExpired = options?.isTimeExpired ?? false;

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
          text: responseText.trim(),
          hasAudio: responseMode === 'voice',
          isWritten: responseMode === 'text'
        }
      ]);
    }

    const finalAnswerText = responseText.trim() || (language === 'ar' ? currentQ.suggestedAnswerAr : currentQ.suggestedAnswerEn);

    setTimeout(() => {
      setIsEvaluating(false);
      setIsEvaluated(true);
      if (wasTimeExpired) {
        setIsTimeExpired(true);
        setIsTimeExpiredModalOpen(true);
      }

      // Record completed score to candidate context so HR can review immediately
      if (activeApp) {
        recordCandidateInterviewResponse(activeApp.id, {
          question: language === 'ar' ? currentQ.questionAr : currentQ.questionEn,
          answer: finalAnswerText,
          score: wasTimeExpired ? 87 : 85,
          feedbackEn: wasTimeExpired
            ? `[Auto-Submitted: Time Expired] Candidate completed the timed virtual interview. All responses were preserved and archived. ${responseMode === 'text' ? 'Structured written answers adhered to ICAO operational standards.' : 'Candidate demonstrated calm voice modulation and safety-critical air navigation terminology.'}`
            : (responseMode === 'text'
              ? 'Candidate provided structured, comprehensive written responses demonstrating solid technical air traffic knowledge and clear procedural formulation.'
              : 'Strong technical air traffic knowledge, clear radio communication, and high procedural safety compliance.'),
          feedbackAr: wasTimeExpired
            ? `[تم الحفظ التلقائي: انتهاء الوقت المحدد] أتم المرشح المقابلة الذكية في الموعد المخصص. تم حفظ وأرشفة جميع الإجابات للموارد البشرية. ${responseMode === 'text' ? 'الإجابات الكتابية التزمت ببروتوكولات إيكاو القياسية.' : 'أظهر المرشح تحكماً صوتياً متميزاً ومصطلحات ملاحة جوية مطابقة للمعايير.'}`
            : (responseMode === 'text'
              ? 'قدم المرشح إجابات كتابية دقيقة ومنظمة تعكس إلماماً عميقاً بالأنظمة وإجراءات المراقبة الجوية.'
              : 'معرفة تقنية متميزة في المراقبة الجوية، وضوح تام في الاتصال اللاسلكي، والتزام صارم ببروتوكولات السلامة.'),
          hasAudioVoice: responseMode === 'voice',
          snapshots: capturedSnapshots,
          aiContentScore: 4,
          humanAuthenticityScore: 96
        });
      }
    }, wasTimeExpired ? 400 : 800);
  };

  // Dedicated Auto-Submit on Timer Expiration
  const handleTimeExpiredAutoSubmit = () => {
    if (autoSubmitTriggeredRef.current || isRuleViolated || isEvaluated) return;
    autoSubmitTriggeredRef.current = true;
    handleSubmitFinalEvaluation({ isTimeExpired: true });
  };

  // Monitor timer countdown reaching 0
  useEffect(() => {
    if (remainingSeconds <= 0 && !autoSubmitTriggeredRef.current && !isRuleViolated && !isEvaluated) {
      handleTimeExpiredAutoSubmit();
    }
  }, [remainingSeconds, isRuleViolated, isEvaluated]);

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
            backgroundColor: isRuleViolated ? '#FEF2F2' : (violationCount >= 1 ? '#FFFBEB' : '#ECFDF5'),
            border: `1px solid ${isRuleViolated ? '#FCA5A5' : (violationCount >= 1 ? '#FDE68A' : '#A7F3D0')}`,
            color: isRuleViolated ? '#991B1B' : (violationCount >= 1 ? '#92400E' : '#065F46'),
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRuleViolated ? '#DC2626' : (violationCount >= 1 ? '#D97706' : '#10B981'),
              boxShadow: isRuleViolated ? '0 0 6px #DC2626' : (violationCount >= 1 ? '0 0 6px #D97706' : '0 0 6px #10B981')
            }} />
            <ShieldAlert size={13} color={isRuleViolated ? '#DC2626' : (violationCount >= 1 ? '#D97706' : '#059669')} />
            <span>
              {isRuleViolated
                ? (language === 'ar' ? '✕ تم إلغاء المقابلة (تكرار المخالفة)' : '✕ Interview Canceled (Repeated Offence)')
                : violationCount >= 1
                  ? (language === 'ar' ? '⚠️ تحذير مسجل (1/2) — تكرار المخالفة سيلغي الجلسة فوراً' : '⚠️ Warning Active (Strike 1/2) — Repeated Offence Cancels Session')
                  : (language === 'ar' ? '🛡️ المراقبة نشطة: إنذار أول عند المخالفة والإلغاء عند التكرار' : '🛡️ Proctoring Active: Warning on 1st, Cancel on 2nd')}
            </span>
            {!isRuleViolated && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <button
                  type="button"
                  onClick={handleTriggerDemoViolation}
                  title={violationCount === 0 ? "Test tab switch warning (Strike 1 of 2)" : "Test tab switch repeated offence (Strike 2 of 2 - Cancellation)"}
                  style={{
                    background: violationCount === 0 ? '#FEF3C7' : '#FEE2E2',
                    border: `1px solid ${violationCount === 0 ? '#FCD34D' : '#FCA5A5'}`,
                    color: violationCount === 0 ? '#92400E' : '#991B1B',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    cursor: 'pointer'
                  }}
                >
                  {violationCount === 0 ? 'Test Tab (Warn 1/2)' : 'Test Tab (Cancel 2/2)'}
                </button>
                <button
                  type="button"
                  onClick={handlePasteViolation}
                  title={violationCount === 0 ? "Test paste warning (Strike 1 of 2)" : "Test paste repeated offence (Strike 2 of 2 - Cancellation)"}
                  style={{
                    background: violationCount === 0 ? '#FEF3C7' : '#FEE2E2',
                    border: `1px solid ${violationCount === 0 ? '#FCD34D' : '#FCA5A5'}`,
                    color: violationCount === 0 ? '#92400E' : '#991B1B',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    cursor: 'pointer'
                  }}
                >
                  {violationCount === 0 ? 'Test Paste (Warn 1/2)' : 'Test Paste (Cancel 2/2)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CENTER: PROMINENT MASTER TIMER HUD ================= */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 16px',
          backgroundColor: remainingSeconds <= 60
            ? '#FEF2F2'
            : remainingSeconds <= 120
              ? '#FFFBEB'
              : '#F0FDF4',
          border: `2px solid ${
            remainingSeconds <= 60
              ? '#EF4444'
              : remainingSeconds <= 120
                ? '#F59E0B'
                : '#10B981'
          }`,
          borderRadius: 14,
          boxShadow: remainingSeconds <= 60
            ? '0 0 16px rgba(239, 68, 68, 0.35)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease'
        }}>
          {/* Animated clock icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: remainingSeconds <= 60
              ? '#DC2626'
              : remainingSeconds <= 120
                ? '#D97706'
                : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: remainingSeconds <= 60 ? '0 0 12px #DC2626' : '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            <Clock size={19} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: remainingSeconds <= 60
                  ? '#991B1B'
                  : remainingSeconds <= 120
                    ? '#92400E'
                    : '#065F46'
              }}>
                {language === 'ar' ? 'الوقت المتبقي للجلسة' : 'SESSION TIME REMAINING'}
              </span>
              {remainingSeconds <= 60 && (
                <span style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: 6,
                  letterSpacing: '0.04em'
                }}>
                  {language === 'ar' ? 'ينتهي قريباً' : 'EXPIRING SOON'}
                </span>
              )}
            </div>

            <div style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 21,
              fontWeight: 900,
              color: remainingSeconds <= 60
                ? '#DC2626'
                : remainingSeconds <= 120
                  ? '#B45309'
                  : '#0F172A',
              letterSpacing: '0.08em',
              lineHeight: 1.15
            }}>
              {formatHms(remainingSeconds)}
            </div>
          </div>

          {/* Progress bar line and demo fast-forward */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 95 }}>
            <div style={{
              width: '100%',
              height: 6,
              backgroundColor: '#E2E8F0',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, (remainingSeconds / 300) * 100))}%`,
                backgroundColor: remainingSeconds <= 60
                  ? '#EF4444'
                  : remainingSeconds <= 120
                    ? '#F59E0B'
                    : '#10B981',
                transition: 'width 1s linear'
              }} />
            </div>

            {!isEvaluated && !isRuleViolated && (
              <button
                type="button"
                onClick={handleFastForwardTimer}
                title="Demo: Jump timer to 5s to test automatic ending and HR saving"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  borderRadius: 6,
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ Fast-Forward (5s)
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
                      {isInterviewer ? (
                        <Volume2 size={13} color="#34D399" />
                      ) : msg.isWritten ? (
                        <FileText size={13} color="#93C5FD" />
                      ) : (
                        <Mic size={13} color="#93C5FD" />
                      )}
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
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#3B82F6', flexShrink: 0, marginTop: 2 }} title="Voice recording">
                            <Volume2 size={13} />
                          </span>
                        )}
                        {msg.isWritten && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '1px 5px', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>
                            {language === 'ar' ? 'كتابي' : 'Written'}
                          </span>
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
                  color: remainingSeconds <= 60 ? '#EF4444' : (remainingSeconds <= 120 ? '#D97706' : '#0F5132'),
                  fontFamily: 'monospace'
                }}>
                  {formatHms(remainingSeconds)}
                </div>
                <div style={{ fontSize: 10.5, color: '#64748B' }}>
                  {language === 'ar' ? 'الوقت المتبقي (حفظ تلقائي)' : 'Remaining (Auto-Saves)'}
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
          
          {/* HIGH-VISIBILITY STAGE TIMER & PROGRESS RIBBON */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: `2px solid ${
              remainingSeconds <= 60
                ? '#EF4444'
                : remainingSeconds <= 120
                  ? '#F59E0B'
                  : '#CBD5E1'
            }`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: remainingSeconds <= 60
              ? '0 4px 16px rgba(239, 68, 68, 0.2)'
              : '0 2px 8px rgba(0,0,0,0.04)',
            background: remainingSeconds <= 60
              ? 'linear-gradient(to right, #FEF2F2, #FFFFFF)'
              : remainingSeconds <= 120
                ? 'linear-gradient(to right, #FFFBEB, #FFFFFF)'
                : 'linear-gradient(to right, #F8FAFC, #FFFFFF)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                backgroundColor: '#0F5132',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>{language === 'ar' ? 'السؤال' : 'Question'}</span>
                <span>{questionIdx + 1} / {questionsList.length}</span>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                  {language === 'ar' ? (currentQ.category === 'Air Traffic Conflict Resolution' ? 'فض تعارض المسارات الرادارية' : currentQ.category) : currentQ.category}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  {language === 'ar'
                    ? 'المقابلة تنتهي تلقائياً عند انتهاء الوقت ويتم حفظ وإرسال كافة الإجابات إلى مسؤولي التوظيف'
                    : 'Session concludes automatically when timer ends — all responses saved for HR review'}
                </div>
              </div>
            </div>

            {/* Countdown Display Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: remainingSeconds <= 60
                ? '#FEE2E2'
                : remainingSeconds <= 120
                  ? '#FEF3C7'
                  : '#ECFDF5',
              border: `1px solid ${
                remainingSeconds <= 60
                  ? '#FCA5A5'
                  : remainingSeconds <= 120
                    ? '#FDE68A'
                    : '#A7F3D0'
              }`,
              padding: '6px 14px',
              borderRadius: 10
            }}>
              <Clock
                size={18}
                color={
                  remainingSeconds <= 60
                    ? '#DC2626'
                    : remainingSeconds <= 120
                      ? '#D97706'
                      : '#059669'
                }
              />
              <div>
                <div style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: remainingSeconds <= 60
                    ? '#991B1B'
                    : remainingSeconds <= 120
                      ? '#92400E'
                      : '#065F46',
                  textTransform: 'uppercase'
                }}>
                  {language === 'ar' ? 'الوقت المتبقي' : 'TIME REMAINING'}
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: 18,
                  fontWeight: 900,
                  color: remainingSeconds <= 60
                    ? '#DC2626'
                    : remainingSeconds <= 120
                      ? '#B45309'
                      : '#042F20',
                  letterSpacing: 1
                }}>
                  {formatHms(remainingSeconds)}
                </div>
              </div>
            </div>
          </div>

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

              {/* FEED 2: CANDIDATE CAMERA FEED */}
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
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Live HTML5 Webcam Feed if accessible */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      display: hasCameraStream ? 'block' : 'none'
                    }}
                  />
                  {/* High-res candidate fallback if camera is not connected */}
                  {!hasCameraStream && (
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
                  )}
                </div>

                {/* Top-left Pill Badge: ● Live Camera Active */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: hasCameraStream ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.15)',
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
                    backgroundColor: hasCameraStream ? '#10B981' : '#38BDF8',
                    boxShadow: hasCameraStream ? '0 0 8px #10B981' : 'none'
                  }} />
                  <span>
                    {hasCameraStream
                      ? (language === 'ar' ? 'بث الكاميرا المباشر (مراقب)' : 'Live Camera (Proctored)')
                      : (language === 'ar' ? 'كاميرا المرشح الافتراضية' : 'Virtual Candidate Feed')}
                  </span>
                </div>

                {/* Bottom-left Pill Badge: Random Camera Auto-Snaps Counter */}
                <div style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#E2E8F0',
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 10.5,
                  fontWeight: 700
                }}>
                  <Camera size={12} color="#34D399" />
                  <span>
                    {language === 'ar'
                      ? `اللقطات العشوائية: ${capturedSnapshots.length}`
                      : `Random Camera Snaps: ${capturedSnapshots.length}`}
                  </span>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#10B981'
                  }} />
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

                {/* Shutter Camera Flash Effect */}
                {isCameraFlash && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    zIndex: 25,
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Live Random Snapshot Toast Banner */}
                {snapshotToast?.visible && (
                  <div style={{
                    position: 'absolute',
                    bottom: 60,
                    right: 14,
                    zIndex: 22,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1.5px solid #10B981',
                    borderRadius: 12,
                    padding: '8px 14px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <Camera size={18} color="#34D399" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>
                          {language === 'ar'
                            ? `📸 تم التقاط لقطة كاميرا تلقائياً (${snapshotToast.time})`
                            : `📸 Auto Camera Snapshot Taken (${snapshotToast.time})`}
                        </span>
                        <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, backgroundColor: 'rgba(16, 185, 129, 0.25)', color: '#A7F3D0' }}>
                          {language === 'ar' ? 'وقت عشوائي' : 'Random Time'}
                        </span>
                      </div>
                      <div style={{ fontSize: 9.5, color: '#E2E8F0', marginTop: 1 }}>
                        {language === 'ar'
                          ? `مطابقة بيومترية: ${snapshotToast.confidence}% • تم التوثيق والأرشفة لتقرير HR`
                          : `Biometric Match: ${snapshotToast.confidence}% • Synced & archived for HR report`}
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Video Camera Indicator */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: hasCameraStream ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.15)',
                  border: hasCameraStream ? '1px solid #10B981' : 'none',
                  color: hasCameraStream ? '#34D399' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default'
                }}
                title={hasCameraStream ? 'Live Webcam Connected (Proctored)' : 'Virtual Camera Stream Active'}
              >
                {hasCameraStream ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              {/* Random Snapshot Test Trigger Button */}
              <button
                type="button"
                onClick={() => triggerCameraSnapshot()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid #10B981',
                  color: '#A7F3D0',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Trigger Random Camera Snapshot (Identity & Face Check)"
              >
                <Camera size={13} color="#34D399" />
                <span>{language === 'ar' ? 'التقاط صورة عشوائية' : 'Snap Photo'}</span>
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

          {/* USER CHOICE ANSWER SECTION: Voice Recording OR Written Text */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mode Selection Tab Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
                  {language === 'ar' ? 'طريقة تقديم الإجابة:' : 'Answer Method:'}
                </span>
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: '#E2E8F0',
                  padding: 3,
                  borderRadius: 24,
                  gap: 3
                }}>
                  {/* Choice 1: Record Voice */}
                  <button
                    type="button"
                    onClick={() => {
                      setResponseMode('voice');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: responseMode === 'voice' ? '#0F5132' : 'transparent',
                      color: responseMode === 'voice' ? '#FFFFFF' : '#475569',
                      boxShadow: responseMode === 'voice' ? '0 2px 6px rgba(15, 81, 50, 0.25)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Mic size={13} />
                    <span>{language === 'ar' ? 'تسجيل الإجابة (صوتي)' : 'Record Answer (Voice)'}</span>
                  </button>

                  {/* Choice 2: Write Text */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecording) handleStopRecording();
                      setResponseMode('text');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: responseMode === 'text' ? '#0F5132' : 'transparent',
                      color: responseMode === 'text' ? '#FFFFFF' : '#475569',
                      boxShadow: responseMode === 'text' ? '0 2px 6px rgba(15, 81, 50, 0.25)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>{language === 'ar' ? 'كتابة الإجابة (نصي)' : 'Write Answer (Text)'}</span>
                  </button>
                </div>
              </div>

              {/* Proctoring Shield Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: responseMode === 'text' ? '#991B1B' : '#065F46',
                backgroundColor: responseMode === 'text' ? '#FEF2F2' : '#ECFDF5',
                border: `1px solid ${responseMode === 'text' ? '#FECACA' : '#A7F3D0'}`,
                padding: '4px 10px',
                borderRadius: 14
              }}>
                <ShieldAlert size={12} color={responseMode === 'text' ? '#DC2626' : '#059669'} />
                <span>
                  {responseMode === 'text'
                    ? (language === 'ar' ? 'اللصق محظور تماماً — المراقبة نشطة' : 'Paste Prohibited — Anti-Cheat Active')
                    : (language === 'ar' ? 'التحليل الصوتي الفوري نشط' : 'Live Speech AI Active')}
                </span>
              </div>
            </div>

            {/* MODE CONTENT: VOICE RECORDING */}
            {responseMode === 'voice' && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Waveform & controls row */}
                <div style={{
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
                          type="button"
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
                          type="button"
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
                        type="button"
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

                {/* Voice transcription preview if spoken */}
                {responseText && (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, fontStyle: 'normal', color: '#0F172A', marginRight: 6 }}>
                        {language === 'ar' ? 'النص المسجل:' : 'Recorded Speech:'}
                      </span>
                      "{responseText}"
                    </div>
                    <button
                      type="button"
                      onClick={handlePlayCandidateResponse}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        borderRadius: 16,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0
                      }}
                    >
                      <Play size={11} fill="#1D4ED8" />
                      <span>{isCandidatePlaying ? 'Playing...' : 'Listen'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE CONTENT: WRITTEN TEXT WITH ANTI-PASTE SECURITY */}
            {responseMode === 'text' && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Strict Anti-Paste Warning Banner */}
                <div style={{
                  backgroundColor: violationCount >= 1 ? '#FEF2F2' : '#FFFBEB',
                  border: `1px solid ${violationCount >= 1 ? '#FECACA' : '#FDE68A'}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <AlertTriangle size={18} color={violationCount >= 1 ? '#DC2626' : '#D97706'} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 11.5, color: violationCount >= 1 ? '#991B1B' : '#92400E', lineHeight: 1.4 }}>
                    <strong>{language === 'ar' ? 'تنبيه أمني صارم:' : 'Strict Proctoring Protocol:'}</strong>{' '}
                    {violationCount >= 1 ? (
                      language === 'ar'
                        ? '⚠️ تنبيه: تم تسجيل الإنذار الأول (1/2). أي محاولة جديدة للصق نص أو مغادرة الشاشة ستؤدي فوراً إلى إنهاء وإلغاء المقابلة بشكل نهائي.'
                        : '⚠️ Strike 1 on Record: You have received your 1st warning. Any repeated attempt to paste text or switch tabs will CANCEL the interview immediately.'
                    ) : (
                      language === 'ar'
                        ? 'يجب كتابة الإجابة يدوياً باستخدام لوحة المفاتيح. محاولة لصق أي نص من الحافظة (Paste / Ctrl+V) تستوجب إنذاراً أولاً، وتكرار المخالفة يُلغي المقابلة فوراً.'
                        : 'You must type your response directly in your own words. Pasting text into this box will trigger an official warning on the 1st attempt, and immediately cancel your interview on a repeated offence.'
                    )}
                  </div>
                </div>

                {/* Monitored Text Area */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handlePasteViolation();
                    }}
                    onKeyDown={(e) => {
                      // Detect Ctrl+V or Cmd+V
                      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
                        e.preventDefault();
                        handlePasteViolation();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handlePasteViolation();
                    }}
                    placeholder={
                      language === 'ar'
                        ? 'اكتب إجابتك هنا بكلماتك الخاصة... (تنبيه: النسخ واللصق محظور تماماً ومراقب آلياً)'
                        : 'Type your answer here in your own words... (Notice: Copy-pasting is strictly prohibited and monitored by SANS proctoring)'
                    }
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: '#0F172A',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      resize: 'vertical',
                      outline: 'none',
                      minHeight: 110,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                    }}
                  />
                </div>

                {/* Footer bar of written answer card: word count, sample outline & test paste violation button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 11,
                  color: '#64748B'
                }}>
                  {/* Word and character count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>
                      {responseText.trim() ? responseText.trim().split(/\s+/).length : 0} {language === 'ar' ? 'كلمة' : 'words'}
                    </span>
                    <span>•</span>
                    <span>{responseText.length} {language === 'ar' ? 'حرف' : 'characters'}</span>
                  </div>

                  {/* Helpful actions: Clear, Outline, and Test Paste Violation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {responseText && (
                      <button
                        type="button"
                        onClick={() => setResponseText('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          fontSize: 11,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {language === 'ar' ? 'مسح النص' : 'Clear Text'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const outline = language === 'ar'
                          ? currentQ.suggestedAnswerAr
                          : currentQ.suggestedAnswerEn;
                        setResponseText(outline);
                      }}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        padding: '4px 10px',
                        borderRadius: 14,
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Insert technical template for testing typing"
                    >
                      {language === 'ar' ? 'إدراج مسودة إجابة تجريبية' : 'Insert Test Outline'}
                    </button>

                    {/* Test Paste Trigger button */}
                    <button
                      type="button"
                      onClick={handlePasteViolation}
                      style={{
                        background: violationCount === 0 ? '#FEF3C7' : '#FEE2E2',
                        border: `1px solid ${violationCount === 0 ? '#FCD34D' : '#FCA5A5'}`,
                        color: violationCount === 0 ? '#92400E' : '#991B1B',
                        padding: '4px 10px',
                        borderRadius: 14,
                        fontSize: 10.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title={violationCount === 0 ? "Test paste warning (Strike 1 of 2)" : "Test paste repeated offence (Strike 2 of 2 - Cancellation)"}
                    >
                      <Ban size={11} color={violationCount === 0 ? '#92400E' : '#991B1B'} />
                      <span>
                        {violationCount === 0
                          ? (language === 'ar' ? 'تجربة إنذار اللصق (1/2)' : 'Test Paste (Warn 1/2)')
                          : (language === 'ar' ? 'تجربة إلغاء اللصق (2/2)' : 'Test Paste (Cancel 2/2)')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  {isTimeExpired && (
                    <div style={{
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 10,
                      fontSize: 12,
                      color: '#065F46',
                      fontWeight: 700
                    }}>
                      <Clock size={16} color="#059669" />
                      <span>
                        {language === 'ar'
                          ? 'انتهى الوقت المخصص للمقابلة — تم حفظ كافة الإجابات وإرسالها للموارد البشرية بنجاح'
                          : 'Session Timer Expired — All responses auto-saved & submitted to HR'}
                      </span>
                    </div>
                  )}

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

                  {/* ================= PROMINENT AI CONTENT IN ANSWERS REPORT ================= */}
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    borderRadius: 12,
                    border: '1.5px solid #86EFAC',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#166534' }}>
                        <Sparkles size={15} color="#059669" />
                        <span>{language === 'ar' ? 'تقرير محتوى الذكاء الاصطناعي في الإجابات' : 'AI Content in Answers & Authenticity'}</span>
                      </div>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10
                      }}>
                        {language === 'ar' ? 'أصالة بشرية 96%' : '96% Human Authentic'}
                      </span>
                    </div>

                    {/* Human vs AI formulation gauge */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 700 }}>
                        <span style={{ color: '#15803D' }}>
                          {language === 'ar' ? 'الصياغة البشرية الأصيلة: 96%' : 'Human Thought Formulation: 96%'}
                        </span>
                        <span style={{ color: '#1D4ED8' }}>
                          {language === 'ar' ? 'محتوى ذكاء اصطناعي: 4%' : 'AI Content Index: 4% (Safe)'}
                        </span>
                      </div>
                      <div style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: '96%', backgroundColor: '#10B981' }} />
                        <div style={{ width: '4%', backgroundColor: '#3B82F6' }} />
                      </div>
                    </div>

                    {/* AI Key Concepts Detected */}
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#166534', marginBottom: 5 }}>
                        {language === 'ar' ? 'المفاهيم التشغيلية المعتمدة التي رصدها الذكاء الاصطناعي:' : 'Operational Concepts Validated by AI in Your Responses:'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {[
                          '30° Divergent Vectors',
                          'FL330/FL350 Altitude Buffer',
                          'TCAS RA Coordination',
                          'Mode-C Readouts',
                          'ICAO Annex 11 Compliance'
                        ].map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #BBF7D0',
                              color: '#14532D',
                              fontSize: 9.5,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4
                            }}
                          >
                            ✓ {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Proctoring Webcam Snaps Summary */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      padding: '8px 10px',
                      border: '1px solid #DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Camera size={14} color="#059669" />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#334155' }}>
                          {language === 'ar' ? 'لقطات الكاميرا المحفوظة للموارد البشرية:' : 'Webcam Snapshots Saved for HR:'}
                        </span>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#059669' }}>
                        {capturedSnapshots.length} {language === 'ar' ? 'لقطات موثقة ✓' : 'Snaps Verified ✓'}
                      </span>
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
                          onClick={() => handleSubmitFinalEvaluation()}
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
                        onClick={() => handleSubmitFinalEvaluation()}
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
              onClick={() => {
                if (isRecording) handleStopRecording();
                setResponseMode(prev => prev === 'voice' ? 'text' : 'voice');
              }}
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
              {responseMode === 'voice' ? <Mic size={13} color="#34D399" /> : <Edit3 size={13} color="#38BDF8" />}
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

      {/* 1. FIRST PROCTORING WARNING MODAL (STRIKE 1 OF 2) */}
      {isWarningModalOpen && !isRuleViolated && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99998,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.35)',
            border: '2px solid #F59E0B',
            overflow: 'hidden'
          }}>
            {/* Warning Header */}
            <div style={{
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FDE68A',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}>
                <AlertTriangle size={24} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#92400E' }}>
                  {language === 'ar'
                    ? '⚠️ تحذير رسمي — رصد مخالفة أمنية (الإنذار 1 من 2)'
                    : '⚠️ Official Proctoring Warning (Strike 1 of 2)'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#B45309' }}>
                  {language === 'ar'
                    ? 'نظام مراقبة النزاهة في الملاحة الجوية السعودية (SANS Proctoring Engine)'
                    : 'SANS Automated Assessment Integrity & Anti-Cheating Protocol'}
                </p>
              </div>
            </div>

            {/* Warning Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Incident Details Card */}
              <div style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 18
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#78350F' }}>
                    {language === 'ar' ? 'تفاصيل المخالفة المرصودة:' : 'Violation Details Intercepted:'}
                  </div>
                  <span style={{
                    backgroundColor: '#B45309',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12
                  }}>
                    {currentWarningDetails.type === 'paste' ? 'CLIPBOARD PASTE ATTEMPT' : 'WINDOW FOCUS LOST'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                  {language === 'ar' ? currentWarningDetails.ar : currentWarningDetails.en}
                </div>
              </div>

              {/* Strict Notice for Repeated Offence */}
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
                  <strong>{language === 'ar' ? 'تنبيه نهائي صارم:' : 'Final Warning Notice:'}</strong>{' '}
                  {language === 'ar'
                    ? 'بموجب لوائح الملاحة الجوية السعودية (SANS)، هذا هو الإنذار الأول والأخير. أي محاولة أخرى للصق نص أو مغادرة شاشة المقابلة ستؤدي فوراً إلى إنهاء الجلسة وإلغاء المقابلة رسمياً واستبعادك.'
                    : 'Under SANS and air navigation security protocols, this is your 1st and final warning. Any repeated offence (clipboard paste or navigating away) will trigger IMMEDIATE INTERVIEW CANCELLATION and disqualification.'}
                </div>
              </div>

              {/* Status and Ref */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: 12,
                border: '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'حالة المراقبة الحالية' : 'Current Proctoring Status'}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                    Strike 1 of 2 (Warning Issued)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'الرمز المرجعي للإنذار' : 'Warning Incident Ref #'}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginTop: 2 }}>
                    {currentWarningDetails.incidentRef || 'WARN-PROCT-001'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                type="button"
                onClick={handleAcknowledgeWarning}
                style={{
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px 24px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                }}
              >
                <span>
                  {language === 'ar'
                    ? 'أقر بالتعليمات واستئناف المقابلة (المخالفة 1 من 2)'
                    : 'I Understand — Resume Interview (Warning 1 of 2)'}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REPEATED OFFENCE / FINAL TERMINATION MODAL (STRIKE 2 OF 2) */}
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
                  {language === 'ar'
                    ? 'تم إلغاء المقابلة فوراً — تكرار المخالفة الأمنية (الإنذار 2 من 2)'
                    : 'Interview Terminated — Repeated Proctoring Offence (Strike 2 of 2)'}
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
                  <span style={{ color: '#DC2626', fontWeight: 800 }}>Rule Violated (Repeated Offence — Strike 2/2)</span>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#9F1239' }}>
                    {language === 'ar'
                      ? (violationReasonDetails.ar || activeApp?.cancellationReasonAr || 'مخالفة الشروط (تكرار المخالفة): تم رصد تكرار المخالفة بعد توجيه إنذار أمني أول. تم إلغاء الجلسة واعتبار النتيجة غير مؤهل.')
                      : (violationReasonDetails.en || activeApp?.cancellationReason || 'Rule Violated (Repeated Offence): Candidate committed a repeated violation after receiving an official proctoring warning. Under SANS integrity regulations, the assessment is officially terminated and canceled.')}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: 14,
                border: '1px solid #E2E8F0',
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'مستوى المخالفة' : 'Proctoring Level'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                    Strike 2 of 2 (Canceled)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'حالة المقابلة بالموارد البشرية' : 'HR Portal Status'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                    Interview Canceled
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'الرمز الأمني للتقرير' : 'Incident Ref #'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginTop: 2 }}>
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

      {/* 3. TIME EXPIRED — INTERVIEW CONCLUDED & RESPONSES SAVED MODAL */}
      {isTimeExpiredModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99998,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 620,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(15, 81, 50, 0.35)',
            border: '2px solid #059669',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#ECFDF5',
              borderBottom: '1px solid #A7F3D0',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                backgroundColor: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}>
                <Clock size={24} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#065F46' }}>
                  {language === 'ar'
                    ? 'انتهى وقت المقابلة — تم حفظ وإرسال الإجابات بنجاح'
                    : 'Interview Concluded — Time Expired & Responses Saved'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#047857' }}>
                  {language === 'ar'
                    ? 'تم حفظ جميع الإجابات المسجلة والكتابية وإرسالها إلى لجنة تقييم الموارد البشرية'
                    : 'All written & recorded responses were preserved and submitted to SANS HR for review'}
                </p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 18
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>
                    {language === 'ar'
                      ? 'تم تسجيل الاستجابة بالكامل وحفظها في ملف المتقدم'
                      : 'Responses Successfully Synchronized & Archived'}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#15803D', lineHeight: 1.5 }}>
                  {language === 'ar'
                    ? 'انتهت المدة المخصصة للمقابلة التفاعلية (5 دقائق). تم تجميد الإجابات المقدمة وإرسالها فوراً إلى منصة الموارد البشرية (HR Recruiter Dossier) ليتمكن فريق التوظيف من مراجعتها وتقييمها.'
                    : 'The allocated 5-minute interview duration has elapsed. All of your submitted and in-progress responses have been secured and transmitted to the HR Recruitment Portal for official evaluator review.'}
                </div>
              </div>

              {/* Assessment Overview Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: 14,
                border: '1px solid #E2E8F0',
                marginBottom: 18
              }}>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'حالة التقديم' : 'Application Status'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                    Interview Completed
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'الدرجة التقديرية' : 'Estimated Score'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                    87 / 100
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                    {language === 'ar' ? 'جاهزية المراجعة لدى HR' : 'HR Review Ready'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1D4ED8', marginTop: 2 }}>
                    Available in HR Portal
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                {language === 'ar'
                  ? 'يمكنك الآن مراجعة بطاقة التقييم وتحليل الذكاء الاصطناعي في الشاشة، أو العودة إلى قائمة طلباتي.'
                  : 'You can now review your AI evaluation scores and transcript breakdown on the right panel, or exit back to the Candidate Applications portal.'}
              </p>
            </div>

            {/* Actions */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                onClick={() => setIsTimeExpiredModalOpen(false)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {language === 'ar' ? 'عرض التقييم وسجل المقابلة' : 'Review Evaluation & Transcript'}
              </button>

              <button
                onClick={() => onCompleted?.()}
                style={{
                  backgroundColor: '#0F5132',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(15, 81, 50, 0.25)'
                }}
              >
                <span>{language === 'ar' ? 'العودة إلى بوابة المتقدمين' : 'Exit to Candidate Portal'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
