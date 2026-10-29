import { InterviewQuestionItem, JobRequisition } from '../types';

export const JOB_SPECIFIC_QUESTION_TEMPLATES: Record<string, InterviewQuestionItem[]> = {
  // 1. REQ-2026-084: Senior Air Traffic Control Specialist (En-Route Radar)
  'REQ-2026-084': [
    {
      id: 'q-atc-01',
      questionNumber: 1,
      requisitionCode: 'REQ-2026-084',
      jobTitle: 'Senior Air Traffic Control Specialist (En-Route Radar)',
      aiGenerated: true,
      category: 'Airspace Separation Minima & TCAS Conflict Resolution',
      questionType: 'Technical',
      competency: 'ICAO Annex 11 Radar Separation & TCAS De-confliction',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Advanced',
      questionEn: 'Describe your procedure when two en-route commercial airliners report an unplanned level bust within 8 nautical miles in Riyadh ACC high-density sector. How do you re-establish standard separation while coordinating with adjacent sectors?',
      questionAr: 'اشرح الإجراء المتبع عند إبلاغ طائرتين تجاريتين عن انحراف مفاجئ عن الارتفاع ضمن 8 أميال بحرية في قطاع مركز مراقبة الرياض. كيف تعيد الفصل الراداري النظامي مع التنسيق مع القطاعات المجاورة؟',
      suggestedAnswerEn: 'Issue immediate divergent heading instructions (minimum 30 degrees lateral separation), establish emergency 2,000 ft vertical separation buffer, cross-verify transponder Mode-C readout, and immediately contact adjacent sector controller to prevent secondary air traffic conflicts.',
      suggestedAnswerAr: 'إصدار توجيه فوري بمسارات متباعدة (30 درجة على الأقل)، وتطبيق هامش فصل رأسي طارئ قدره 2000 قدم، والتحقق من قراءات جهاز Mode-C، والتنسيق الفوري مع مراقب القطاع المجاور لمنع تعارضات لاحقة.',
      keyRubricsEn: [
        'Immediate execution of lateral divergent vectors and 2,000 ft vertical buffer',
        'Mode-C transponder cross-verification and TCAS situational awareness',
        'Prompt inter-sector coordination with adjacent control centers'
      ],
      keyRubricsAr: [
        'إصدار توجيهات فورية للفصل الجانبي والرأسي الطارئ',
        'التحقق من قراءات أجهزة الاستجابة وإشعارات TCAS',
        'التنسيق الفوري مع وحدات المراقبة الجوية المجاورة'
      ]
    },
    {
      id: 'q-atc-02',
      questionNumber: 2,
      requisitionCode: 'REQ-2026-084',
      jobTitle: 'Senior Air Traffic Control Specialist (En-Route Radar)',
      aiGenerated: true,
      category: 'Adverse Convective Weather & Flow Metering',
      questionType: 'Situational',
      competency: 'Airspace Capacity Management & Collaborative Decision Making (CDM)',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Expert',
      questionEn: 'During a severe localized sandstorm impacting Central Saudi airspace, multiple heavy jets request simultaneous route deviations. How do you prioritize clearances without overwhelming regional holding fixes?',
      questionAr: 'أثناء عاصفة رملية شديدة تؤثر على المجال الجوي الأوسط، طلبت عدة طائرات عريضة البدن انحرافات متزامنة عن مساراتها. كيف تحدد الأولويات دون التسبب باختناق نقاط الانتظار؟',
      suggestedAnswerEn: 'Activate Collaborative Decision Making (CDM), assess fuel endurance to prioritize direct military corridor routing, implement uniform speed metering (Mach 0.78), and stagger reroutes across western corridors toward Madinah.',
      suggestedAnswerAr: 'تفعيل بروتوكول CDM، وتقييم كميات الوقود لمنح أولوية العبور عبر الممرات العسكرية، وتطبيق ضبط السرعات (Mach 0.78)، وتوزيع التحويلات نحو الممرات الغربية باتجاه المدينة المنورة.',
      keyRubricsEn: [
        'Prioritizing based on aircraft fuel remaining and emergency squawks',
        'Applying time-based metering and tactical speed control',
        'Utilizing coordinated alternative routes to mitigate holding pattern congestion'
      ],
      keyRubricsAr: [
        'ترتيب الأولويات بناءً على كميات الوقود وحالات الطوارئ',
        'تطبيق التحكم في السرعات والتفويج الزمني',
        'استخدام مسارات بديلة منسقة لتفادي تكدس نقاط الانتظار'
      ]
    },
    {
      id: 'q-atc-03',
      questionNumber: 3,
      requisitionCode: 'REQ-2026-084',
      jobTitle: 'Senior Air Traffic Control Specialist (En-Route Radar)',
      aiGenerated: true,
      category: 'Squawk 7700 Rapid Descent Management',
      questionType: 'Situational',
      competency: 'SANS Emergency SOP 4.2 & High-Altitude Depressurization',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: false,
      durationSeconds: 90,
      difficulty: 'Advanced',
      questionEn: 'A passenger aircraft declares "MAYDAY MAYDAY" and squawks 7700 due to sudden cabin depressurization at FL390. Detail your first 60 seconds of controller actions.',
      questionAr: 'أعلنت طائرة ركاب حالة استغاثة "MAYDAY" وقامت بضبط الرمز 7700 بسبب فقدان مفاجئ لضغط المقصورة عند الارتفاع 390. فصّل إجراءاتك خلال أول 60 ثانية.',
      suggestedAnswerEn: 'Acknowledge MAYDAY, protect airspace beneath the descending aircraft down to 10,000 ft or minimum safe altitude, vector all traffic out of the emergency corridor, obtain altimeter setting, and notify rescue coordination services.',
      suggestedAnswerAr: 'تأكيد الاستغاثة فوراً، وإخلاء المجال الجوي أسفل الطائرة حتى ارتفاع 10,000 قدم أو أدنى ارتفاع آمن، وتوجيه حركة المرور الأخرى بعيداً، وتزويد الطاقم بضبط مقياس الضغط، وإخطار خدمات الإنقاذ.',
      keyRubricsEn: [
        'Immediate acknowledgment and sterile airspace clearing below',
        'Broadcasting emergency altitude clearance and terrain safety minima',
        'Coordination with emergency response units and supervisor'
      ],
      keyRubricsAr: [
        'الاستجابة الفورية وتأمين مسار الهبوط الاضطراري',
        'إصدار تعليمات الارتفاع الآمن والالتزام بحدود التضاريس',
        'إخطار فرق الطوارئ والمشرف المناوب'
      ]
    },
    {
      id: 'q-atc-04',
      questionNumber: 4,
      requisitionCode: 'REQ-2026-084',
      jobTitle: 'Senior Air Traffic Control Specialist (En-Route Radar)',
      aiGenerated: true,
      category: 'Crew Resource Management & Fatigue Handover',
      questionType: 'Behavioral',
      competency: 'ICAO Annex 1 Fatigue Risk Management & Team Handover',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: false,
      durationSeconds: 90,
      difficulty: 'Standard',
      questionEn: 'At the end of a high-stress 2-hour continuous radar console shift, your relief controller arrives looking fatigued. How do you conduct the position relief briefing under SANS safety guidelines?',
      questionAr: 'في نهاية فترة مراقبة رادارية متواصلة وشاقة لمدة ساعتين، حضر المراقب البديل وتبدو عليه علامات الإرهاق. كيف تجري تسليم الوردية وفق معايير السلامة؟',
      suggestedAnswerEn: 'Follow standard SANS 4-step handover checklist: verbalize current sector traffic, active restrictions, weather sigmets, and standby strip status. Tactfully assess peer readiness and, if safety is in doubt, consult the watch supervisor immediately.',
      suggestedAnswerAr: 'تطبيق قائمة تسليم الوردية المعتمدة بـ 4 خطوات: توضيح الحركة الحالية، القيود النشطة، تحذيرات الطقس، وحالة المسارات. تقييم جاهزية الزميل بلباقة وإشراك المشرف فوراً إذا كان هناك أي شك في معايير السلامة.',
      keyRubricsEn: [
        'Rigorous adherence to structured 4-step handover protocol',
        'Proactive safety vigilance regarding controller fitness for duty',
        'Professional escalation to watch supervisor without compromising sector integrity'
      ],
      keyRubricsAr: [
        'الالتزام بقائمة التسليم القياسية خطوة بخطوة',
        'اليقظة لسلامة وجاهزية الكادر التشغيلي',
        'التصعيد المهني للمشرف لضمان سلامة القطاع'
      ]
    }
  ],

  // 2. REQ-2026-112: Air Traffic Management (ATM) Systems Engineer
  'REQ-2026-112': [
    {
      id: 'q-cns-01',
      questionNumber: 1,
      requisitionCode: 'REQ-2026-112',
      jobTitle: 'Air Traffic Management (ATM) Systems Engineer',
      aiGenerated: true,
      category: 'Radar Feed Loss & Secondary Sensor Mode-S Troubleshooting',
      questionType: 'Technical',
      competency: 'ICAO ATSEP Radar Signal Processing & Ground Station Maintenance',
      roleFamily: 'CNS Engineering',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Advanced',
      questionEn: 'Primary radar surveillance data suddenly drops out for Western Sector while secondary Mode-S radar remains active. What is your diagnostic sequence to isolate whether the failure is in the antenna rotary joint, RF receiver, or fiber backhaul?',
      questionAr: 'توقف تدفق بيانات الرادار الأولي فجأة في القطاع الغربي بينما ظل الرادار الثانوي Mode-S يعمل. ما هو التسلسل التشخيصي لتحديد ما إذا كان الخلل في وصلة الهوائي الدوارة، أو مستقبل التردد اللاسلكي، أو كابل الألياف الضوئية؟',
      suggestedAnswerEn: 'Check central SNMP network monitoring for fiber optical link attenuation, inspect RF receiver status via BITE (Built-In Test Equipment) logs, verify rotary joint microwave slip rings, and ensure uninterrupted data feed to TopSky ATM automation without data dropouts.',
      suggestedAnswerAr: 'فحص مؤشرات شبكة SNMP للتأكد من عدم وجود انقطاع في الألياف الضوئية، ومراجعة سجلات الفحص الذاتي BITE لمستقبل التردد، وفحص حلقات الهوائي الدوارة، وضمان استمرار تدفق البيانات لنظام TopSky دون انقطاع.',
      keyRubricsEn: [
        'Systematic isolation using BITE diagnostics and SNMP link metrics',
        'Clear differentiation between primary RF hardware and digital backhaul transmission',
        'Protection of continuous ATC display feeds during switchover'
      ],
      keyRubricsAr: [
        'التشخيص المنهجي باستخدام BITE ومؤشرات الشبكة',
        'التمييز الدقيق بين أعطال التردد اللاسلكي وخطوط نقل البيانات الرقمية',
        'حماية استمرارية العرض الراداري لشاشات المراقبين'
      ]
    },
    {
      id: 'q-cns-02',
      questionNumber: 2,
      requisitionCode: 'REQ-2026-112',
      jobTitle: 'Air Traffic Management (ATM) Systems Engineer',
      aiGenerated: true,
      category: 'VCCS Voice Communication System Failover',
      questionType: 'Situational',
      competency: 'Voice Communication Control Systems (VCCS) & ED-137 VoIP Standards',
      roleFamily: 'CNS Engineering',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Expert',
      questionEn: 'An unexpected core switch malfunction occurs in the primary VoIP VCCS system during peak international traffic. How do you verify seamless automatic switchover to the redundant back-up voice system without losing VHF radio contact with airborne flights?',
      questionAr: 'حدث عطل غير متوقع في محول الشبكة الرئيسي لمنظومة الاتصال الصوتي VCCS أثناء ذروة الحركة الدولية. كيف تتحقق من التبديل التلقائي السلس إلى المنظومة الاحتياطية دون فقدان الاتصال اللاسلكي VHF مع الطائرات؟',
      suggestedAnswerEn: 'Verify ED-137 SIP session state on the standby core matrix, confirm zero packet drop on ground VHF transmitter links, validate controller console audio side-tone, and log the switchover incident under GACA safety maintenance reporting.',
      suggestedAnswerAr: 'التحقق من جلسات ED-137 SIP على مصفوفة التبديل الاحتياطية، والتأكد من عدم فقدان أي حزم بيانات عبر محطات VHF الأرضية، والتأكد من سماع المراقبين لصوتهم في الأجهزة، وتوثيق الحادث وفق اشتراطات الطيران المدني.',
      keyRubricsEn: [
        'Understanding of ED-137 standard VoIP air-ground switching protocols',
        'Verification of radio transmitter keying and receiver audio integrity',
        'Immediate safety logging and notification to engineering supervisor'
      ],
      keyRubricsAr: [
        'الإلمام بمعايير بروتوكول ED-137 لنقل الصوت عبر بروتوكول الإنترنت',
        'التحقق من جاهزية أجهزة الإرسال والاستقبال اللاسلكية',
        'التوثيق الفوري وإبلاغ المشرف الهندسي'
      ]
    },
    {
      id: 'q-cns-03',
      questionNumber: 3,
      requisitionCode: 'REQ-2026-112',
      jobTitle: 'Air Traffic Management (ATM) Systems Engineer',
      aiGenerated: true,
      category: 'Collaborative Multi-Agency Calibration (ILS & VOR)',
      questionType: 'Behavioral',
      competency: 'Instrument Landing System (ILS) Periodic Calibration Coordination',
      roleFamily: 'CNS Engineering',
      mandatory: false,
      durationSeconds: 90,
      difficulty: 'Standard',
      questionEn: 'When conducting scheduled flight check calibration for an Instrument Landing System (ILS), conflicting operational priorities arise between airport operations and the calibration aircraft crew. How do you resolve this impasse?',
      questionAr: 'أثناء تنفيذ الفحص الجوي الدوري لمعايرة نظام الهبوط الآلي ILS، نشأ تعارض في الأولويات بين عمليات المطار وطاقم طائرة المعايرة. كيف تدير وتفض هذا الخلاف؟',
      suggestedAnswerEn: 'Establish a structured briefing between airport duty manager, ATC tower lead, and flight check crew. Emphasize GACA mandatory calibration certification deadlines, negotiate low-traffic time windows, and maintain safety focus.',
      suggestedAnswerAr: 'عقد اجتماع تنسيقي سريع يجمع مدير مناوب المطار وقائد برج المراقبة وطاقم طائرة المعايرة. إيضاح المهل الإلزامية لصلاحية شهادة ILS، والاتفاق على نوافذ زمنية منخفضة الكثافة لإتمام الفحص بأمان.',
      keyRubricsEn: [
        'Stakeholder alignment balancing operational revenue with regulatory safety',
        'Clear communication of GACA compliance windows and risk impacts',
        'Collaborative negotiation achieving win-win schedule alignment'
      ],
      keyRubricsAr: [
        'الموازنة بين التدفق التشغيلي والامتثال لمعايير السلامة',
        'التواصل الواضح حول المهل التنظيمية وأثر تأخير المعايرة',
        'التفاوض الإيجابي للوصول لجدولة مناسبة لجميع الأطراف'
      ]
    }
  ],

  // 3. REQ-2026-045: Flight Dispatch & Airspace Navigation Safety Analyst
  'REQ-2026-045': [
    {
      id: 'q-saf-01',
      questionNumber: 1,
      requisitionCode: 'REQ-2026-045',
      jobTitle: 'Flight Dispatch & Airspace Navigation Safety Analyst',
      aiGenerated: true,
      category: 'ASAP Safety Incident Trend Modeling & Risk Classification',
      questionType: 'Technical',
      competency: 'Aviation Safety Action Program (ASAP) & ICAO Safety Management (SMS)',
      roleFamily: 'Aviation Safety',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Advanced',
      questionEn: 'Analyze how you correlate recurring low-level altitude deviation reports with local airspace sector configuration to determine if the root cause is pilot phraseology confusion or controller handoff workload.',
      questionAr: 'وضح كيف تربط بين تقارير انحرافات الارتفاع المتكررة والتصميم الهندسي لقطاع الملاحة لتحديد ما إذا كان السبب الجذري هو التباس في مصطلحات الطيارين أو ضغط عمل تسليم المراقبين.',
      suggestedAnswerEn: 'Apply ICAO Bow-Tie risk methodology: aggregate safety reports from ASAP and radar tracking logs, run statistical clustering on waypoint clearance audio, inspect altitude transition levels, and formulate corrective safety notices.',
      suggestedAnswerAr: 'تطبيق نموذج Bow-Tie لإدارة المخاطر: تجميع تقارير برنامج ASAP وبيانات الرادار، وإجراء تحليل إحصائي لتسجيلات التوجيه الصوتي عند نقاط المسار، ومراجعة مستويات الانتقال، وصياغة نشرات سلامة تصحيحية.',
      keyRubricsEn: [
        'Application of structured SMS methodologies (Bow-Tie, Risk Matrices)',
        'Evidence-based data fusion from radar tracks and audio recordings',
        'Formulation of actionable corrective safety recommendations'
      ],
      keyRubricsAr: [
        'تطبيق منهجيات إدارة السلامة المعتمدة ونماذج تقييم المخاطر',
        'دمج الأدلة من تسجيلات الرادار والتواصل الصوتي',
        'صياغة توصيات وإجراءات وقائية قابلة للتنفيذ'
      ]
    },
    {
      id: 'q-saf-02',
      questionNumber: 2,
      requisitionCode: 'REQ-2026-045',
      jobTitle: 'Flight Dispatch & Airspace Navigation Safety Analyst',
      aiGenerated: true,
      category: 'Emergency Airspace Restriction NOTAM Dissemination',
      questionType: 'Situational',
      competency: 'ICAO Annex 15 Aeronautical Information Services (AIS) & NOTAM Protocols',
      roleFamily: 'Aviation Safety',
      mandatory: true,
      durationSeconds: 90,
      difficulty: 'Advanced',
      questionEn: 'An unexpected volcanic ash or military airspace closure requires urgent NOTAM issuance within 15 minutes. Explain your exact protocol for verification, Q-code selection, and international transmission.',
      questionAr: 'تطلب إغلاق طارئ لمجال جوي إصدار إشعار NOTAM عاجل خلال 15 دقيقة. اشرح بروتوكولك الدقيق للتحقق واختيار رمز Q-code والبث الدولي.',
      suggestedAnswerEn: 'Coordinate with GACA safety office, construct the standardized ICAO Q-code identifying coordinates and vertical limits, verify via International NOTAM Office (NOF), and push across AFTN network within target SLA.',
      suggestedAnswerAr: 'التنسيق الفوري مع مكتب سلامة الطيران، وصياغة رمز Q-code القياسي متضمناً الإحداثيات والحدود الرأسية، والتحقق عبر مكتب النوتام الدولي، والبث عبر شبكة AFTN ضمن مهلة مستوى الخدمة.',
      keyRubricsEn: [
        'Precise ICAO Q-code syntax and coordinates construction',
        'Verification protocols with GACA safety and military authorities',
        'Adherence to strict 15-minute emergency dissemination SLA'
      ],
      keyRubricsAr: [
        'الدقة في بناء بنية رمز Q-code والإحداثيات الجغرافية',
        'التحقق الأمني والنظامي مع الجهات المختصة',
        'الالتزام بزمن الاستجابة القياسي (15 دقيقة)'
      ]
    }
  ],

  // 4. REQ-2026-150: Terminal Area Radar Controller (TMA Jeddah KAIA)
  'REQ-2026-150': [
    {
      id: 'q-tma-01',
      questionNumber: 1,
      requisitionCode: 'REQ-2026-150',
      jobTitle: 'Terminal Area Radar Controller (TMA Jeddah KAIA)',
      aiGenerated: true,
      category: 'Hajj Surge Continuous Descent Spacing (Runway 34L/C)',
      questionType: 'Technical',
      competency: 'Terminal Area Radar Separation & Point Merge Metering',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Expert',
      questionEn: 'During peak Hajj arrival waves with 45 aircraft movements per hour inbound to KAIA, weather forces a transition to Runway 34L single-runway operations. How do you sequence heavy wide-body arrivals with wake turbulence separation?',
      questionAr: 'أثناء ذروة وفود الحج بمعدل 45 حركة هبوط في الساعة بمطار الملك عبدالعزيز، اضطرت الظروف الجوية للتحول للهبوط على المدرج 34L فقط. كيف تنظم تتابع الطائرات عريضة البدن مع مراعاة فواصل الاضطرابات الهوائية؟',
      suggestedAnswerEn: 'Deploy Point Merge System sequencing: establish minimum 5 to 6 nautical mile wake vortex separation between Super/Heavy and Medium categories, apply progressive speed reductions (210 to 180 to 160 knots), and maintain continuous radar monitoring.',
      suggestedAnswerAr: 'تطبيق نظام دمج المسارات Point Merge: فرض فواصل دوامات الهواء (5 إلى 6 أميال بحرية) بين فئات الطائرات الثقيلة والمتوسطة، وضبط السرعات التدريجي (210 ثم 180 ثم 160 عقدة)، والمراقبة الرادارية المستمرة.',
      keyRubricsEn: [
        'Exact wake turbulence spacing enforcement based on ICAO aircraft classification',
        'Tactical speed control sequencing avoiding holding entry',
        'Proactive coordination with Jeddah Tower for runway occupancy safety'
      ],
      keyRubricsAr: [
        'الالتزام بفواصل دوامات الهواء المعتمدة حسب تصنيف الطائرات',
        'التحكم الدقيق في السرعات لمنع تكدس الاقتراب النهائي',
        'التنسيق الوثيق مع برج مراقبة جدة لضمان سرعة إخلاء المدرج'
      ]
    },
    {
      id: 'q-tma-02',
      questionNumber: 2,
      requisitionCode: 'REQ-2026-150',
      jobTitle: 'Terminal Area Radar Controller (TMA Jeddah KAIA)',
      aiGenerated: true,
      category: 'Low-Altitude Windshear Alert & Go-Around Waves',
      questionType: 'Situational',
      competency: 'Low-Level Windshear Alert System (LLWAS) & Missed Approach Handling',
      roleFamily: 'Air Traffic Control (ATC)',
      mandatory: true,
      durationSeconds: 90,
      difficulty: 'Advanced',
      questionEn: 'Two aircraft on final approach execute simultaneous missed approaches due to windshear warnings at 400 ft AGL. How do you manage divergent missed approach tracks while holding following arrivals?',
      questionAr: 'قامت طائرتان على الاقتراب النهائي بتنفيذ هبوط ملغي متزامن بسبب تحذير قص الرياح على ارتفاع 400 قدم. كيف تدير مسارات الهبوط الملغي المتشعبة مع حجز الرحلات القادمة في الخلف؟',
      suggestedAnswerEn: 'Assign immediate divergent headings, instruct lead go-around to climb to 4,000 ft on runway heading and trailing aircraft to turn 30 degrees right climbing to 3,000 ft, suspend downwind approaches, and issue windshear alerts to all sector traffic.',
      suggestedAnswerAr: 'إصدار اتجاهات طيران متباعدة فوراً، وتوجيه الطائرة الأولى للصعود إلى 4000 قدم على امتداد المدرج، والطائرة الثانية بالانعطاف 30 درجة يميناً والصعود إلى 3000 قدم، وإيقاف طابور الاقتراب مؤقتاً، وتعميم إشعار قص الرياح.',
      keyRubricsEn: [
        'Immediate altitude and heading deconfliction between missed approach aircraft',
        'Halting subsequent arrivals to prevent cascading go-around saturation',
        'Dissemination of LLWAS microburst warnings to all approaching crews'
      ],
      keyRubricsAr: [
        'الفصل الفوري في الارتفاع والاتجاه بين الطائرات الملغية للهبوط',
        'إيقاف الرحلات التالية لتفادي تراكم حالات الهبوط الملغي',
        'بث تحذيرات قص الرياح لجميع الطواقم القادمة'
      ]
    }
  ],

  // 5. REQ-2026-188: Aeronautical Cybersecurity & Airspace Data Architect
  'REQ-2026-188': [
    {
      id: 'q-sec-01',
      questionNumber: 1,
      requisitionCode: 'REQ-2026-188',
      jobTitle: 'Aeronautical Cybersecurity & Airspace Data Architect',
      aiGenerated: true,
      category: 'ADS-B RF Spoofing & Cryptographic Multi-Lateration Defense',
      questionType: 'Technical',
      competency: 'Aviation Cyber Defense & NCA-ECC Critical Infrastructure Security',
      roleFamily: 'Aviation Cybersecurity',
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Expert',
      questionEn: 'An adversary injects ghost aircraft radar targets into the unencrypted 1090 MHz ADS-B broadcast feed. How do you design multi-lateration cross-verification and hardware security module (HSM) validation to neutralize spoofed targets?',
      questionAr: 'قام مهاجم بحقن أهداف وهمية في تدفق بث رادار ADS-B بتردد 1090 ميجاهرتز غير المشفر. كيف تصمم آلية التحقق التبادلي متعدد المواقع واستخدام وحدات HSM لتحييد الأهداف المزيفة؟',
      suggestedAnswerEn: 'Deploy Time-Difference-of-Arrival (TDOA) multi-lateration cross-checking to verify physical radio source locations against claimed GPS coordinates, filter out targets lacking secondary radar correlation, and isolate ground feeds behind HSM firewalls.',
      suggestedAnswerAr: 'تطبيق تقنية قياس الفروق الزمنية للوصول (TDOA) للتحقق من الموقع الجغرافي الفعلي لمصدر الإشارة ومقارنته بإحداثيات GPS، واستبعاد الأهداف غير المؤكدة برادار ثانوي، وعزل محطات التغذية الأرضية خلف بوابات HSM.',
      keyRubricsEn: [
        'Application of TDOA physical layer validation against spoofed RF transmissions',
        'Cross-correlation between primary radar, secondary radar, and ADS-B feeds',
        'Compliance with NCA-ECC-1:2018 controls for critical air traffic networks'
      ],
      keyRubricsAr: [
        'تطبيق تقنيات التحقق الفيزيائي TDOA ضد محاولات التزييف اللاسلكي',
        'المطابقة الثلاثية بين الرادار الأولي والثانوي وتغذية ADS-B',
        'الالتزام بضوابط الهيئة الوطنية للأمن السيبراني للبنى التحتية الحساسة'
      ]
    },
    {
      id: 'q-sec-02',
      questionNumber: 2,
      requisitionCode: 'REQ-2026-188',
      jobTitle: 'Aeronautical Cybersecurity & Airspace Data Architect',
      aiGenerated: true,
      category: 'Sovereign KSA Cloud Boundary & Zero-Day Incident Response',
      questionType: 'Situational',
      competency: 'Saudi PDPL Data Sovereignty & Zero-Trust Architecture',
      roleFamily: 'Aviation Cybersecurity',
      mandatory: true,
      durationSeconds: 90,
      difficulty: 'Advanced',
      questionEn: 'Telemetry from an AI candidate screening sub-system exhibits anomalous outbound encrypted traffic toward an unauthorized external IP outside KSA. Detail your containment protocol under Saudi PDPL regulations.',
      questionAr: 'أظهرت مؤشرات القياس عن بُعد لنظام الفرز بالذكاء الاصطناعي حركة بيانات مشفرة مشبوهة موجهة لعنوان خارجي خارج المملكة. فصّل إجراءات العزل والاحتواء وفق نظام حماية البيانات الشخصية.',
      suggestedAnswerEn: 'Execute automated network isolation at edge firewalls, revoke API tokens, capture cryptographic forensic snapshots, verify zero candidate PII was exfiltrated, and submit mandatory incident notification to National Cyber Security Center within required SLA.',
      suggestedAnswerAr: 'تنفيذ عزل فوري للشبكة عبر جدران الحماية الحدودية، وإلغاء مفاتيح API، وأخذ لقطة جنائية مشفرة، والتحقق من عدم تسرب أي بيانات شخصية، وتقديم بلاغ رسمي للمركز الوطني للأمن السيبراني ضمن المهلة النظامية.',
      keyRubricsEn: [
        'Immediate automated perimeter isolation preventing sovereign data leakage',
        'Preservation of cryptographic forensic evidence for auditing',
        'Mandatory regulatory escalation compliant with Saudi PDPL & NCA frameworks'
      ],
      keyRubricsAr: [
        'العزل الفوري لمنع أي تسريب خارج الحدود الوطنية',
        'حفظ الأدلة الجنائية الرقمية المشفرة للتدقيق',
        'الرفع الإلزامي للبلاغات وفق نظام حماية البيانات والضوابط الوطنية'
      ]
    }
  ]
};

