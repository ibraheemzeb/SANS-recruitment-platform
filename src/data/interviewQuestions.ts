import { InterviewQuestionItem } from '../types';

export const INTERVIEW_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: 'q-1',
    questionNumber: 1,
    category: 'Airspace Conflict Resolution & Separation Minima',
    questionType: 'Technical',
    competency: 'ICAO Annex 11 Radar Separation & TCAS De-confliction',
    roleFamily: 'Air Traffic Control (ATC)',
    mandatory: true,
    durationSeconds: 120,
    difficulty: 'Advanced',
    questionEn: 'Describe a situation where two inbound flights to Riyadh ACC reported unexpected level busts within 10 miles of your radar sector. How did you resolve the immediate conflict while adhering to ICAO separation minima?',
    questionAr: 'صف موقفاً أبلغت فيه رحلتان قادمتان لمركز مراقبة الرياض عن انحراف مفاجئ عن الارتفاع المحدد ضمن 10 أميال من قطاعك الراداري. كيف قمت بفض التعارض الفوري مع الالتزام بالفصل الراداري القياسي لمنظمة الإيكاو؟',
    suggestedAnswerEn: 'In high-density sector operations, I immediately issued conflicting vectors: instructed Lead Aircraft A to execute an immediate 30-degree right turn and descent to FL330, while holding Aircraft B on present heading and climbing to FL350 to establish 2,000 ft vertical buffer. I cross-checked transponder mode-C readouts, confirmed TCAS RA coordination with flight crews, and communicated with adjacent Jeddah sector controller to prevent secondary choke points.',
    suggestedAnswerAr: 'في عمليات القطاع عالي الكثافة، أصدرت توجيهاً رادارياً فورياً: وجّهت الطائرة الأولى بالانعطاف 30 درجة يميناً والهبوط إلى المستوى 330، مع تثبيت الطائرة الثانية على مسارها والصعود إلى المستوى 350 لتحقيق هامش رأسي 2000 قدم. تحققت من قراءات جهاز الاستجابة Mode-C، وتأكدت من إشعارات تفادي التصادم TCAS مع طواقم الرحلتين، ونسّقت فوراً مع قطاع جدة المجاور لتجنب أي نقاط اختناق لاحقة.',
    keyRubricsEn: [
      'Immediate action verbalizing 30-degree lateral turn & 2,000 ft vertical buffer',
      'TCAS Resolution Advisory awareness and mode-C altitude cross-verification',
      'Inter-sector boundary coordination with adjacent center (Jeddah ACC)'
    ],
    keyRubricsAr: [
      'اتخاذ قرار فوري بالفصل الجانبي (30 درجة) والفصل الرأسي (2000 قدم)',
      'الاستجابة الصحيحة لإشعارات تفادي التصادم TCAS والتحقق من قراءات Mode-C',
      'التنسيق الفوري مع وحدات المراقبة المجاورة لتفادي نقاط الضغط اللاحقة'
    ]
  },
  {
    id: 'q-2',
    questionNumber: 2,
    category: 'Adverse Weather & Hajj/Umrah Surge Management',
    questionType: 'Situational',
    competency: 'Airspace Capacity Management & Collaborative Decision Making (CDM)',
    roleFamily: 'Air Traffic Control (ATC)',
    mandatory: true,
    durationSeconds: 120,
    difficulty: 'Expert',
    questionEn: 'During peak seasonal traffic with heavy localized convective sandstorms over Central Saudi Arabia, multiple airliners request simultaneous diversions. How do you prioritize clearances without choking regional hold points?',
    questionAr: 'خلال ذروة الحركة الجوية وتكون عواصف رملية مفاجئة في المنطقة الوسطى، طلبت عدة طائرات تحويل مساراتها في وقت متزامن. كيف ترتب الأولويات لمنح الأذونات دون التسبب باختناق في نقاط الانتظار؟',
    suggestedAnswerEn: 'I initiate Collaborative Decision Making (CDM) protocols: first identify low-fuel and emergency squawks for priority direct routing through open military corridors pre-cleared with RSAF liaisons. Next, I establish structured speed control (Mach 0.78) and implement time-based metering. I stagger reroutes via western corridors toward Madinah rather than overloading Riyadh holding patterns, ensuring flow predictability.',
    suggestedAnswerAr: 'أفعّل فوراً بروتوكول اتخاذ القرار التشاركي (CDM): أبدأ بحصر الطائرات ذات كميات الوقود الحرجة لحصولها على أولوية العبور المباشر عبر الممرات العسكرية المنسقة مسبقاً مع القوات الجوية. بعد ذلك، أفرض ضبط السرعات الجوية (Mach 0.78) وتطبيق التوزيع الزمني الدقيق، مع توجيه الرحلات الأخرى تدريجياً عبر مسارات بديلة نحو المدينة المنورة بدلاً من تكديسها في نقاط انتظار الرياض.',
    keyRubricsEn: [
      'Prioritization based on fuel endurance and emergency status',
      'Dynamic military corridor utilization via coordination with RSAF',
      'Implementation of speed regulation and time-based spacing'
    ],
    keyRubricsAr: [
      'ترتيب الأولويات بناءً على كميات الوقود وحالات الطوارئ',
      'الاستفادة الفورية من المسارات العسكرية بالتنسيق مع القوات الجوية',
      'تطبيق التحكم في السرعات والتفويج الزمني لمنع تكدس نقاط الانتظار'
    ]
  },
  {
    id: 'q-3',
    questionNumber: 3,
    category: 'ICAO Standard Phraseology & Stress Discipline',
    questionType: 'Behavioral',
    competency: 'ICAO Annex 10 Radiotelephony & Communication Discipline',
    roleFamily: 'Aviation Operations',
    mandatory: false,
    durationSeconds: 90,
    difficulty: 'Standard',
    questionEn: 'How do you maintain strict ICAO standard radio telephony discipline when dealing with a non-native pilot experiencing communication difficulties during radio frequency congestion?',
    questionAr: 'كيف تحافظ على الانضباط بالمصطلحات القياسية المعتمدة للإيكاو عند التعامل مع طيار غير ناطق بالإنجليزية يواجه صعوبة في التواصل وسط ازدحام التردد اللاسلكي؟',
    suggestedAnswerEn: 'I adhere strictly to concise ICAO Annex 10 phraseology without colloquial fillers. I reduce speaking rate, repeat critical instructions using standard phonetics (Alpha, Bravo, Charlie), and enforce mandatory read-backs of flight level, heading, and altimeter settings. If ambiguity persists, I request flight level verification and isolate the aircraft to a dedicated secondary frequency to keep the primary control channel clear for other flights.',
    suggestedAnswerAr: 'ألتزم بصرامة بمصطلحات الملحق 10 لمنظمة الإيكاو متجنباً أي عبارات عامية. أبطئ وتيرة التحدث وأكرر التوجيهات الحيوية باستخدام الأبجدية الصوتية القياسية (Alpha, Bravo)، وألزم الطيار بالإعادة الدقيقة لبيانات الارتفاع والاتجاه وضغط الهواء QNH. وفي حال استمرار الصعوبة، أنقل الطائرة لتردد ثانوي مخصص لضمان بقاء التردد الرئيسي متاحاً للرحلات الأخرى دون تعطيل.',
    keyRubricsEn: [
      'Zero use of colloquial expressions; strict ICAO Annex 10 phraseology',
      'Speech pacing regulation and standard phonetic clarity',
      'Frequency segregation to secondary channel when needed'
    ],
    keyRubricsAr: [
      'عدم استخدام مصطلحات عامية والالتزام بمصطلحات الإيكاو المعتمدة',
      'تهدئة سرعة الإلقاء واستخدام الحروف الصوتية الدولية بوضوح',
      'عزل الطائرة إلى تردد بديل عند الضرورة لحماية القناة الرئيسية'
    ]
  },
  {
    id: 'q-4',
    questionNumber: 4,
    category: 'Emergency Depressurization & Squawk 7700 SOP',
    questionType: 'Situational',
    competency: 'SANS SOP 4.2 Airspace Emergency & Rapid Descent Handling',
    roleFamily: 'Air Traffic Control (ATC)',
    mandatory: true,
    durationSeconds: 120,
    difficulty: 'Expert',
    questionEn: 'An international heavy transport squawks 7700 at FL390 reporting rapid cabin depressurization and declares an emergency descent. Outline your exact tactical control steps under SANS SOP 4.2.',
    questionAr: 'أعلنت طائرة نقل دولية حالة الطوارئ (رمز 7700) على ارتفاع 39,000 قدم وأبلغت عن هبوط حاد في ضغط المقصورة وبدء هبوط اضطراري. وضح خطواتك الإجرائية الفورية وفق بروتوكول الملاحة الجوية SANS SOP 4.2.',
    suggestedAnswerEn: 'Under SANS SOP 4.2, I immediately acknowledge the Mayday, verify descending altitude intent (usually 10,000 ft or MORA), clear airspace beneath the trajectory by vectoring adjacent traffic 90 degrees away, transmit local altimeter QNH, broadcast emergency alert on Guard frequency 121.5 MHz, alert the Area Watch Supervisor, and coordinate crash-fire rescue standby at the nearest diversion field (King Khalid International or Prince Sultan Air Base).',
    suggestedAnswerAr: 'وفق بروتوكول SANS SOP 4.2، أؤكد فوراً استلام نداء الاستغاثة Mayday، وأتحقق من الارتفاع المستهدف (عادة 10,000 قدم أو أدنى ارتفاع آمن للمنطقة MORA)، وأفرغ المجال الجوي أسفل الطائرة فوراً بتوجيه الطائرات القريبة بزاوية 90 درجة، وأزود الطاقم بضغط الـ QNH، وأبث تنبيهاً على تردد الطوارئ 121.5، وأخطر مشرف النوبة، وأنسق جاهزية الإطفاء والإنقاذ في أقرب مطار بديل.',
    keyRubricsEn: [
      'Instant clearing of vertical column beneath emergency aircraft',
      'Broadcast of emergency warning and QNH altimeter setting',
      'Alerting Area Watch Supervisor and coordinating with nearest diversion airfield'
    ],
    keyRubricsAr: [
      'الإخلاء الفوري للعمود الرأسي أسفل مسار الطائرة المنحدرة',
      'بث التحذير وتزويد الطاقم بضغط الهواء وتأكيد أدنى ارتفاع آمن',
      'إخطار مشرف النوبة وتنسيق الاستجابة الأرضية مع المطارات البديلة'
    ]
  },
  {
    id: 'q-5',
    questionNumber: 5,
    category: 'Crew Resource Management & Fatigue Threat Management',
    questionType: 'Behavioral',
    competency: 'Human Factors, CRM & Inter-controller Handover Protocols',
    roleFamily: 'Air Traffic Operations',
    mandatory: false,
    durationSeconds: 90,
    difficulty: 'Standard',
    questionEn: 'During a high-workload night shift handover, you notice a relieving controller seems fatigued and misses an active altitude constraint. How do you intervene professionally to ensure airspace safety?',
    questionAr: 'خلال إجراءات تسليم النوبة الليلية وسط حركة جوية نشطة، لاحظت علامات إجهاد على زميلك المستلم وتفويته لقيد ارتفاع نشط. كيف تتدخل بمهنية لضمان سلامة المجال الجوي؟',
    suggestedAnswerEn: 'I apply assertive Crew Resource Management (CRM) 2-challenge rule: immediately interject on frequency to reiterate the altitude constraint to the crew, point out the radar strip tag directly to the relieving colleague, request an immediate 5-minute pause in position relief to double-check all active sector clearances, and brief the Shift Supervisor to arrange relief rotation if fatigue symptoms persist.',
    suggestedAnswerAr: 'أطبق فوراً قاعدة التحدي الثنائي لإدارة الموارد البشرية (CRM): أتدخل صوتياً على التردد للتأكيد على قيد الارتفاع لطاقم الطائرة، وأشير مباشرة على الشاشة الرادارية وشريط البيانات، وأوقف إجراءات التسليم مؤقتاً لتدقيق كافة القيود النشطة مع الزميل، وأبلغ مشرف النوبة لترتيب بديل في حال استمرار أعراض الإجهاد.',
    keyRubricsEn: [
      'Application of CRM 2-challenge assertive safety protocol',
      'Immediate verbal safety intervention preventing separation loss',
      'Collaboration with Shift Supervisor for fatigue management'
    ],
    keyRubricsAr: [
      'تطبيق بروتوكول التدخل الآمن الحازم وفق معايير CRM',
      'التدخل الفوري على التردد لمنع أي فقدان في مسافات الفصل الآمن',
      'التنسيق السليم مع مشرف النوبة لإدارة إجهاد المراقبين'
    ]
  }
];
