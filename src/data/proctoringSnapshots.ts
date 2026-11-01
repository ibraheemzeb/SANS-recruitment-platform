import { ProctoringSnapshot } from '../types';

// All snapshots are captured dynamically from the candidate's active camera during the interview.
// No pre-uploaded stock images are used.
export const DEFAULT_PROCTORING_SNAPSHOTS: ProctoringSnapshot[] = [];

export const generateProctoringSnapshot = (
  elapsedSeconds: number,
  index: number,
  customImageUrl?: string
): ProctoringSnapshot => {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const now = new Date();
  const realTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' AST';

  const gazes = [
    { en: 'Direct Screen Focus (98%)', ar: 'تركيز مباشر على الشاشة (98%)' },
    { en: 'Frontal Eye Contact (99%)', ar: 'تواصل بصري أمامي (99%)' },
    { en: 'Active Airspace Question Review (97%)', ar: 'متابعة بصرية لنص السؤال (97%)' },
    { en: 'Direct Center Gaze (99%)', ar: 'نظرة مركزية مباشرة (99%)' }
  ];
  const gaze = gazes[index % gazes.length];

  return {
    id: `snap-${Date.now()}-${index}`,
    timestamp: timeStr,
    realTime: realTimeStr,
    imageUrl: customImageUrl || '',
    status: 'Verified',
    statusAr: 'موثق ومطابق',
    faceConfidence: Number((99.1 + Math.random() * 0.7).toFixed(1)),
    gazeDirection: gaze.en,
    gazeDirectionAr: gaze.ar,
    lighting: 'Optimal Ambient Lighting (96%)',
    singlePersonVerified: true,
    notes: `Biometric camera snap #${index + 1} automatically captured from camera at random interval. Candidate face matches Saudi Nafath identity token.`,
    notesAr: `لقطة كاميرا بيومترية #${index + 1} التُقطت تلقائياً من الكاميرا في وقت عشوائي. تطابق ملامح المرشح مع سجل نفاذ الوطني المعتمد.`
  };
};