// Generic synthesizer function if a brand new requisition is created
export const generateAiQuestionsForJob = (job: JobRequisition): InterviewQuestionItem[] => {
  // Check if predefined template exists
  if (JOB_SPECIFIC_QUESTION_TEMPLATES[job.code]) {
    return JOB_SPECIFIC_QUESTION_TEMPLATES[job.code];
  }
  if (JOB_SPECIFIC_QUESTION_TEMPLATES[job.id]) {
    return JOB_SPECIFIC_QUESTION_TEMPLATES[job.id];
  }

  // Synthesize tailored questions based on job title & requirements
  const now = new Date().toISOString();
  return [
    {
      id: `ai-gen-${Date.now()}-1`,
      questionNumber: 1,
      requisitionCode: job.code,
      jobTitle: job.title,
      aiGenerated: true,
      generatedAt: now,
      category: `Technical Core Competencies: ${job.title}`,
      questionType: 'Technical',
      competency: `GACA Standards & SANS Operational Framework for ${job.title}`,
      roleFamily: job.department,
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Advanced',
      questionEn: `Based on the technical demands of ${job.title}, detail your approach to diagnosing and resolving mission-critical operational challenges while adhering to Saudi aviation safety standards.`,
      questionAr: `بناءً على المتطلبات الفنية لوظيفة ${job.titleAr || job.title}، فصّل منهجيتك في تشخيص وحل التحديات التشغيلية الحساسة مع الالتزام بمعايير السلامة الجوية المعتمدة بالمملكة.`,
      suggestedAnswerEn: `Demonstrates deep knowledge of ${job.requirements?.[0] || 'regulatory standards'}, follows structured diagnostic protocols, and prioritizes airspace safety above throughput.`,
      suggestedAnswerAr: `إظهار معرفة دقيقة بالمعايير التنظيمية، وتطبيق منهجية تشخيصية منظمة، وتقديم سلامة الملاحة الجوية على أي اعتبارات أخرى.`,
      keyRubricsEn: [
        'Demonstrates subject matter expertise and GACA regulatory alignment',
        'Structured analytical problem-solving sequence',
        'Safety-first mindset and procedural compliance'
      ],
      keyRubricsAr: [
        'إظهار الإلمام التام بالمعايير واللوائح التنظيمية للطيران المدني',
        'التحليل المنهجي المنظم للتحديات التشغيلية',
        'تقديم السلامة كأولوية قصوى والالتزام بالإجراءات'
      ]
    },
    {
      id: `ai-gen-${Date.now()}-2`,
      questionNumber: 2,
      requisitionCode: job.code,
      jobTitle: job.title,
      aiGenerated: true,
      generatedAt: now,
      category: `High-Stress Situational & Emergency Management`,
      questionType: 'Situational',
      competency: 'Crisis Decision Making & High-Workload Prioritization',
      roleFamily: job.department,
      mandatory: true,
      durationSeconds: 120,
      difficulty: 'Expert',
      questionEn: `You encounter an emergency or critical bottleneck during peak operations in ${job.location}. How do you triage urgent tasks, communicate with stakeholders, and restore nominal operational status?`,
      questionAr: `واجهت حالة طارئة أو اختناقاً تشغيلياً حرجاً أثناء أوقات الذروة في ${job.location}. كيف ترتب الأولويات للتواصل مع الجهات المعنية واستعادة الحالة التشغيلية الطبيعية؟`,
      suggestedAnswerEn: `Immediate isolation of root cause, tactical delegation, continuous status broadcast to supervisors, and structured post-incident documentation.`,
      suggestedAnswerAr: `العزل الفوري لمصدر الخلل، والتفويض التكتيكي، والتواصل المستمر مع المشرفين، والتوثيق المنظم لما بعد الحادث.`,
      keyRubricsEn: [
        'Calm triage and prioritization under severe operational stress',
        'Concise multi-party coordination and stakeholder notification',
        'Safe recovery to nominal state without cascading failures'
      ],
      keyRubricsAr: [
        'الهدوء وحسن ترتيب الأولويات تحت الضغط التشغيلي الشديد',
        'التواصل الفعال والموجز مع أطراف المنظومة',
        'التعافي الآمن وتفادي أي أخطاء متتالية'
      ]
    },
    {
      id: `ai-gen-${Date.now()}-3`,
      questionNumber: 3,
      requisitionCode: job.code,
      jobTitle: job.title,
      aiGenerated: true,
      generatedAt: now,
      category: `Collaborative Teamwork & ICAO Standard Discipline`,
      questionType: 'Behavioral',
      competency: 'Crew Resource Management (CRM) & Inter-Agency Communication',
      roleFamily: job.department,
      mandatory: false,
      durationSeconds: 90,
      difficulty: 'Standard',
      questionEn: `Describe a time when you experienced professional disagreement with a colleague or partner agency regarding an operational protocol. How did you resolve the situation professionally?`,
      questionAr: `صف موقفاً واجهت فيه اختلافاً في الرأي المهني مع زميل أو جهة شريكة حول إجراء تشغيلي. كيف قمت بحل الموقف باحترافية؟`,
      suggestedAnswerEn: `Referenced standard operating procedures (SOP), maintained respect, sought supervisor alignment when necessary, and ensured collaborative alignment.`,
      suggestedAnswerAr: 'الرجوع للإجراءات التشغيلية القياسية، الحفاظ على الاحترام المهني، إشراك المشرف عند الحاجة، وضمان التوافق التشاركي.',
      keyRubricsEn: [
        'Active listening and non-confrontational communication',
        'Objective reliance on published SOPs and regulatory standards',
        'Commitment to continuous team improvement and safety culture'
      ],
      keyRubricsAr: [
        'الإنصات الإيجابي والتواصل البنّاء',
        'الاستناد الموضوعي للإجراءات القياسية واللوائح',
        'الالتزام بثقافة السلامة وتطوير بيئة العمل'
      ]
    }
  ];
};
