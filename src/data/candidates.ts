import { Candidate } from '../types';

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'CAND-8491',
    name: 'Mohammad Al-Zahrani',
    nameAr: 'محمد الزهراني',
    nationalId: '1098234812',
    nationality: 'Saudi',
    currentTitle: 'Senior En-Route Air Traffic Controller',
    currentTitleAr: 'مراقب ملاحة جوية أول - قطاع المسار',
    experienceYears: 7,
    education: 'BSc Aviation Management - King Abdulaziz University (2019)',
    educationAr: 'بكالوريوس إدارة الطيران - جامعة الملك عبدالعزيز (2019)',
    certifications: [
      'GACA ATC License (En-Route Radar #7891)',
      'ICAO English Language Proficiency Level 5',
      'SANS OJTI Instructor Rating'
    ],
    keyStrengths: '7 yrs en-route radar, SANS certified OJTI instructor, ICAO Level 5 English.',
    keyStrengthsAr: 'خبرة 7 سنوات رادار مسار، مدرب معتمد OJTI، كفاءة لغة إنجليزية مستوى 5 إيكاو.',
    identifiedGaps: 'None (Meets 100% of mandatory & preferred criteria)',
    identifiedGapsAr: 'لا توجد (مستوفٍ لجميع المتطلبات الإلزامية والمفضلة 100%)',
    rawMatchScore: 96,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 94,
    mercerPercentile: 91,
    clearances: {
      nafath: {
        status: 'Verified',
        token: 'NF-98214-SA',
        date: '2026-10-22 09:14 AST'
      },
      amn: {
        status: 'Approved',
        issuer: 'SANS Security Directorate'
      },
      medical: {
        status: 'Valid',
        detail: 'GACA Class 1 Medical Fitness (Valid to Dec 2027)'
      },
      address: {
        status: 'Confirmed',
        detail: 'Riyadh, Al-Malqa District, Building 42',
        detailAr: 'الرياض، حي الملقا، مبنى 42'
      }
    },
    cvRawText: `CURRICULUM VITAE
Mohammad Al-Zahrani | Riyadh, Saudi Arabia | mohammad.zahrani.fake@sans.gov.sa

EXECUTIVE SUMMARY
Senior En-Route Air Traffic Control Specialist with over 7 years of operational radar experience controlling congested upper airspace at the Riyadh Area Control Center (ACC). Certified On-the-Job Training Instructor (OJTI) holding valid GACA license and ICAO Level 5 English proficiency.

PROFESSIONAL EXPERIENCE
Senior Air Traffic Controller | Saudi Air Navigation Services (SANS) | 2019 – Present
- Actively managed en-route radar sectors controlling high-density commercial overflights exceeding 120 movements/hour.
- Served as authorized OJTI, training and certifying 8 junior air traffic controllers.
- Applied SANS standard operating procedures for emergency descent, severe weather deviations, and military airspace coordination.
- Zero safety operational deviations recorded across 7 consecutive years.

EDUCATION & LICENSING
- Bachelor of Science in Aviation Management | King Abdulaziz University, 2019
- GACA Air Traffic Controller License (En-Route Radar Rating #7891)
- ICAO English Language Proficiency Rating: Level 5 (Extended)`,
    citations: [
      {
        criterion: 'En-Route Radar Experience (Mandatory 5+ yrs)',
        criterionAr: 'خبرة رادار قطاع المسار (إلزامي 5+ سنوات)',
        confidence: 'High (100%)',
        confidenceAr: 'تطابق تام (100%)',
        quote: 'Actively managed en-route radar sectors controlling high-density commercial overflights exceeding 120 movements/hour over 7 operational years.',
        quoteAr: 'إدارة قطاعات رادار المسار الفعلي بكثافة حركة تجارية تتجاوز 120 حركة/ساعة على مدى 7 سنوات تشغيلية.'
      },
      {
        criterion: 'GACA ATC License & ICAO English Level 5',
        criterionAr: 'رخصة ملاحة جوية واختبار لغة إيكاو المستوى 5',
        confidence: 'High (100%)',
        confidenceAr: 'تطابق تام (100%)',
        quote: 'GACA Air Traffic Controller License (En-Route Radar Rating #7891) with ICAO English Language Proficiency Rating: Level 5.',
        quoteAr: 'رخصة مراقب جوي معتمدة من هيئة الطيران المدني برقم 7891 وكفاءة لغة إنجليزية مستوى 5 إيكاو.'
      },
      {
        criterion: 'Preferred SANS OJTI Instructor Rating',
        criterionAr: 'تقييم مدرب تدريب على رأس العمل مفضل (OJTI)',
        confidence: 'Exceeds Requirement',
        confidenceAr: 'يتجاوز المتطلبات',
        quote: 'Served as authorized OJTI, training and certifying 8 junior air traffic controllers.',
        quoteAr: 'العمل كمدرب معتمد على رأس العمل لتدريب واعتماد 8 مراقبين جويين جدد.'
      }
    ],
    interviewTranscript: {
      question: 'Question 2: Describe your protocol when managing sudden cabin depressurization on an aircraft in high-density en-route airspace.',
      questionAr: 'السؤال 2: صف بروتوكول العمل المتبع عند التعامل مع حالة انخفاض مفاجئ في ضغط كابينة الطائرة في قطاع مسار مزدحم.',
      answer: 'When a sudden depressurization occurs, my immediate priority under SANS Standard Operating Procedure 4.2 is issuing rapid emergency descent clearance down to FL100. Simultaneously, I broadcast immediate traffic alerts to all surrounding aircraft within 20 nautical miles, assign radar vector separation, and alert adjacent Jeddah and Gulf sectors for seamless handover.',
      answerAr: 'عند حدوث انخفاض مفاجئ في الضغط الجوي، أولويتي الفورية وفق إجراءات الملاحة الجوية القياسية هي إعطاء تصريح هبوط اضطراري فوري إلى مستوى 100، وبث تحذيرات ملاحية لكافة الطائرات ضمن مسافة 20 ميلاً بحرياً، وتنسيق التسليم المباشر مع القطاعات المجاورة.',
      audioText: 'When a sudden depressurization occurs, my immediate priority under SANS Standard Operating Procedure 4.2 is issuing rapid emergency descent clearance down to FL100. Simultaneously, I broadcast immediate traffic alerts to all surrounding aircraft within 20 nautical miles, assign radar vector separation, and alert adjacent Jeddah and Gulf sectors for seamless handover.',
      audioTextAr: 'عند حدوث انخفاض مفاجئ في الضغط الجوي، أولويتي الفورية وفق إجراءات الملاحة الجوية القياسية هي إعطاء تصريح هبوط اضطراري فوري إلى مستوى 100، وبث تحذيرات ملاحية لكافة الطائرات ضمن مسافة 20 ميلاً بحرياً، وتنسيق التسليم المباشر مع القطاعات المجاورة.'
    }
  },
  {
    id: 'CAND-8492',
    name: 'Noura Al-Shehri',
    nameAr: 'نورة الشهري',
    nationalId: '1087452391',
    nationality: 'Saudi',
    currentTitle: 'Air Operations & Tactical Radar Specialist',
    currentTitleAr: 'أخصائية عمليات ومراقبة رادار تكتيكي',
    experienceYears: 5,
    education: 'BSc Aeronautical Engineering - Alfaisal University (2021)',
    educationAr: 'بكالوريوس هندسة طيران وملاحة - جامعة الفيصل (2021)',
    certifications: [
      'Tactical Radar & Airspace Vectoring Certification',
      'ICAO English Language Proficiency Level 4',
      'GACA Class 1 Medical Fitness'
    ],
    keyStrengths: '5 yrs tactical radar operations, Aeronautical Engineering degree, high analytical reasoning.',
    keyStrengthsAr: 'خبرة 5 سنوات رادار تكتيكي وعمليات، شهادة هندسة طيران، كفاءة تحليلية استثنائية.',
    identifiedGaps: 'Military-to-civilian radar transition; civilian SANS ATM system onboarding recommended.',
    identifiedGapsAr: 'تحتاج تأهيلاً لأنظمة إدارة الحركة الجوية المدنية في الملاحة.',
    rawMatchScore: 89,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 92,
    mercerPercentile: 94,
    clearances: {
      nafath: {
        status: 'Verified',
        token: 'NF-94112-SA',
        date: '2026-10-23 11:30 AST'
      },
      amn: {
        status: 'Approved',
        issuer: 'SANS Security Directorate'
      },
      medical: {
        status: 'Valid',
        detail: 'GACA Class 1 Medical Fitness (Valid to Oct 2027)'
      },
      address: {
        status: 'Confirmed',
        detail: 'Jeddah, Al-Shati District',
        detailAr: 'جدة، حي الشاطئ'
      }
    },
    cvRawText: `CURRICULUM VITAE
Noura Al-Shehri | Jeddah, Saudi Arabia | noura.shehri.fake@example.com

EXECUTIVE SUMMARY
Disciplined Air Operations & Tactical Radar Specialist with 5 years experience in aerospace surveillance, flight vectoring, and tactical air coordination. High analytical aptitude with BSc in Aeronautical Engineering.

EXPERIENCE
Tactical Radar Controller | Aerospace Flight Operations | 2021 – Present
- Directed airspace surveillance, identified radar tracks, and executed precision flight coordination.
- Monitored sector transit and maintained seamless communication under intense operations.

EDUCATION & LICENSING
- Bachelor of Science in Aeronautical Engineering | Alfaisal University (2021)
- Tactical Air Operations & Radar Certification
- ICAO English Language Proficiency: Level 4 (Operational)`,
    citations: [
      {
        criterion: 'Tactical Radar & Vectoring Experience',
        criterionAr: 'خبرة المراقبة الرادارية وتوجيه الطائرات',
        confidence: 'Equivalent Skill (95%)',
        confidenceAr: 'مهارة مكافئة (95%)',
        quote: 'Directed airspace surveillance, identified radar tracks, and executed precision flight coordination over 5 years.',
        quoteAr: 'إدارة مراقبة المجال الجوي وتحديد مسارات الرادار وتوجيه الطيران بدقة على مدى 5 سنوات.'
      },
      {
        criterion: 'Aeronautical Engineering Degree',
        criterionAr: 'شهادة هندسة الطيران والملاحة',
        confidence: 'Direct Match',
        confidenceAr: 'مطابقة مباشرة',
        quote: 'Bachelor of Science in Aeronautical Engineering | Alfaisal University (2021).',
        quoteAr: 'بكالوريوس هندسة طيران من جامعة الفيصل عام 2021.'
      }
    ],
    interviewTranscript: {
      question: 'Question 1: How do you prioritize conflicting runway and approach clearances during peak traffic weather deviations?',
      questionAr: 'السؤال 1: كيف تحددين الأولويات عند وجود تعارض في تصاريح الاقتراب والمسارات أثناء سوء الأحوال الجوية؟',
      answer: 'Safety is non-negotiable. I establish immediate lateral and vertical separation buffers exceeding standard minimums, prioritize fuel-critical aircraft, and communicate concise holding patterns with standardized phraseology.',
      answerAr: 'السلامة الجوية لا مساومة فيها. أقوم فوراً بإنشاء مسافات فصل آمنة رأسية وأفقية تفوق الحدود الدنيا، وأعطي الأولوية للطائرات ذات الوقود الحرج مع تطبيق أنماط الانتظار المعيارية.',
      audioText: 'Safety is non-negotiable. I establish immediate lateral and vertical separation buffers exceeding standard minimums, prioritize fuel-critical aircraft, and communicate concise holding patterns with standardized phraseology.',
      audioTextAr: 'السلامة الجوية لا مساومة فيها. أقوم فوراً بإنشاء مسافات فصل آمنة رأسية وأفقية تفوق الحدود الدنيا، وأعطي الأولوية للطائرات ذات الوقود الحرج مع تطبيق أنماط الانتظار المعيارية.'
    }
  },
  {
    id: 'CAND-8493',
    name: 'Fahad Al-Harbi',
    nameAr: 'فهد الحربي',
    nationalId: '1091245892',
    nationality: 'Saudi',
    currentTitle: 'Aerodrome Control Tower Officer',
    currentTitleAr: 'ضابط برج مراقبة المطار',
    experienceYears: 3,
    education: 'Diploma in Air Traffic Services - SACA (2023)',
    educationAr: 'دبلوم خدمات الملاحة الجوية - الأكاديمية السعودية للطيران المدني (2023)',
    certifications: [
      'GACA Tower (TWR) Rating #TWR-4412',
      'ICAO English Language Proficiency Level 4'
    ],
    keyStrengths: 'Certified Tower Controller, SACA graduate, high aerodrome safety record.',
    keyStrengthsAr: 'مراقب برج معتمد، خريج الأكاديمية السعودية للطيران، سجل سلامة متميز في مدارج المطارات.',
    identifiedGaps: 'Lacks required 5 years En-Route Radar experience (only 3 years Tower experience).',
    identifiedGapsAr: 'ينقصه خبرة 5 سنوات رادار مسار (لديه فقط 3 سنوات برج مراقبة سطحي).',
    rawMatchScore: 71,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 78,
    mercerPercentile: 75,
    clearances: {
      nafath: {
        status: 'Verified',
        token: 'NF-89211-SA',
        date: '2026-10-24 14:10 AST'
      },
      amn: {
        status: 'In Progress',
        issuer: 'Security Review Ongoing'
      },
      medical: {
        status: 'Valid',
        detail: 'GACA Class 1 Medical'
      },
      address: {
        status: 'Confirmed',
        detail: 'Dammam, Al-Faisaliyah',
        detailAr: 'الدمام، حي الفيصلية'
      }
    },
    cvRawText: `CURRICULUM VITAE
Fahad Al-Harbi | Dammam, Saudi Arabia

SUMMARY
Certified Tower Air Traffic Controller with 3 years operational experience managing visual and ground departures at regional aerodrome.

EXPERIENCE
Tower Controller | Regional Airport Operations | 2023 – Present
- Managed surface movements and tower take-off/landing clearances.

EDUCATION & LICENSING
- Diploma in Air Traffic Control | Saudi Academy of Civil Aviation (SACA) (2023)
- GACA Tower Controller License #TWR-4412
- ICAO English Level 4`,
    citations: [
      {
        criterion: 'En-Route Upper Airspace Radar Experience',
        criterionAr: 'خبرة رادار قطاع المسار العلوي',
        confidence: 'Gap Identified',
        confidenceAr: 'تم رصد فجوة تأهيل',
        quote: 'Experience limited to surface and visual tower operations; no en-route radar track record documented.',
        quoteAr: 'الخبرة محصورة في عمليات البرج والمدرج فقط، ولا توجد خبرة سابقة في رادار قطاع المسار.'
      }
    ],
    interviewTranscript: {
      question: 'Question: How do you coordinate with the area radar center during departures?',
      questionAr: 'السؤال: كيف تنسق مع مركز مراقبة المنطقة أثناء مرحلة الإقلاع؟',
      answer: 'I ensure departure releases are agreed prior to rolling, vector aircraft on the standard instrument departure, and perform early electronic handoff.',
      answerAr: 'أتأكد من الحصول على إذن الإقلاع المسبق، وتوجيه الطائرة وفق مسار المغادرة المحدد، وإجراء التسليم الإلكتروني الفوري.',
      audioText: 'I ensure departure releases are agreed prior to rolling, vector aircraft on the standard instrument departure, and perform early electronic handoff.',
      audioTextAr: 'أتأكد من الحصول على إذن الإقلاع المسبق، وتوجيه الطائرة وفق مسار المغادرة المحدد، وإجراء التسليم الإلكتروني الفوري.'
    }
  },
  {
    id: 'CAND-8494',
    name: 'Tariq Al-Mansoor',
    nameAr: 'طارق المنصور',
    nationalId: '1067214589',
    nationality: 'Saudi',
    currentTitle: 'Civil Infrastructure Engineer',
    currentTitleAr: 'مهندس بنية تحتية مدنية',
    experienceYears: 4,
    education: 'BSc Civil Engineering - King Saud University (2022)',
    educationAr: 'بكالوريوس هندسة مدنية - جامعة الملك سعود (2022)',
    certifications: [
      'Saudi Council of Engineers (SCE)'
    ],
    keyStrengths: 'Civil project management, structural concrete, project scheduling.',
    keyStrengthsAr: 'إدارة مشاريع إنشائية، تصميم الخرسانة، جدولة المشاريع المدنية.',
    identifiedGaps: 'Zero aviation credentials, no GACA license, no radar experience (Automated Screen Out).',
    identifiedGapsAr: 'عدم وجود أي مؤهل ملاحي، عدم وجود رخصة طيران، غياب خبرة الرادار (استبعاد آلي).',
    rawMatchScore: 28,
    overrideScore: null,
    overrideReason: null,
    virtualInterviewScore: 35,
    mercerPercentile: 52,
    clearances: {
      nafath: {
        status: 'Verified',
        token: 'NF-81204-SA',
        date: '2026-10-25 16:45 AST'
      },
      amn: {
        status: 'Not Initiated',
        issuer: 'Pre-screened Out'
      },
      medical: {
        status: 'Unverified',
        detail: 'No Aviation Medical File'
      },
      address: {
        status: 'Confirmed',
        detail: 'Riyadh, Al-Nakheel',
        detailAr: 'الرياض، حي النخيل'
      }
    },
    cvRawText: `CURRICULUM VITAE
Tariq Al-Mansoor | Riyadh, Saudi Arabia

Civil Infrastructure Engineer with 4 years managing structural concrete and municipal highway construction projects.

EDUCATION: BSc Civil Engineering | King Saud University (2022)`,
    citations: [
      {
        criterion: 'Mandatory GACA Air Traffic Control License',
        criterionAr: 'رخصة ملاحة جوية إلزامية من هيئة الطيران المدني',
        confidence: 'Failed Mandatory Requirement',
        confidenceAr: 'غير مستوفٍ للشرط الإلزامي',
        quote: 'No aviation licensing or radar certification present in submitted documentation.',
        quoteAr: 'لا توجد رخصة ملاحة جوية أو خبرة رادارية في الوثائق المقدمة.'
      }
    ],
    interviewTranscript: {
      question: 'Question: What is your understanding of SANS airspace sectors?',
      questionAr: 'السؤال: ما هو فهمك لقطاعات المجال الجوي لشركة الملاحة الجوية؟',
      answer: 'I applied believing this was a facility infrastructure role for airport control towers.',
      answerAr: 'تقدمت للوظيفة ظناً مني أنها تتعلق بالبنية التحتية والمباني الخاصة بأبراج المراقبة.',
      audioText: 'I applied believing this was a facility infrastructure role for airport control towers.',
      audioTextAr: 'تقدمت للوظيفة ظناً مني أنها تتعلق بالبنية التحتية والمباني الخاصة بأبراج المراقبة.'
    }
  }
];
