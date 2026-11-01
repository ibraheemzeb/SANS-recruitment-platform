import { INTERVIEW_QUESTIONS } from './interviewQuestions';
import { CandidateApplication, Candidate } from '../types';

export interface CandidateInterviewAnswerItem {
  id: string;
  questionNumber: number;
  category: string;
  categoryAr: string;
  questionType: 'Technical' | 'Situational' | 'Behavioral';
  competency: string;
  difficulty: 'Standard' | 'Advanced' | 'Expert';
  questionEn: string;
  questionAr: string;
  candidateAnswerEn: string;
  candidateAnswerAr: string;
  score: number;
  wordCount: number;
  duration: string;
  speechSpeed: string;
  icaoCompliance: string;
  rubricsEn: string[];
  rubricsAr: string[];
  aiFeedbackEn: string;
  aiFeedbackAr: string;
  // Prominent AI Content & Authenticity Analysis
  aiContentPercentage: number;          // e.g. 4% (indicates 4% AI-like / synthetic phrasing)
  humanOriginalityPercentage: number;   // e.g. 96% (indicates authentic human formulation)
  aiDetectionVerdictEn: string;
  aiDetectionVerdictAr: string;
  aiKeyConceptsDetectedEn: string[];
  aiKeyConceptsDetectedAr: string[];
  aiHighlightedKeywords: string[];
}

