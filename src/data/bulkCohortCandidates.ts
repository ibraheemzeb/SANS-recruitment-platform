import { Candidate, CandidateApplication } from '../types';

export const BULK_COHORT_CANDIDATES: Candidate[] = [
  {
    id: 'cand-005',
    name: 'Capt. Tariq Al-Harbi',
    nameAr: 'كابتن طارق الحربي',
    nationalId: '1098234112',
    nationality: 'Saudi',
    currentTitle: 'Senior Radar Controller (ACC)',
    currentTitleAr: 'مراقب راداري أول (مركز مراقبة المنطقة)',
    experienceYears: 8,
    education: 'B.Sc. in Aviation Management & Air Traffic Control - King Abdulaziz University',
    educationAr: 'بكالوريوس إدارة الطيران والمراقبة الجوية - جامعة الملك عبدالعزيز',
    certifications: ['GACA Radar Area Rating (ACC)', 'ICAO English Level 5 (Operational)', 'SANS Advanced Separation 2025', 'Class 1 Aviation Medical'],
    keyStrengths: 'High-density terminal conflict management; 6,200 radar operating hours; zero loss of separation record.',
    keyStrengthsAr: 'إدارة تدفق حركة الملاحة الكثيفة؛ 6200 ساعة تشغيل راداري؛ سجل خالٍ من أي فقدان في مسافات الفصل.',
    identifiedGaps: 'None',
    identifiedGapsAr: 'لا توجد فجوات ملاحية',
    rawMatchScore: 96,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 94,
    mercerPercentile: 91,
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewCompleted: false,
    finalSelected: false,
    clearances: {
      nafath: { status: 'Verified', token: 'NFT-991283-TRQ', date: '2026-10-28 08:30 AST' },
      amn: { status: 'Approved', issuer: 'Air Navigation Security Directorate' },
      medical: { status: 'Valid', detail: 'GACA Class 1 - Aeromedical Center Jeddah (Valid thru Dec 2027)' },
      address: { status: 'Confirmed', detail: 'Al-Malqa, Riyadh, KSA', detailAr: 'حي الملقا، الرياض، المملكة العربية السعودية' }
    },
    cvRawText: `CAPT. TARIQ AL-HARBI
Senior Radar Controller - Riyadh Area Control Center
GACA License: ATC-2018-9921 | ICAO Level 5 | 8+ Years Operational Experience
Experience:
- Senior Radar Controller, Riyadh ACC (2020 - Present): Controlling Sector 4 & 5 high-altitude traffic, peak flow 42 movements/hour.
- Aerodrome & Approach Controller, King Fahd Intl (2018 - 2020): Tower control, visual and radar separation.
Certifications: GACA Radar En-Route, ICAO Level 5 Radiotelephony, SANS CDM Protocol.`,
    citations: [
      {
        criterion: 'Radar Experience (Mandatory 5+ yrs)',
        criterionAr: 'الخبرة الرادارية الميدانية (إلزامي 5+ سنوات)',
        confidence: 'High (98%)',
        confidenceAr: 'تطابق تام (98%)',
        quote: 'Controlling Sector 4 & 5 high-altitude traffic, peak flow 42 movements/hour.',
        quoteAr: 'التحكم في حركة المرور بالارتفاعات العالية بالقطاعين 4 و5 بمعدل ذروة 42 حركة/ساعة.'
      }
    ],
    interviewTranscript: {
      question: 'How do you handle unexpected airspace level busts during severe convective weather?',
      questionAr: 'كيف تتعامل مع انحرافات الارتفاع غير المخططة أثناء التقلبات الجوية الحادة؟',
      answer: 'I immediately establish emergency 2,000 ft vertical buffer, coordinate lateral avoidance with adjacent sector, and cross-verify with transponder Mode-C.',
      answerAr: 'أطبق فوراً هامش فصل رأسي 2000 قدم، وأنسق التفادي الجانبي مع القطاع المجاور، وأتحقق من قراءات Mode-C.',
      audioText: 'I immediately establish emergency 2,000 ft vertical buffer, coordinate lateral avoidance with adjacent sector, and cross-verify with transponder Mode-C.',
      audioTextAr: 'أطبق فوراً هامش فصل رأسي 2000 قدم، وأنسق التفادي الجانبي مع القطاع المجاور، وأتحقق من قراءات Mode-C.'
    }
  },
  {
    id: 'cand-006',
    name: 'Eng. Laila Al-Mutairi',
    nameAr: 'م. ليلى المطيري',
    nationalId: '1076123491',
    nationality: 'Saudi',
    currentTitle: 'CNS Systems & Radar Specialist',
    currentTitleAr: 'أخصائية أنظمة الاتصالات والاستطلاع والملاحة',
    experienceYears: 6,
    education: 'B.Sc. in Telecommunications & Avionics Engineering - Effat University',
    educationAr: 'بكالوريوس هندسة الاتصالات والإلكترونيات الملاحية - جامعة عفت',
    certifications: ['GACA CNS Radar Ground Systems Certification', 'ICAO English Level 5', 'Eurocontrol Surveillance Systems Certified'],
    keyStrengths: 'Primary & Secondary Surveillance Radar (PSR/SSR) maintenance, Mode-S transponder calibration, ADS-B ground station monitoring.',
    keyStrengthsAr: 'صيانة رادارات المراقبة الأولية والثانوية (PSR/SSR)، معايرة أجهزة Mode-S، ومراقبة محطات ADS-B الأرضية.',
    identifiedGaps: 'Needs SANS SOP 4.2 En-Route refresher',
    identifiedGapsAr: 'تتطلب دورة تنشيطية في بروتوكول SANS SOP 4.2',
    rawMatchScore: 92,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 91,
    mercerPercentile: 88,
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewCompleted: false,
    finalSelected: false,
    clearances: {
      nafath: { status: 'Verified', token: 'NFT-887123-LYL', date: '2026-10-28 08:35 AST' },
      amn: { status: 'Approved', issuer: 'Air Navigation Security Directorate' },
      medical: { status: 'Valid', detail: 'GACA Class 2 Technical Clearance (Valid thru 2028)' },
      address: { status: 'Confirmed', detail: 'Al-Sulaimaniyah, Riyadh, KSA', detailAr: 'حي السليمانية، الرياض، المملكة العربية السعودية' }
    },
    cvRawText: `ENG. LAILA AL-MUTAIRI
CNS Systems & Radar Avionics Engineer
Education: B.Sc. Avionics & Telecommunications Engineering
Experience:
- SANS Radar Maintenance Specialist (2021 - Present): Overseeing Mode-S radar heads and ADS-B receiver coverage across Central Sector.
- Avionics Field Engineer, GACA Technical Services (2019 - 2021): Calibration of Instrument Landing Systems (ILS) and VOR beacons.`,
    citations: [
      {
        criterion: 'CNS Certifications & Radar Maintenance',
        criterionAr: 'شهادات أنظمة الاتصالات والملاحة وصيانة الرادار',
        confidence: 'High (95%)',
        confidenceAr: 'تطابق تام (95%)',
        quote: 'Overseeing Mode-S radar heads and ADS-B receiver coverage across Central Sector.',
        quoteAr: 'الإشراف على محطات رادارات Mode-S وتغطية أجهزة استقبال ADS-B في القطاع الأوسط.'
      }
    ],
    interviewTranscript: {
      question: 'Explain the protocol when primary radar data is lost and only secondary radar is available.',
      questionAr: 'اشرحي الإجراء المتبع عند فقدان بيانات الرادار الأولي والاعتماد على الرادار الثانوي فقط.',
      answer: 'We immediately enforce mandatory Mode-C transponder verification, alert controllers of non-correlated target status, and dispatch maintenance teams.',
      answerAr: 'نلزم فوراً بالتحقق من أجهزة Mode-C، ونخطر المراقبين بحالة الأهداف غير المترابطة، ونوجه فرق الصيانة للتدخل الفوري.',
      audioText: 'We immediately enforce mandatory Mode-C transponder verification, alert controllers of non-correlated target status, and dispatch maintenance teams.',
      audioTextAr: 'نلزم فوراً بالتحقق من أجهزة Mode-C، ونخطر المراقبين بحالة الأهداف غير المترابطة، ونوجه فرق الصيانة للتدخل الفوري.'
    }
  },
  {
    id: 'cand-007',
    name: 'Mansour Al-Ghamdi',
    nameAr: 'منصور الغامدي',
    nationalId: '1088492019',
    nationality: 'Saudi',
    currentTitle: 'En-Route Air Traffic Controller',
    currentTitleAr: 'مراقب حركة جوية مسارات ملاحية',
    experienceYears: 7,
    education: 'Diploma in Air Traffic Control - Saudi Civil Aviation Academy (SCAA)',
    educationAr: 'دبلوم المراقبة الجوية - الأكاديمية السعودية للطيران المدني',
    certifications: ['GACA En-Route Controller Rating', 'ICAO English Level 6 (Expert)', 'Red Sea Oceanic Airspace Routing'],
    keyStrengths: 'Oceanic routing coordination, Red Sea airspace conflict management, rapid descent procedures.',
    keyStrengthsAr: 'تنسيق المسارات الملاحية فوق البحر الأحمر، إدارة تعارضات الملاحة الجوية، وإجراءات الهبوط السريع.',
    identifiedGaps: 'None',
    identifiedGapsAr: 'لا توجد فجوات ملاحية',
    rawMatchScore: 89,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 88,
    mercerPercentile: 84,
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewCompleted: false,
    finalSelected: false,
    clearances: {
      nafath: { status: 'Verified', token: 'NFT-773412-MNS', date: '2026-10-28 08:40 AST' },
      amn: { status: 'Approved', issuer: 'Air Navigation Security Directorate' },
      medical: { status: 'Valid', detail: 'GACA Class 1 - Valid thru 2027' },
      address: { status: 'Confirmed', detail: 'Al-Rawdah, Jeddah, KSA', detailAr: 'حي الروضة، جدة، المملكة العربية السعودية' }
    },
    cvRawText: `MANSOUR AL-GHAMDI
En-Route Air Traffic Controller - Jeddah ACC
7 Years Experience in Oceanic & En-Route Traffic Management
GACA ATC Rating: Jeddah En-Route West | ICAO Level 6 Expert`,
    citations: [
      {
        criterion: 'Aviation Licenses & ICAO English',
        criterionAr: 'التراخيص الملاحية والإنجليزية وفق إيكاو',
        confidence: 'High (99%)',
        confidenceAr: 'تطابق تام (99%)',
        quote: 'GACA ATC Rating: Jeddah En-Route West | ICAO Level 6 Expert',
        quoteAr: 'رخصة مراقب جوي مسار غرب جدة وكفاءة إنجليزية إيكاو المستوى 6 خبير.'
      }
    ],
    interviewTranscript: {
      question: 'How do you coordinate non-radar oceanic separation along the Red Sea boundary?',
      questionAr: 'كيف تنسق الفصل الإجرائي الملاحي غير الراداري على حدود المجال الجوي للبحر الأحمر؟',
      answer: 'We utilize Mach Number Technique and CPDLC waypoint reporting to establish 10-minute longitudinal separation.',
      answerAr: 'نطبق تقنية رقم ماخ ورسائل CPDLC عبر نقاط المسار لتحقيق فصل زمني طولي قدره 10 دقائق.',
      audioText: 'We utilize Mach Number Technique and CPDLC waypoint reporting to establish 10-minute longitudinal separation.',
      audioTextAr: 'نطبق تقنية رقم ماخ ورسائل CPDLC عبر نقاط المسار لتحقيق فصل زمني طولي قدره 10 دقائق.'
    }
  },
  {
    id: 'cand-008',
    name: 'Hessa Al-Qahtani',
    nameAr: 'حصة القحطاني',
    nationalId: '1066382910',
    nationality: 'Saudi',
    currentTitle: 'Aeronautical Information Analyst (AIM)',
    currentTitleAr: 'محللة معلومات وبيانات الطيران الملاحي',
    experienceYears: 5,
    education: 'B.Sc. in Geographic Information Systems & Aviation Cartography - Princess Nourah University',
    educationAr: 'بكالوريوس نظم المعلومات الجغرافية وخرائط الطيران - جامعة الأميرة نورة',
    certifications: ['ICAO Annex 15 AIM Specialist', 'eAIP Digital Charting Certified', 'GACA Aeronautical Data Quality (ADQ)'],
    keyStrengths: 'Aeronautical Information Publication (eAIP), NOTAM issuance management, electronic terrain and obstacle data (eTOD).',
    keyStrengthsAr: 'إدارة دليل معلومات الطيران الإلكتروني (eAIP)، إصدار وإدارة إشعارات الطيارين NOTAM، وبيانات التضاريس والموانع eTOD.',
    identifiedGaps: 'Requires active radar console shadow hours',
    identifiedGapsAr: 'تتطلب ساعات محاكاة رادارية إضافية',
    rawMatchScore: 87,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 86,
    mercerPercentile: 82,
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewCompleted: false,
    finalSelected: false,
    clearances: {
      nafath: { status: 'Verified', token: 'NFT-661902-HSS', date: '2026-10-28 08:45 AST' },
      amn: { status: 'Approved', issuer: 'Air Navigation Security Directorate' },
      medical: { status: 'Valid', detail: 'GACA Class 3 Clearance (Valid thru 2028)' },
      address: { status: 'Confirmed', detail: 'Al-Nakheel, Riyadh, KSA', detailAr: 'حي النخيل، الرياض، المملكة العربية السعودية' }
    },
    cvRawText: `HESSA AL-QAHTANI
Aeronautical Information Management (AIM) Analyst
5 Years Experience in NOTAM systems and eAIP digital charting.`,
    citations: [
      {
        criterion: 'Aeronautical Information Management (AIM)',
        criterionAr: 'إدارة معلومات وبيانات الطيران الملاحي',
        confidence: 'High (94%)',
        confidenceAr: 'تطابق تام (94%)',
        quote: '5 Years Experience in NOTAM systems and eAIP digital charting.',
        quoteAr: '5 سنوات خبرة في أنظمة نوتام وتخطيط دليل معلومات الطيران الرقمي eAIP.'
      }
    ],
    interviewTranscript: {
      question: 'What is the priority sequence for issuing emergency airspace restriction NOTAMs?',
      questionAr: 'ما هو التسلسل الإجرائي العاجل لإصدار إشعار NOTAM يقيد المجال الجوي في حالات الطوارئ؟',
      answer: 'We coordinate with GACA safety office, construct the standard Q-line, and transmit through the International NOTAM Office within 15 minutes.',
      answerAr: 'ننسق فوراً مع مكتب السلامة، وننشئ رمز Q-line القياسي، ونبثه عبر مكتب النوتام الدولي خلال 15 دقيقة.',
      audioText: 'We coordinate with GACA safety office, construct the standard Q-line, and transmit through the International NOTAM Office within 15 minutes.',
      audioTextAr: 'ننسق فوراً مع مكتب السلامة، وننشئ رمز Q-line القياسي، ونبثه عبر مكتب النوتام الدولي خلال 15 دقيقة.'
    }
  },
  {
    id: 'cand-009',
    name: 'Faisal Al-Dosari',
    nameAr: 'فيصل الدوسري',
    nationalId: '1055271890',
    nationality: 'Saudi',
    currentTitle: 'Aviation Cybersecurity Operations Lead',
    currentTitleAr: 'أخصائي أمن سيبراني للملاحة الجوية',
    experienceYears: 7,
    education: 'B.Sc. in Cybersecurity & Information Assurance - King Fahd University of Petroleum & Minerals (KFUPM)',
    educationAr: 'بكالوريوس الأمن السيبراني وضمان المعلومات - جامعة الملك فهد للبترول والمعادن',
    certifications: ['NCA-ECC Certified Cyber Auditor', 'ICAO Aviation Cybersecurity Strategy Certification', 'CISSP'],
    keyStrengths: 'Air traffic control network isolation, SCADA radar link encryption, zero-trust perimeter defense under NCA-ECC standards.',
    keyStrengthsAr: 'عزل شبكات المراقبة الجوية، تشفير وصلات رادارات SCADA، وتطبيق بنية الثقة الصفرية وفق ضوابط الهيئة الوطنية للأمن السيبراني.',
    identifiedGaps: 'None',
    identifiedGapsAr: 'لا توجد فجوات ملاحية',
    rawMatchScore: 94,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 93,
    mercerPercentile: 89,
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewCompleted: false,
    finalSelected: false,
    clearances: {
      nafath: { status: 'Verified', token: 'NFT-552190-FSL', date: '2026-10-28 08:50 AST' },
      amn: { status: 'Approved', issuer: 'Air Navigation Security Directorate' },
      medical: { status: 'Valid', detail: 'Technical Ground Medical Clearance (Valid thru 2028)' },
      address: { status: 'Confirmed', detail: 'Al-Faisaliyah, Dammam, KSA', detailAr: 'حي الفيصلية، الدمام، المملكة العربية السعودية' }
    },
    cvRawText: `FAISAL AL-DOSARI
Aviation Cybersecurity Operations Lead
7 Years Securing Critical Civil Aviation Network Infrastructure
Certifications: CISSP, NCA-ECC-1:2018, ICAO Cybersecurity Aviation Security`,
    citations: [
      {
        criterion: 'Aviation Cybersecurity & NCA-ECC',
        criterionAr: 'الأمن السيبراني للملاحة وضوابط NCA-ECC',
        confidence: 'High (97%)',
        confidenceAr: 'تطابق تام (97%)',
        quote: 'Certifications: CISSP, NCA-ECC-1:2018, ICAO Cybersecurity Aviation Security',
        quoteAr: 'شهادات معتمدة: CISSP، ضوابط الهيئة الوطنية للأمن السيبراني، وأمن الطيران المدني الدولي.'
      }
    ],
    interviewTranscript: {
      question: 'How do you secure VHF and ADS-B ground data feeds from radio-frequency spoofing?',
      questionAr: 'كيف تؤمن بيانات الاتصال اللاسلكي وتغذية ADS-B الأرضية ضد محاولات التزييف الإلكتروني؟',
      answer: 'We deploy multi-lateration cross-verification, cryptographic timestamping, and isolate ADS-B feeds through hardware security modules.',
      answerAr: 'نطبق تقنية التحقق التبادلي متعدد المواقع، والتوقيع الزمني المشفر، وعزل تدفقات ADS-B عبر وحدات أمان مادية HSM.',
      audioText: 'We deploy multi-lateration cross-verification, cryptographic timestamping, and isolate ADS-B feeds through hardware security modules.',
      audioTextAr: 'نطبق تقنية التحقق التبادلي متعدد المواقع، والتوقيع الزمني المشفر، وعزل تدفقات ADS-B عبر وحدات أمان مادية HSM.'
    }
  }
];

