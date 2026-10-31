import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, EvaluationWeights, JobRequisition, AuditLog, CandidateApplication, InterviewQuestionItem } from '../types';
import { INITIAL_CANDIDATES } from '../data/candidates';
import { REQUISITIONS } from '../data/requisitions';
import { INITIAL_AUDIT_LOGS } from '../data/auditLogs';
import { INITIAL_APPLICATIONS } from '../data/candidateApplications';
import { BULK_COHORT_CANDIDATES, BULK_COHORT_APPLICATIONS } from '../data/bulkCohortCandidates';
import { INTERVIEW_QUESTIONS } from '../data/interviewQuestions';
import { generateAiQuestionsForJob } from '../data/jobQuestionTemplates';

interface CandidateContextType {
  candidates: Candidate[];
  activeRequisition: JobRequisition;
  allRequisitions: JobRequisition[];
  setActiveRequisition: (reqId: string) => void;
  weights: EvaluationWeights;
  setWeights: React.Dispatch<React.SetStateAction<EvaluationWeights>>;
  updateWeight: (key: keyof EvaluationWeights, value: number) => void;
  overrideCandidateScore: (candidateId: string, newScore: number, reason: string, actorName: string) => void;
  syncToOracleModalOpen: boolean;
  setSyncToOracleModalOpen: (open: boolean) => void;
  lastSyncPayload: any | null;
  executeOracleSync: () => void;
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  batchUploadSimulated: boolean;
  triggerBatchUpload: () => void;
  bulkUploadCvs: (customFiles?: { name: string; size?: number }[]) => { count: number; newApps: CandidateApplication[] };
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  applications: CandidateApplication[];
  submitApplication: (reqId: string, customDetails?: Partial<CandidateApplication>) => CandidateApplication;
  updateApplicationStage: (appId: string, stageIndex: number, status: CandidateApplication['status'], score?: number, feedback?: string) => void;
  scanCandidateCvByRecruiter: (appId: string) => void;
  bulkScanCandidateCvs: (targetAppIds?: string[]) => { scannedCount: number; averageScore: number };
  bulkApproveShortlists: (targetAppIds?: string[]) => { approvedCount: number };
  approveShortlistForInterview: (appId: string) => void;
  recordCandidateInterviewResponse: (appId: string, transcriptData: { question: string; answer: string; score: number; feedbackEn?: string; feedbackAr?: string; hasAudioVoice?: boolean }) => void;
  cancelInterviewDueToRuleViolation: (appId: string, violationDetails?: { en?: string; ar?: string }) => void;
  approveFinalSelection: (appId: string) => void;
  bulkApproveFinalSelection: (appIds: string[]) => void;
  activeInterviewApp: CandidateApplication | null;
  setActiveInterviewApp: (app: CandidateApplication | null) => void;
  interviewQuestions: InterviewQuestionItem[];
  addInterviewQuestion: (q: Omit<InterviewQuestionItem, 'id' | 'questionNumber'>) => void;
  updateInterviewQuestion: (id: string, updated: Partial<InterviewQuestionItem>) => void;
  deleteInterviewQuestion: (id: string) => void;
  generateQuestionsForJob: (jobIdOrCode: string) => InterviewQuestionItem[];
  addJobRequisition: (jobData: Omit<JobRequisition, 'id' | 'totalApplicants' | 'screenedCount' | 'shortlistCount' | 'interviewCompletedCount' | 'clearedCount'> & Partial<JobRequisition>) => JobRequisition;
  deleteJobRequisition: (jobIdOrCode: string) => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('sans_candidates_state');
    const parsed: Candidate[] = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    return parsed.map(c => ({
      ...c,
      finalSelected: false,
      shortlistedByRecruiter: false
    }));
  });

  const [allRequisitions, setAllRequisitions] = useState<JobRequisition[]>(() => {
    const saved = localStorage.getItem('sans_requisitions');
    return saved ? JSON.parse(saved) : REQUISITIONS;
  });

  const [activeRequisition, setActiveRequisitionState] = useState<JobRequisition>(() => {
    const savedReqs = localStorage.getItem('sans_requisitions');
    const reqs = savedReqs ? JSON.parse(savedReqs) : REQUISITIONS;
    return reqs[0] || REQUISITIONS[0];
  });

  const [weights, setWeights] = useState<EvaluationWeights>(() => {
    const saved = localStorage.getItem('sans_weights');
    return saved ? JSON.parse(saved) : { experience: 40, certifications: 30, education: 20, language: 10 };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sans_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [syncToOracleModalOpen, setSyncToOracleModalOpen] = useState(false);
  const [lastSyncPayload, setLastSyncPayload] = useState<any | null>(null);
  const [batchUploadSimulated, setBatchUploadSimulated] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(INITIAL_CANDIDATES[0]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sans_candidates_state', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('sans_weights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem('sans_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('sans_requisitions', JSON.stringify(allRequisitions));
  }, [allRequisitions]);

  // Recalculate dynamic scores based on weights
  const updateWeight = (key: keyof EvaluationWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);

    // Compute dynamic scores
    setCandidates(prev =>
      prev.map(c => {
        let dynamicScore = c.rawMatchScore;
        // Adjust score dynamically based on weight delta from baseline
        if (newWeights.experience > 40 && c.experienceYears >= 5) {
          dynamicScore = Math.min(100, dynamicScore + 2);
        }
        if (newWeights.certifications > 30 && c.certifications.length >= 3) {
          dynamicScore = Math.min(100, dynamicScore + 2);
        }
        if (newWeights.education > 20 && c.education.includes('Aviation')) {
          dynamicScore = Math.min(100, dynamicScore + 1);
        }
        return {
          ...c,
          computedScore: dynamicScore
        };
      })
    );
  };

  const overrideCandidateScore = (candidateId: string, newScore: number, reason: string, actorName: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const oldScore = candidate.overrideScore !== null ? candidate.overrideScore : (candidate.computedScore || candidate.rawMatchScore);

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            overrideScore: newScore,
            overrideReason: reason
          };
        }
        return c;
      })
    );

    // Append to audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' AST',
      actor: actorName,
      actorAr: actorName,
      role: 'Recruiter Override',
      event: `Score Override (${oldScore}% -> ${newScore}%) [Reason: ${reason}]`,
      eventAr: `تعديل الدرجة يدوياً (${oldScore}% -> ${newScore}%) [المبرر: ${reason}]`,
      subjectCandidate: candidate.name,
      ncaControlRef: 'NCA-ECC-2-3-4 (Human Oversight)',
      status: 'Signed'
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' AST'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const setActiveRequisition = (reqId: string) => {
    const req = allRequisitions.find(r => r.id === reqId || r.code === reqId);
    if (req) {
      setActiveRequisitionState(req);
    }
  };

  const executeOracleSync = () => {
    const payload = {
      transactionId: `TX-SANS-ORACLE-${Date.now().toString().slice(-6)}`,
      requisitionId: activeRequisition.code,
      syncTimestamp: new Date().toISOString(),
      authorizedActor: 'Sarah Al-Harbi (Recruiter)',
      candidateCount: candidates.filter(c => (c.overrideScore ?? c.rawMatchScore) >= 70).length,
      candidates: candidates.filter(c => (c.overrideScore ?? c.rawMatchScore) >= 70).map(c => ({
        candidateId: c.id,
        fullName: c.name,
        nationalId: c.nationalId,
        finalScore: c.overrideScore ?? c.rawMatchScore,
        aiInterviewScore: c.virtualInterviewScore,
        mercerPercentile: c.mercerPercentile,
        clearances: {
          nafath: c.clearances.nafath.status,
          amn: c.clearances.amn.status,
          medical: c.clearances.medical.status,
          address: c.clearances.address.status
        },
        dossierSecureUrl: `https://sans-cloud.internal/dossiers/${c.id}.pdf`
      }))
    };

    setLastSyncPayload(payload);
    setSyncToOracleModalOpen(true);

    addAuditLog({
      actor: 'Oracle Fusion HCM Gateway',
      actorAr: 'بوابة أوراكل للموارد البشرية',
      role: 'Integration Service',
      event: `Shortlist Synced to Oracle Core HCM (${payload.candidateCount} candidates)`,
      eventAr: `مزامنة واعتماد المرشحين المؤهلين في نظام أوراكل (${payload.candidateCount} مرشح)`,
      subjectCandidate: activeRequisition.code,
      ncaControlRef: 'NCA-CSCC-3-1 (Data Interoperability)',
      status: 'Verified'
    });
  };

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>(() => {
    const saved = localStorage.getItem('sans_interview_questions');
    return saved ? JSON.parse(saved) : INTERVIEW_QUESTIONS;
  });

  useEffect(() => {
    localStorage.setItem('sans_interview_questions', JSON.stringify(interviewQuestions));
  }, [interviewQuestions]);

  const addInterviewQuestion = (q: Omit<InterviewQuestionItem, 'id' | 'questionNumber'>) => {
    const newQ: InterviewQuestionItem = {
      ...q,
      id: `q-${Date.now().toString().slice(-4)}`,
      questionNumber: interviewQuestions.length + 1
    };
    setInterviewQuestions(prev => [...prev, newQ]);

    addAuditLog({
      actor: 'Dr. Faisal Al-Harthi',
      actorAr: 'د. فيصل الحارثي',
      role: 'Assessment Specialist',
      event: `New Interview Question Configured: "${q.category}" (Section 4.2.1)`,
      eventAr: `إضافة سؤال مقابلة ذكية جديد في بنك التقييم: "${q.category}"`,
      subjectCandidate: 'Question Bank',
      ncaControlRef: 'SANS-HR-EVAL-04',
      status: 'Signed'
    });
  };

  const updateInterviewQuestion = (id: string, updated: Partial<InterviewQuestionItem>) => {
    setInterviewQuestions(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteInterviewQuestion = (id: string) => {
    setInterviewQuestions(prev => prev.filter(item => item.id !== id));
  };

  const generateQuestionsForJob = (jobIdOrCode: string): InterviewQuestionItem[] => {
    const job = allRequisitions.find(r => r.id === jobIdOrCode || r.code === jobIdOrCode) || allRequisitions[0];
    const generated = generateAiQuestionsForJob(job);

    setInterviewQuestions(prev => {
      const others = prev.filter(q => q.requisitionCode !== job.code && q.requisitionCode !== job.id);
      return [...others, ...generated];
    });

    addAuditLog({
      actor: 'Dr. Faisal Al-Harthi & SANS AI Synthesis Engine',
      actorAr: 'د. فيصل الحارثي ومحرك التوليد الآلي للأسئلة',
      role: 'Assessment Specialist',
      event: `AI Generated ${generated.length} Interview Scenarios for Requisition ${job.code} (Section 4.2.1)`,
      eventAr: `توليد ${generated.length} أسئلة مقابلة ذكية بالذكاء الاصطناعي للوظيفة ${job.code} (بند 4.2.1)`,
      subjectCandidate: job.code,
      ncaControlRef: 'SANS-HR-AI-GEN-02',
      status: 'Verified'
    });

    return generated;
  };

  const bulkUploadCvs = (customFiles?: { name: string; size?: number }[]): { count: number; newApps: CandidateApplication[] } => {
    setBatchUploadSimulated(true);

    let candidatesToAdd = BULK_COHORT_CANDIDATES;
    let appsToAdd = BULK_COHORT_APPLICATIONS;

    if (customFiles && customFiles.length > 0) {
      appsToAdd = BULK_COHORT_APPLICATIONS.map((app, idx) => {
        const file = customFiles[idx % customFiles.length];
        return {
          ...app,
          requisitionId: activeRequisition.id,
          requisitionCode: activeRequisition.code,
          jobTitle: activeRequisition.title,
          jobTitleAr: activeRequisition.titleAr,
          cvFileName: file.name
        };
      });
    } else {
      appsToAdd = BULK_COHORT_APPLICATIONS.map(app => ({
        ...app,
        requisitionId: activeRequisition.id,
        requisitionCode: activeRequisition.code,
        jobTitle: activeRequisition.title,
        jobTitleAr: activeRequisition.titleAr
      }));
    }

    setApplications(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const freshApps = appsToAdd.filter(a => !existingIds.has(a.id));
      const updated = [...freshApps, ...prev];
      localStorage.setItem('sans_candidate_applications', JSON.stringify(updated));
      return updated;
    });

    setCandidates(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const freshCands = candidatesToAdd.filter(c => !existingIds.has(c.id));
      const updated = [...prev, ...freshCands];
      localStorage.setItem('sans_candidates_state', JSON.stringify(updated));
      return updated;
    });

    setAllRequisitions(prev =>
      prev.map(r => (r.id === activeRequisition.id || r.code === activeRequisition.code)
        ? { ...r, totalApplicants: (r.totalApplicants || 0) + appsToAdd.length }
        : r
      )
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi & SANS Ingestion Gateway',
      actorAr: 'سارة الحربي وبوابة استيعاب الملاحة',
      role: 'Recruitment & Ingestion Lead',
      event: `Batch CV Ingestion: ${appsToAdd.length} Resumes Processed, Anti-Malware Verified & OCR Parsed (Section 4.1.1)`,
      eventAr: `استيعاب جماعي لـ ${appsToAdd.length} سير ذاتية مع فحص الفيروسات والمسح الضوئي (بند 4.1.1)`,
      subjectCandidate: `Cohort Ingestion (${appsToAdd.length} candidates)`,
      ncaControlRef: 'NCA-ECC-1-2-1 (Malware & Integrity)',
      status: 'Verified'
    });

    return { count: appsToAdd.length, newApps: appsToAdd };
  };

  const triggerBatchUpload = () => {
    bulkUploadCvs();
  };

  const [applications, setApplications] = useState<CandidateApplication[]>(() => {
    const saved = localStorage.getItem('sans_candidate_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [activeInterviewApp, setActiveInterviewApp] = useState<CandidateApplication | null>(() => {
    return applications[0] || null;
  });

  useEffect(() => {
    localStorage.setItem('sans_candidate_applications', JSON.stringify(applications));
  }, [applications]);

  const submitApplication = (reqId: string, customDetails?: Partial<CandidateApplication>): CandidateApplication => {
    const req = allRequisitions.find(r => r.id === reqId || r.code === reqId) || allRequisitions[0];
    const newId = `APP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} AST`;

    const candidateId = customDetails?.candidateId || 'cand-001';
    const candidateName = customDetails?.candidateName || 'Mohammad Al-Zahrani';
    const candidateNameAr = customDetails?.candidateNameAr || 'محمد الزهراني';

    const newApp: CandidateApplication = {
      id: newId,
      candidateId,
      candidateName,
      candidateNameAr,
      requisitionId: req.id,
      requisitionCode: req.code,
      jobTitle: req.title,
      jobTitleAr: req.titleAr,
      department: req.department,
      departmentAr: req.departmentAr,
      location: req.location,
      submittedAt: formattedDate,
      cvFileName: `${candidateName.replace(/\s+/g, '_')}_CV.pdf`,
      status: 'Submitted',
      stageIndex: 1,
      cvScannedByRecruiter: false,
      shortlistedByRecruiter: false,
      screeningSummary: `CV uploaded by candidate. Awaiting Recruiter AI scanning & shortlist approval.`,
      screeningSummaryAr: `تم رفع السيرة الذاتية بنجاح. في انتظار إجراء الفرز الآلي واعتماد القائمة من مسؤولة التوظيف.`,
      nafathStatus: 'Verified',
      ...customDetails
    };

    // CRITICAL: Preserve all other candidates' applications for this job requisition!
    // Only replace if this exact candidate already had an application for this requisition.
    setApplications(prev => {
      const filtered = prev.filter(a =>
        !(
          (a.requisitionId === req.id || a.requisitionCode === req.code) &&
          (a.candidateId === newApp.candidateId || a.candidateName?.toLowerCase() === newApp.candidateName?.toLowerCase())
        )
      );
      return [newApp, ...filtered];
    });
    setActiveInterviewApp(newApp);

    // Increment applicant count for that job requisition
    setAllRequisitions(prev =>
      prev.map(r => (r.id === req.id || r.code === req.code ? { ...r, totalApplicants: (r.totalApplicants || 0) + 1 } : r))
    );

    addAuditLog({
      actor: candidateName,
      actorAr: candidateNameAr,
      role: 'Applicant',
      event: `Application & CV Submitted (${req.code} - ${req.title}) for ${candidateName}`,
      eventAr: `تقديم السيرة الذاتية والطلب (${req.code}) للمرشح ${candidateNameAr}`,
      subjectCandidate: candidateName,
      ncaControlRef: 'PDPL-Art-12 (Consent & Ingestion)',
      status: 'Verified'
    });

    return newApp;
  };

  const updateApplicationStage = (
    appId: string,
    stageIndex: number,
    status: CandidateApplication['status'],
    score?: number,
    feedback?: string
  ) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const updated = {
            ...app,
            stageIndex,
            status,
            ...(score !== undefined ? { interviewScore: score } : {}),
            ...(feedback ? { interviewFeedback: feedback } : {})
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );
  };

  const scanCandidateCvByRecruiter = (appId: string) => {
    const score = Math.floor(93 + Math.random() * 5); // 93 - 97
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const updated = {
            ...app,
            cvScannedByRecruiter: true,
            status: 'AI Screening Passed' as CandidateApplication['status'],
            stageIndex: 2,
            screeningScore: score,
            mandatoryCriteriaMet: true,
            screeningSummary: `GACA credentials, 8+ years radar experience, and ICAO Level 5 validated by SANS AI.`,
            screeningSummaryAr: `تم فحص السيرة واستيفاء معايير الطيران المدني بنسبة ${score}%. جاهز لاعتماد القائمة.`
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === 'cand-001' || c.name.includes('Al-Zahrani')) {
          return {
            ...c,
            cvScannedByRecruiter: true,
            rawMatchScore: score,
            computedScore: score
          };
        }
        return c;
      })
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi',
      actorAr: 'سارة الحربي',
      role: 'Senior Recruiter',
      event: `AI CV Screening Executed for Candidate (Score: ${score}%)`,
      eventAr: `إجراء الفرز الآلي للسيرة الذاتية عبر الذكاء الاصطناعي (النتيجة: ${score}%)`,
      subjectCandidate: 'Mohammad Al-Zahrani',
      ncaControlRef: 'NCA-ECC-2-3-4 (Algorithmic Processing)',
      status: 'Verified'
    });
  };

  const bulkScanCandidateCvs = (targetAppIds?: string[]): { scannedCount: number; averageScore: number } => {
    let count = 0;
    let totalScore = 0;

    setApplications(prev =>
      prev.map(app => {
        const shouldScan = targetAppIds && targetAppIds.length > 0 ? targetAppIds.includes(app.id) : !app.cvScannedByRecruiter;
        if (shouldScan && !app.cvScannedByRecruiter) {
          count++;
          const score = app.screeningScore || Math.floor(91 + Math.random() * 6); // 91-96
          totalScore += score;
          const updated = {
            ...app,
            cvScannedByRecruiter: true,
            status: 'AI Screening Passed' as CandidateApplication['status'],
            stageIndex: 2,
            screeningScore: score,
            mandatoryCriteriaMet: true,
            screeningSummary: app.screeningSummary || `GACA credentials, aviation background, and ICAO English proficiency validated by SANS AI.`,
            screeningSummaryAr: app.screeningSummaryAr || `تم فحص السيرة واستيفاء معايير الطيران المدني بنسبة ${score}%. جاهز لاعتماد القائمة.`
          };
          if (activeInterviewApp && activeInterviewApp.id === app.id) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    setCandidates(prev =>
      prev.map(c => {
        return {
          ...c,
          cvScannedByRecruiter: true
        };
      })
    );

    const avgScore = count > 0 ? Math.round(totalScore / count) : 94;

    addAuditLog({
      actor: 'Sarah Al-Harbi & SANS AI Batch Screener',
      actorAr: 'سارة الحربي ومحرك الفرز الآلي للملاحة',
      role: 'Senior Recruiter',
      event: `Bulk AI CV Screening Executed: ${count} Resumes Processed (Avg Match: ${avgScore}%) [Section 4.1.3]`,
      eventAr: `فرز جماعي بالذكاء الاصطناعي لـ ${count} سير ذاتية بمعدل مطابقة ${avgScore}% (بند 4.1.3)`,
      subjectCandidate: `Cohort AI Screening (${count} Resumes)`,
      ncaControlRef: 'NCA-ECC-2-3-4 (Algorithmic Processing)',
      status: 'Verified'
    });

    return { scannedCount: count, averageScore: avgScore };
  };

  const bulkApproveShortlists = (targetAppIds?: string[]): { approvedCount: number } => {
    let count = 0;
    setApplications(prev =>
      prev.map(app => {
        const shouldApprove = targetAppIds && targetAppIds.length > 0 ? targetAppIds.includes(app.id) : app.cvScannedByRecruiter && !app.shortlistedByRecruiter;
        if (shouldApprove && !app.shortlistedByRecruiter) {
          count++;
          const updated = {
            ...app,
            shortlistedByRecruiter: true,
            status: 'Interview Scheduled' as CandidateApplication['status'],
            stageIndex: 3
          };
          if (activeInterviewApp && activeInterviewApp.id === app.id) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi',
      actorAr: 'سارة الحربي',
      role: 'Senior Recruiter',
      event: `Batch Shortlist Approved: ${count} Candidates Qualified & Virtual Interviews Unlocked`,
      eventAr: `اعتماد جماعي للقائمة القصيرة: تأهيل ${count} مرشحين وفتح المقابلات الافتراضية`,
      subjectCandidate: `Cohort Shortlist (${count} Candidates)`,
      ncaControlRef: 'SANS-HR-GOV-02',
      status: 'Signed'
    });

    return { approvedCount: count };
  };

  const approveShortlistForInterview = (appId: string) => {
    let targetApp: CandidateApplication | undefined = applications.find(a => a.id === appId);
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          targetApp = app;
          const updated = {
            ...app,
            shortlistedByRecruiter: true,
            status: 'Interview Scheduled' as CandidateApplication['status'],
            stageIndex: 3
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi',
      actorAr: 'سارة الحربي',
      role: 'Senior Recruiter',
      event: `Shortlist Approved & Virtual AI Interview Unlocked for ${targetApp?.candidateName || 'Candidate'}`,
      eventAr: `اعتماد القائمة القصيرة وفتح المقابلة الذكية التفاعلية للمرشح ${targetApp?.candidateNameAr || 'المرشح'}`,
      subjectCandidate: targetApp?.candidateName || 'Mohammad Al-Zahrani',
      ncaControlRef: 'SANS-HR-GOV-01',
      status: 'Signed'
    });
  };

  const recordCandidateInterviewResponse = (
    appId: string,
    transcriptData: {
      question: string;
      answer: string;
      score: number;
      feedbackEn?: string;
      feedbackAr?: string;
      hasAudioVoice?: boolean;
    }
  ) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const updated = {
            ...app,
            interviewScore: transcriptData.score,
            interviewFeedback: transcriptData.feedbackEn || 'Demonstrated high operational phraseology compliance.',
            interviewFeedbackAr: transcriptData.feedbackAr || 'أظهر التزاماً متميزاً بالمصطلحات القياسية المعتمدة.',
            interviewTranscript: {
              question: transcriptData.question,
              answer: transcriptData.answer
            },
            hasAudioVoice: transcriptData.hasAudioVoice ?? true,
            status: 'Interview Completed' as CandidateApplication['status'],
            stageIndex: 3
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === 'cand-001' || c.name.includes('Al-Zahrani')) {
          return {
            ...c,
            virtualInterviewScore: transcriptData.score,
            interviewCompleted: true,
            hasAudioVoice: transcriptData.hasAudioVoice ?? true,
            interviewTranscript: {
              ...c.interviewTranscript,
              question: transcriptData.question,
              answer: transcriptData.answer,
              audioText: transcriptData.answer
            }
          };
        }
        return c;
      })
    );

    addAuditLog({
      actor: 'Mohammad Al-Zahrani',
      actorAr: 'محمد الزهراني',
      role: 'Candidate',
      event: `Virtual AI Interview Completed (Score: ${transcriptData.score}/100, Audio Response Recorded)`,
      eventAr: `إتمام المقابلة الذكية التفاعلية (الدرجة: ${transcriptData.score}/100 وتسجيل الصوت)`,
      subjectCandidate: 'Mohammad Al-Zahrani',
      ncaControlRef: 'PDPL-Art-18 (Biometric / Voice Processing)',
      status: 'Verified'
    });
  };

  const cancelInterviewDueToRuleViolation = (
    appId: string,
    violationDetails?: { en?: string; ar?: string }
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' AST';
    const reasonEn = violationDetails?.en || 'Rule Violated: Candidate navigated away from interview screen (switched browser tabs, minimized browser, or opened/focused an external application).';
    const reasonAr = violationDetails?.ar || 'مخالفة الشروط: قام المرشح بمغادرة شاشة المقابلة (التبديل بين علامات التبويب، تصغير المتصفح، أو فتح تطبيق خارجي أثناء المقابلة).';

    let violatedCandidateName = 'Mohammad Al-Zahrani';
    let violatedCandidateNameAr = 'محمد الزهراني';

    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          if (app.candidateName) violatedCandidateName = app.candidateName;
          if (app.candidateNameAr) violatedCandidateNameAr = app.candidateNameAr;
          const updated: CandidateApplication = {
            ...app,
            status: 'Interview Canceled',
            interviewCanceled: true,
            ruleViolated: true,
            cancellationReason: reasonEn,
            cancellationReasonAr: reasonAr,
            cancellationTimestamp: timestamp,
            interviewScore: undefined,
            finalSelected: false
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === 'cand-001' || (violatedCandidateName && c.name?.toLowerCase().includes(violatedCandidateName.toLowerCase()))) {
          return {
            ...c,
            interviewCanceled: true,
            ruleViolated: true,
            cancellationReason: reasonEn,
            cancellationReasonAr: reasonAr,
            interviewCompleted: false
          };
        }
        return c;
      })
    );

    addAuditLog({
      actor: 'SANS Proctoring Engine',
      actorAr: 'نظام مراقبة ونزاهة الاختبارات SANS',
      role: 'Compliance AI',
      event: `Interview Terminated & Canceled — Integrity Rule Violated: Window/Tab switch detected (${appId})`,
      eventAr: `إنهاء وإلغاء المقابلة فورياً — مخالفة قواعد النزاهة: رصد مغادرة النافذة أو تبديل التطبيقات (${appId})`,
      subjectCandidate: violatedCandidateName,
      ncaControlRef: 'NCA-ECC-2-1-3 (Session Proctoring & Integrity)',
      status: 'Signed'
    });
  };

  const approveFinalSelection = (appId: string) => {
    let targetApp: CandidateApplication | undefined = applications.find(a => a.id === appId);
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          targetApp = app;
          const updated = {
            ...app,
            finalSelected: true,
            status: 'Offer Stage' as CandidateApplication['status'],
            stageIndex: 4
          };
          if (activeInterviewApp && activeInterviewApp.id === appId) {
            setActiveInterviewApp(updated);
          }
          return updated;
        }
        return app;
      })
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi',
      actorAr: 'سارة الحربي',
      role: 'Senior Recruiter',
      event: `Final Candidate Selection Approved & Pushed to Offer Stage (Oracle HCM) for ${targetApp?.candidateName || 'Candidate'}`,
      eventAr: `اعتماد الاختيار النهائي للمرشح وإصدار عرض العمل عبر أوراكل فيوجن للمرشح ${targetApp?.candidateNameAr || 'المرشح'}`,
      subjectCandidate: targetApp?.candidateName || 'Mohammad Al-Zahrani',
      ncaControlRef: 'SANS-HR-OFFER-2026',
      status: 'Signed'
    });
  };

  const bulkApproveFinalSelection = (appIds: string[]) => {
    setApplications(prev =>
      prev.map(app => {
        if (appIds.includes(app.id)) {
          return {
            ...app,
            finalSelected: true,
            status: 'Offer Stage' as CandidateApplication['status'],
            stageIndex: 4
          };
        }
        return app;
      })
    );

    addAuditLog({
      actor: 'Sarah Al-Harbi',
      actorAr: 'سارة الحربي',
      role: 'Senior Recruiter',
      event: `Batch Final Candidate Selection Approved & Pushed to Offer Stage (Oracle HCM) for ${appIds.length} Candidates`,
      eventAr: `اعتماد جماعي للاختيار النهائي وإصدار عروض العمل عبر أوراكل فيوجن لـ ${appIds.length} مرشحين`,
      subjectCandidate: `Cohort Final Selection (${appIds.length} Candidates)`,
      ncaControlRef: 'SANS-HR-OFFER-BATCH',
      status: 'Signed'
    });
  };

  const addJobRequisition = (
    jobData: Omit<JobRequisition, 'id' | 'totalApplicants' | 'screenedCount' | 'shortlistCount' | 'interviewCompletedCount' | 'clearedCount'> & Partial<JobRequisition>
  ): JobRequisition => {
    const code = jobData.code || `REQ-2026-${Math.floor(200 + Math.random() * 800)}`;
    const id = jobData.id || `req-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const formattedPosted = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const newRequisition: JobRequisition = {
      id,
      code,
      title: jobData.title,
      titleAr: jobData.titleAr || jobData.title,
      department: jobData.department || 'Air Traffic Management Directorate',
      departmentAr: jobData.departmentAr || 'الإدارة العامة للملاحة الجوية',
      location: jobData.location || 'Riyadh, Saudi Arabia',
      totalApplicants: 0,
      screenedCount: 0,
      shortlistCount: 0,
      interviewCompletedCount: 0,
      clearedCount: 0,
      status: jobData.status || 'Open - Screening Active',
      description: jobData.description || 'SANS Air Navigation Services operational requisition.',
      descriptionAr: jobData.descriptionAr || 'إعلان شاغر وظيفي لشركة خدمات الملاحة الجوية السعودية (SANS).',
      requirements: jobData.requirements || ['GACA Certification or equivalent', 'Relevant aviation experience'],
      requirementsAr: jobData.requirementsAr || ['شهادة معتمدة من الهيئة العامة للطيران المدني', 'خبرة عملية ملاحية ملائمة'],
      experienceLevel: jobData.experienceLevel || 'Mid-Senior Level (3+ Years)',
      salaryRange: jobData.salaryRange || '25,000 - 32,000 SAR / Month',
      employmentType: jobData.employmentType || 'Full-time / Shift Rotation',
      deadline: jobData.deadline || '31 Dec 2026',
      isNew: true,
      postedAt: formattedPosted
    };

    setAllRequisitions(prev => [newRequisition, ...prev]);
    setActiveRequisitionState(newRequisition);

    // Auto-synthesize AI interview scenarios for this new requisition
    try {
      const generatedQ = generateAiQuestionsForJob(newRequisition);
      setInterviewQuestions(prev => [...generatedQ, ...prev]);
    } catch (e) {
      console.warn('AI question generation error', e);
    }

    addAuditLog({
      actor: 'Sara Al-Ghamdi (HR Administrator)',
      actorAr: 'سارة الغامدي (مسؤولة إدارة الموارد البشرية)',
      role: 'HR Policy & Workforce Admin',
      event: `New Job Requisition Published: ${newRequisition.code} - ${newRequisition.title} [Published to Candidate Career Portal & Oracle Fusion HCM Cloud]`,
      eventAr: `نشر وظيفة ملاحية جديدة: ${newRequisition.code} - ${newRequisition.titleAr} [أصبحت معلنة في بوابة المرشحين ومزامنة مع أوراكل]`,
      subjectCandidate: newRequisition.code,
      ncaControlRef: 'SANS-HR-JOB-PUB-2026',
      status: 'Signed'
    });

    return newRequisition;
  };

  const deleteJobRequisition = (jobIdOrCode: string) => {
    setAllRequisitions(prev => prev.filter(r => r.id !== jobIdOrCode && r.code !== jobIdOrCode));
    addAuditLog({
      actor: 'Sara Al-Ghamdi (HR Administrator)',
      actorAr: 'سارة الغامدي (مسؤولة إدارة الموارد البشرية)',
      role: 'HR Policy & Workforce Admin',
      event: `Job Requisition Archived/Removed: ${jobIdOrCode}`,
      eventAr: `أرشفة / إزالة الوظيفة الشاغرة: ${jobIdOrCode}`,
      subjectCandidate: jobIdOrCode,
      ncaControlRef: 'SANS-HR-JOB-ARCH-2026',
      status: 'Verified'
    });
  };

  return (
    <CandidateContext.Provider value={{
      candidates,
      activeRequisition,
      allRequisitions,
      addJobRequisition,
      deleteJobRequisition,
      setActiveRequisition,
      weights,
      setWeights,
      updateWeight,
      overrideCandidateScore,
      syncToOracleModalOpen,
      setSyncToOracleModalOpen,
      lastSyncPayload,
      executeOracleSync,
      auditLogs,
      addAuditLog,
      batchUploadSimulated,
      triggerBatchUpload,
      selectedCandidate,
      setSelectedCandidate,
      applications,
      submitApplication,
      updateApplicationStage,
      scanCandidateCvByRecruiter,
      bulkScanCandidateCvs,
      bulkApproveShortlists,
      approveShortlistForInterview,
      recordCandidateInterviewResponse,
      cancelInterviewDueToRuleViolation,
      approveFinalSelection,
      bulkApproveFinalSelection,
      activeInterviewApp,
      setActiveInterviewApp,
      bulkUploadCvs,
      interviewQuestions,
      addInterviewQuestion,
      updateInterviewQuestion,
      deleteInterviewQuestion,
      generateQuestionsForJob
    }}>
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidate = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
};