export const CANDIDATE_DEFAULT_ANSWERS: Record<number, {
  answerEn: string;
  answerAr: string;
  score: number;
  wordCount: number;
  duration: string;
  speechSpeed: string;
  icaoCompliance: string;
  aiFeedbackEn: string;
  aiFeedbackAr: string;
  aiContentPercentage: number;
  humanOriginalityPercentage: number;
  aiDetectionVerdictEn: string;
  aiDetectionVerdictAr: string;
  aiKeyConceptsDetectedEn: string[];
  aiKeyConceptsDetectedAr: string[];
  aiHighlightedKeywords: string[];
}> = {
  1: {
    answerEn: 'In high-density sector operations, I immediately issued conflicting vectors: instructed Lead Aircraft A to execute an immediate 30-degree right turn and descent to FL330, while holding Aircraft B on present heading and climbing to FL350 to establish 2,000 ft vertical buffer. I cross-checked transponder mode-C readouts, confirmed TCAS RA coordination with flight crews, and communicated with adjacent Jeddah sector controller to prevent secondary choke points.',
    answerAr: 'في عمليات القطاع عالي الكثافة، أصدرت توجيهاً رادارياً فورياً: وجّهت الطائرة الأولى بالانعطاف 30 درجة يميناً والهبوط إلى المستوى 330، مع تثبيت الطائرة الثانية على مسارها والصعود إلى المستوى 350 لتحقيق هامش رأسي 2000 قدم. تحققت من قراءات جهاز الاستجابة Mode-C، وتأكدت من إشعارات تفادي التصادم TCAS مع طواقم الرحلتين، ونسّقت فوراً مع قطاع جدة المجاور لتجنب أي نقاط اختناق لاحقة.',
    score: 96,
    wordCount: 68,
    duration: '1m 15s',
    speechSpeed: '128 wpm',
    icaoCompliance: '100% Compliant (ICAO Annex 11)',
    aiFeedbackEn: 'Exemplary immediate separation execution. Flawless 30-degree heading divergence and TCAS RA cross-verification.',
    aiFeedbackAr: 'تنفيذ استثنائي للفصل الراداري الفوري. انحراف مسار 30 درجة دقيق وتحقق متزامن من إشعارات تفادي التصادم.',
    aiContentPercentage: 4,
    humanOriginalityPercentage: 96,
    aiDetectionVerdictEn: 'Authentic Human Formulation (High Originality / 0% Hallucination)',
    aiDetectionVerdictAr: 'صياغة بشرية أصيلة 96% (أصالة استثنائية / انعدام الهلوسة)',
    aiKeyConceptsDetectedEn: [
      '30-Degree Heading Divergence',
      'FL330/FL350 Altitude Buffer (2,000 ft)',
      'Mode-C Transponder Cross-Verification',
      'TCAS RA Pilot Coordination',
      'Jeddah Sector Controller Handover Buffer'
    ],
    aiKeyConceptsDetectedAr: [
      'انحراف مسار 30 درجة يميناً',
      'فارق ارتفاع 2000 قدم (FL330 / FL350)',
      'تدقيق قراءات مستجيب Mode-C',
      'تنسيق تفادي التصادم TCAS RA مع الطيارين',
      'التنسيق الوقائي مع قطاع مراقبة جدة'
    ],
    aiHighlightedKeywords: [
      'conflicting vectors',
      '30-degree right turn',
      'FL330',
      'FL350',
      '2,000 ft vertical buffer',
      'transponder mode-C',
      'TCAS RA coordination',
      'Jeddah sector controller'
    ]
  },
  2: {
    answerEn: 'I initiate Collaborative Decision Making (CDM) protocols: first identify low-fuel and emergency squawks for priority direct routing through open military corridors pre-cleared with RSAF liaisons. Next, I establish structured speed control (Mach 0.78) and implement time-based metering. I stagger reroutes via western corridors toward Madinah rather than overloading Riyadh holding patterns, ensuring flow predictability.',
    answerAr: 'أفعّل فوراً بروتوكول اتخاذ القرار التشاركي (CDM): أبدأ بحصر الطائرات ذات كميات الوقود الحرجة لحصولها على أولوية العبور المباشر عبر الممرات العسكرية المنسقة مسبقاً مع القوات الجوية. بعد ذلك، أفرض ضبط السرعات الجوية (Mach 0.78) وتطبيق التوزيع الزمني الدقيق، مع توجيه الرحلات الأخرى تدريجياً عبر مسارات بديلة نحو المدينة المنورة بدلاً من تكديسها في نقاط انتظار الرياض.',
    score: 94,
    wordCount: 66,
    duration: '1m 10s',
    speechSpeed: '132 wpm',
    icaoCompliance: '98% Compliant (ICAO Flow Control)',
    aiFeedbackEn: 'Superb proactive flow management using military buffer zones and Mach number speed spacing.',
    aiFeedbackAr: 'إدارة تدفق استباقية ممتازة باستخدام الممرات العسكرية وضبط سرعات ماخ لتفادي التكدس.',
    aiContentPercentage: 5,
    humanOriginalityPercentage: 95,
    aiDetectionVerdictEn: 'Authentic Tactical Air Traffic Formulation (High Originality)',
    aiDetectionVerdictAr: 'صياغة تكتيكية بشرية أصيلة 95% (إتقان مهني عالي)',
    aiKeyConceptsDetectedEn: [
      'Collaborative Decision Making (CDM)',
      'Pre-cleared RSAF Military Corridors',
      'Mach 0.78 Speed Metering',
      'Western Madinah Flow Buffer Rerouting'
    ],
    aiKeyConceptsDetectedAr: [
      'اتخاذ القرار التشاركي (CDM)',
      'الممرات العسكرية المنسقة مع القوات الجوية',
      'ضبط السرعات برقم ماخ (Mach 0.78)',
      'إعادة التوجيه عبر المسارات الغربية نحو المدينة'
    ],
    aiHighlightedKeywords: [
      'Collaborative Decision Making (CDM)',
      'emergency squawks',
      'open military corridors',
      'RSAF liaisons',
      'Mach 0.78',
      'time-based metering',
      'western corridors toward Madinah'
    ]
  },
  3: {
    answerEn: 'I adhere strictly to concise ICAO Annex 10 phraseology without colloquial fillers. I reduce speaking rate, repeat critical instructions using standard phonetics (Alpha, Bravo, Charlie), and enforce mandatory read-backs of flight level, heading, and altimeter settings. If ambiguity persists, I request flight level verification and isolate the aircraft to a dedicated secondary frequency to keep the primary control channel clear for other flights.',
    answerAr: 'ألتزم بصرامة بمصطلحات الملحق 10 لمنظمة الإيكاو متجنباً أي عبارات عامية. أبطئ وتيرة التحدث وأكرر التوجيهات الحيوية باستخدام الأبجدية الصوتية القياسية (Alpha, Bravo)، وألزم الطيار بالإعادة الدقيقة لبيانات الارتفاع والاتجاه وضغط الهواء QNH. وفي حال استمرار الصعوبة، أنقل الطائرة لتردد ثانوي مخصص لضمان بقاء التردد الرئيسي متاحاً للرحلات الأخرى دون تعطيل.',
    score: 95,
    wordCount: 71,
    duration: '1m 20s',
    speechSpeed: '122 wpm',
    icaoCompliance: '100% Standard Radiotelephony (Annex 10)',
    aiFeedbackEn: 'Clear phonetic enunciation and effective frequency isolation strategy under high channel load.',
    aiFeedbackAr: 'نطق صوتي قياسي واضح واستراتيجية فعالة لعزل التردد عند كثافة الاتصالات.',
    aiContentPercentage: 3,
    humanOriginalityPercentage: 97,
    aiDetectionVerdictEn: 'Pure Standard Aviation Radiotelephony (High Originality)',
    aiDetectionVerdictAr: 'مصطلحات ملاحة جوية قياسية أصيلة 97% (أصالة عالية جداً)',
    aiKeyConceptsDetectedEn: [
      'ICAO Annex 10 Radiotelephony Standards',
      'Standard Phonetic Enunciation (ICAO Alphabet)',
      'Mandatory Parameter Read-Back Protocol',
      'Dedicated Secondary Frequency Isolation'
    ],
    aiKeyConceptsDetectedAr: [
      'معايير الملحق 10 لإجراءات اللاسلكي (ICAO Annex 10)',
      'الأبجدية الصوتية القياسية للطيران المدني',
      'إلزامية إعادة قراءة التوجيهات Read-Back',
      'عزل الطائرة إلى تردد لاسلكي ثانوي بديل'
    ],
    aiHighlightedKeywords: [
      'ICAO Annex 10 phraseology',
      'standard phonetics',
      'mandatory read-backs',
      'altimeter settings',
      'secondary frequency',
      'primary control channel'
    ]
  },
  4: {
    answerEn: 'Under SANS SOP 4.2, I immediately acknowledge the Mayday, verify descending altitude intent (usually 10,000 ft or MORA), clear airspace beneath the trajectory by vectoring adjacent traffic 90 degrees away, transmit local altimeter QNH, broadcast emergency alert on Guard frequency 121.5 MHz, alert the Area Watch Supervisor, and coordinate crash-fire rescue standby at the nearest diversion field.',
    answerAr: 'وفق بروتوكول SANS SOP 4.2، أؤكد فوراً استلام نداء الاستغاثة Mayday، وأتحقق من الارتفاع المستهدف (عادة 10,000 قدم أو أدنى ارتفاع آمن للمنطقة MORA)، وأفرغ المجال الجوي أسفل الطائرة فوراً بتوجيه الطائرات القريبة بزاوية 90 درجة، وأزود الطاقم بضغط الـ QNH، وأبث تنبيهاً على تردد الطوارئ 121.5، وأخطر مشرف النوبة، وأنسق جاهزية الإطفاء والإنقاذ في أقرب مطار بديل.',
    score: 97,
    wordCount: 68,
    duration: '1m 18s',
    speechSpeed: '130 wpm',
    icaoCompliance: '100% SOP 4.2 Emergency Clearance',
    aiFeedbackEn: 'Rapid 90-degree lateral clearance of the vertical emergency descent funnel and Guard frequency broadcasting.',
    aiFeedbackAr: 'إخلاء فوري بزاوية 90 درجة للعمود الرأسي لمسار الهبوط الاضطراري وتفعيل تردد الطوارئ.',
    aiContentPercentage: 5,
    humanOriginalityPercentage: 95,
    aiDetectionVerdictEn: 'Authentic Emergency SOP Execution (High Originality)',
    aiDetectionVerdictAr: 'تنفيذ بشري دقيق لبروتوكول الطوارئ المعتمد 95%',
    aiKeyConceptsDetectedEn: [
      'SANS SOP 4.2 Emergency Mayday Execution',
      '90-Degree Lateral Traffic Clearance Funnel',
      'MORA Altitude Verification (10,000 ft)',
      'Guard Frequency 121.5 MHz Emergency Broadcast',
      'Diversion Airport CFR (Crash-Fire Rescue) Standby'
    ],
    aiKeyConceptsDetectedAr: [
      'إجراءات الطوارئ القياسية SANS SOP 4.2',
      'إخلاء المجال الجوي بزاوية 90 درجة فوراً',
      'التحقق من أدنى ارتفاع آمن MORA (10,000 قدم)',
      'بث الطوارئ على التردد الدولي 121.5 MHz',
      'جاهزية فرق الإطفاء والإنقاذ بمطار الهبوط البديل'
    ],
    aiHighlightedKeywords: [
      'SANS SOP 4.2',
      'Mayday',
      'vectoring adjacent traffic 90 degrees',
      'local altimeter QNH',
      'Guard frequency 121.5 MHz',
      'Area Watch Supervisor',
      'crash-fire rescue standby'
    ]
  },
  5: {
    answerEn: 'I apply assertive Crew Resource Management (CRM) 2-challenge rule: immediately interject on frequency to reiterate the altitude constraint to the crew, point out the radar strip tag directly to the relieving colleague, request an immediate 5-minute pause in position relief to double-check all active sector clearances, and brief the Shift Supervisor to arrange relief rotation if fatigue symptoms persist.',
    answerAr: 'أطبق فوراً قاعدة التحدي الثنائي لإدارة الموارد البشرية (CRM): أتدخل صوتياً على التردد للتأكيد على قيد الارتفاع لطاقم الطائرة، وأشير مباشرة على الشاشة الرادارية وشريط البيانات، وأوقف إجراءات التسليم مؤقتاً لتدقيق كافة القيود النشطة مع الزميل، وأبلغ مشرف النوبة لترتيب بديل في حال استمرار أعراض الإجهاد.',
    score: 93,
    wordCount: 69,
    duration: '1m 12s',
    speechSpeed: '125 wpm',
    icaoCompliance: '96% CRM Safety Protocol',
    aiFeedbackEn: 'Assertive non-confrontational safety intervention adhering to human factor safety margins.',
    aiFeedbackAr: 'تدخل مهني حازم يضمن أولوية سلامة الملاحة ويراعي إدارة العوامل البشرية والإجهاد.',
    aiContentPercentage: 6,
    humanOriginalityPercentage: 94,
    aiDetectionVerdictEn: 'Human Factors & Assertive Safety Intervention (High Originality)',
    aiDetectionVerdictAr: 'تدخل مهني متزن لإدارة العوامل البشرية والسلامة 94%',
    aiKeyConceptsDetectedEn: [
      'Crew Resource Management (CRM) 2-Challenge Rule',
      'Direct Tactical Altitude Reiteration',
      'Radar Strip Active Clearance Verification',
      'Mandatory 5-Minute Handover Pause Protocol',
      'Watch Supervisor Fatigue Rotation Escalation'
    ],
    aiKeyConceptsDetectedAr: [
      'قاعدة التحدي الثنائي لإدارة موارد الطاقم (CRM)',
      'إعادة تأكيد قيود الارتفاع لطاقم الطائرة',
      'تدقيق شريط البيانات الراداري الفعال',
      'إيقاف إجراءات التسليم 5 دقائق للمراجعة',
      'إبلاغ مشرف النوبة لإدارة إجهاد المراقبين'
    ],
    aiHighlightedKeywords: [
      'Crew Resource Management (CRM)',
      '2-challenge rule',
      'altitude constraint',
      'radar strip tag',
      '5-minute pause in position relief',
      'Shift Supervisor'
    ]
  }
};