export const BULK_COHORT_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'APP-2026-611',
    candidateId: 'cand-005',
    candidateName: 'Capt. Tariq Al-Harbi',
    candidateNameAr: 'كابتن طارق الحربي',
    requisitionId: 'req-001',
    requisitionCode: 'REQ-ATC-2026-088',
    jobTitle: 'Senior Air Traffic Control Specialist',
    jobTitleAr: 'أخصائي أول مراقبة ملاحة جوية',
    department: 'Air Traffic Management & En-Route Operations',
    departmentAr: 'إدارة الحركة الجوية والمسارات الملاحية',
    location: 'Riyadh ACC (Area Control Center)',
    submittedAt: '2026-10-28 08:30 AST',
    cvFileName: 'Capt_Tariq_AlHarbi_Senior_ATC_CV.pdf',
    status: 'Submitted',
    stageIndex: 1,
    screeningScore: 96,
    mandatoryCriteriaMet: true,
    screeningSummary: 'GACA En-Route Rating, 8 years radar experience, and ICAO Level 5 extracted.',
    screeningSummaryAr: 'رخصة ملاحة رادارية معتمدة، 8 سنوات خبرة، والمستوى 5 في الإنجليزية الملاحية.',
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewScore: undefined,
    nafathStatus: 'Verified'
  },
  {
    id: 'APP-2026-612',
    candidateId: 'cand-006',
    candidateName: 'Eng. Laila Al-Mutairi',
    candidateNameAr: 'م. ليلى المطيري',
    requisitionId: 'req-002',
    requisitionCode: 'REQ-CNS-2026-042',
    jobTitle: 'CNS Systems & Radar Specialist',
    jobTitleAr: 'أخصائية أنظمة الاتصالات والاستطلاع والملاحة',
    department: 'Aviation Engineering & Systems Maintenance',
    departmentAr: 'الهندسة الملاحية وصيانة الأنظمة',
    location: 'Riyadh SANS Technical Operations',
    submittedAt: '2026-10-28 08:35 AST',
    cvFileName: 'Eng_Laila_AlMutairi_CNS_Radar_CV.docx',
    status: 'Submitted',
    stageIndex: 1,
    screeningScore: 92,
    mandatoryCriteriaMet: true,
    screeningSummary: 'B.Sc. Avionics, 6 years Mode-S radar heads and ADS-B ground stations maintenance.',
    screeningSummaryAr: 'بكالوريوس إلكترونيات الطيران، 6 سنوات صيانة رادارات Mode-S ومحطات ADS-B.',
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewScore: undefined,
    nafathStatus: 'Verified'
  },
  {
    id: 'APP-2026-613',
    candidateId: 'cand-007',
    candidateName: 'Mansour Al-Ghamdi',
    candidateNameAr: 'منصور الغامدي',
    requisitionId: 'req-001',
    requisitionCode: 'REQ-ATC-2026-088',
    jobTitle: 'En-Route Air Traffic Controller',
    jobTitleAr: 'مراقب حركة جوية مسارات ملاحية',
    department: 'Air Traffic Management & En-Route Operations',
    departmentAr: 'إدارة الحركة الجوية والمسارات الملاحية',
    location: 'Jeddah ACC (Western Region)',
    submittedAt: '2026-10-28 08:40 AST',
    cvFileName: 'Mansour_AlGhamdi_EnRoute_ATC.pdf',
    status: 'Submitted',
    stageIndex: 1,
    screeningScore: 89,
    mandatoryCriteriaMet: true,
    screeningSummary: 'ICAO Level 6 Expert, 7 years Red Sea oceanic routing experience.',
    screeningSummaryAr: 'المستوى السادس في الإنجليزية الملاحية، 7 سنوات في مسارات البحر الأحمر.',
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewScore: undefined,
    nafathStatus: 'Verified'
  },
  {
    id: 'APP-2026-614',
    candidateId: 'cand-008',
    candidateName: 'Hessa Al-Qahtani',
    candidateNameAr: 'حصة القحطاني',
    requisitionId: 'req-003',
    requisitionCode: 'REQ-AIM-2026-019',
    jobTitle: 'Aeronautical Information Analyst (AIM)',
    jobTitleAr: 'محللة معلومات وبيانات الطيران الملاحي',
    department: 'Aeronautical Data & Digital Airspace Services',
    departmentAr: 'بيانات الطيران والخدمات الملاحية الرقمية',
    location: 'Riyadh SANS Headquarters',
    submittedAt: '2026-10-28 08:45 AST',
    cvFileName: 'Hessa_AlQahtani_AIM_Aviation_CV.pdf',
    status: 'Submitted',
    stageIndex: 1,
    screeningScore: 87,
    mandatoryCriteriaMet: true,
    screeningSummary: 'eAIP Digital Cartography, NOTAM management, 5 years GIS aviation experience.',
    screeningSummaryAr: 'إدارة دليل الطيران الإلكتروني eAIP ونظام NOTAM مع 5 سنوات خبرة نظم جغرافية.',
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewScore: undefined,
    nafathStatus: 'Verified'
  },
  {
    id: 'APP-2026-615',
    candidateId: 'cand-009',
    candidateName: 'Faisal Al-Dosari',
    candidateNameAr: 'فيصل الدوسري',
    requisitionId: 'req-004',
    requisitionCode: 'REQ-SEC-2026-007',
    jobTitle: 'Aviation Cybersecurity Specialist',
    jobTitleAr: 'أخصائي أمن سيبراني للملاحة الجوية',
    department: 'Cybersecurity & Critical Infrastructure Defense',
    departmentAr: 'الأمن السيبراني وحماية البنية التحتية الحساسة',
    location: 'Dammam King Fahd International ACC',
    submittedAt: '2026-10-28 08:50 AST',
    cvFileName: 'Faisal_AlDosari_Aviation_Cybersecurity.pdf',
    status: 'Submitted',
    stageIndex: 1,
    screeningScore: 94,
    mandatoryCriteriaMet: true,
    screeningSummary: 'NCA-ECC certified, CISSP, 7 years securing mission-critical air traffic control networks.',
    screeningSummaryAr: 'معتمد من هيئة الأمن السيبراني NCA-ECC وCISSP، 7 سنوات حماية شبكات الملاحة الجوية.',
    cvScannedByRecruiter: false,
    shortlistedByRecruiter: false,
    interviewScore: undefined,
    nafathStatus: 'Verified'
  }
];