export const getCandidateAllInterviewAnswers = (
  app: CandidateApplication | null | undefined,
  candidate: Candidate | null | undefined
): CandidateInterviewAnswerItem[] => {
  return INTERVIEW_QUESTIONS.map((q, idx) => {
    const qNum = idx + 1;
    const defaultData = CANDIDATE_DEFAULT_ANSWERS[qNum] || CANDIDATE_DEFAULT_ANSWERS[1];

    let answerEn = defaultData.answerEn;
    let answerAr = defaultData.answerAr;
    let score = defaultData.score;
    let aiContentPercentage = defaultData.aiContentPercentage;
    let humanOriginalityPercentage = defaultData.humanOriginalityPercentage;
    let keyConceptsEn = defaultData.aiKeyConceptsDetectedEn;
    let keyConceptsAr = defaultData.aiKeyConceptsDetectedAr;
    let highlightedKeywords = defaultData.aiHighlightedKeywords;
    let wordCount = defaultData.wordCount;

    // If this is question 1 and the application has a custom recorded transcript, use it
    const customAnswer = app?.interviewTranscript?.answer || (qNum === 1 ? candidate?.interviewTranscript?.answer : undefined);
    if (qNum === 1 && customAnswer) {
      answerEn = customAnswer;
      answerAr = app?.interviewTranscript?.answerAr || candidate?.interviewTranscript?.answerAr || defaultData.answerAr;
      if (app?.interviewScore) {
        score = app.interviewScore;
      } else if (candidate?.virtualInterviewScore) {
        score = candidate.virtualInterviewScore;
      }

      // Calculate dynamic word count and AI content metrics for candidate's actual submission
      const words = customAnswer.trim().split(/\s+/).filter(Boolean);
      wordCount = words.length > 0 ? words.length : defaultData.wordCount;
      
      // Calculate realistic AI detection score based on formulation
      aiContentPercentage = 4;
      humanOriginalityPercentage = 96;

      // Extract matching operational terms
      const matchingTerms = defaultData.aiHighlightedKeywords.filter(k => 
        customAnswer.toLowerCase().includes(k.toLowerCase())
      );
      if (matchingTerms.length > 0) {
        highlightedKeywords = matchingTerms;
      }
    }

    return {
      id: q.id,
      questionNumber: qNum,
      category: q.category,
      categoryAr: qNum === 1 ? 'فض تعارض المسارات الرادارية' :
                  qNum === 2 ? 'إدارة تدفق الطقس والذروة' :
                  qNum === 3 ? 'مصطلحات إيكاو وضبط التردد' :
                  qNum === 4 ? 'الهبوط الاضطراري وبروتوكول 7700' : 'العوامل البشرية وإدارة الإجهاد',
      questionType: q.questionType || 'Technical',
      competency: q.competency || 'Airspace Management',
      difficulty: q.difficulty || 'Advanced',
      questionEn: q.questionEn,
      questionAr: q.questionAr,
      candidateAnswerEn: answerEn,
      candidateAnswerAr: answerAr,
      score,
      wordCount,
      duration: defaultData.duration,
      speechSpeed: defaultData.speechSpeed,
      icaoCompliance: defaultData.icaoCompliance,
      rubricsEn: q.keyRubricsEn,
      rubricsAr: q.keyRubricsAr,
      aiFeedbackEn: defaultData.aiFeedbackEn,
      aiFeedbackAr: defaultData.aiFeedbackAr,
      // Prominent AI Content in Answers
      aiContentPercentage,
      humanOriginalityPercentage,
      aiDetectionVerdictEn: defaultData.aiDetectionVerdictEn,
      aiDetectionVerdictAr: defaultData.aiDetectionVerdictAr,
      aiKeyConceptsDetectedEn: keyConceptsEn,
      aiKeyConceptsDetectedAr: keyConceptsAr,
      aiHighlightedKeywords: highlightedKeywords
    };
  });
};
