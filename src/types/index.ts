// Type definitions for SANS AI Screening Platform

export type UserRole =
  | 'recruiter'
  | 'manager'
  | 'admin'
  | 'reviewer'
  | 'compliance'
  | 'candidate'
  | 'sysadmin';

export interface PersonaProfile {
  id: UserRole;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  initials: string;
  department: string;
  departmentAr: string;
}

export type Language = 'en' | 'ar';

export interface EvaluationWeights {
  experience: number;
  certifications: number;
  education: number;
  language: number;
}

export interface CandidateCitation {
  criterion: string;
  criterionAr: string;
  confidence: string;
  confidenceAr: string;
  quote: string;
  quoteAr: string;
}

export interface CandidateClearances {
  nafath: {
    status: 'Verified' | 'Pending' | 'Unverified';
    token: string;
    date: string;
  };
  amn: {
    status: 'Approved' | 'In Progress' | 'Not Initiated';
    issuer: string;
  };
  medical: {
    status: 'Valid' | 'Expired' | 'Unverified';
    detail: string;
  };
  address: {
    status: 'Confirmed' | 'Pending';
    detail: string;
    detailAr: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
  nameAr: string;
  nationalId: string;
  nationality: string;
  currentTitle: string;
  currentTitleAr: string;
  experienceYears: number;
  education: string;
  educationAr: string;
  certifications: string[];
  keyStrengths: string;
  keyStrengthsAr: string;
  identifiedGaps: string;
  identifiedGapsAr: string;
  rawMatchScore: number;
  overrideScore: number | null;
  overrideReason: string | null;
  computedScore?: number;
  virtualInterviewScore: number;
  mercerPercentile: number;
  clearances: CandidateClearances;
  cvRawText: string;
  citations: CandidateCitation[];
  interviewTranscript: {
    question: string;
    questionAr: string;
    answer: string;
    answerAr: string;
    audioText: string;
    audioTextAr: string;
  };
  cvScannedByRecruiter?: boolean;
  shortlistedByRecruiter?: boolean;
  interviewCompleted?: boolean;
  finalSelected?: boolean;
  hasAudioVoice?: boolean;
  interviewCanceled?: boolean;
  ruleViolated?: boolean;
  warningCount?: number;
  lastWarningReason?: string;
  lastWarningReasonAr?: string;
  lastWarningTimestamp?: string;
  cancellationReason?: string;
  cancellationReasonAr?: string;
  cancellationTimestamp?: string;
  proctoringSnapshots?: ProctoringSnapshot[];
  aiContentScore?: number;
  humanAuthenticityScore?: number;
}

export interface ProctoringSnapshot {
  id: string;
  timestamp: string; // e.g. '00:35'
  realTime: string;  // e.g. '05:04:12 PM AST'
  imageUrl: string;
  status: 'Verified' | 'Flagged';
  statusAr?: string;
  faceConfidence: number; // e.g. 99.4
  gazeDirection: string;  // e.g. 'Direct Screen Focus (98%)'
  gazeDirectionAr?: string;
  lighting: string;       // e.g. 'Optimal (96%)'
  singlePersonVerified: boolean;
  notes?: string;
  notesAr?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorAr: string;
  role: string;
  event: string;
  eventAr: string;
  subjectCandidate: string;
  ncaControlRef: string;
  status: 'Verified' | 'Signed' | 'Pending';
}

export interface JobRequisition {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  department: string;
  departmentAr: string;
  location: string;
  totalApplicants: number;
  screenedCount: number;
  shortlistCount: number;
  interviewCompletedCount: number;
  clearedCount: number;
  status: 'Open - Screening Active' | 'Interview Phase' | 'Offer Stage';
  description?: string;
  descriptionAr?: string;
  requirements?: string[];
  requirementsAr?: string[];
  experienceLevel?: string;
  salaryRange?: string;
  employmentType?: string;
  deadline?: string;
  isNew?: boolean;
  postedAt?: string;
}

export interface CandidateApplication {
  id: string;
  candidateId?: string;
  candidateName?: string;
  candidateNameAr?: string;
  requisitionId: string;
  requisitionCode: string;
  jobTitle: string;
  jobTitleAr: string;
  department: string;
  departmentAr: string;
  location: string;
  submittedAt: string;
  cvFileName?: string;
  status: 'Submitted' | 'AI Screening Passed' | 'Interview Scheduled' | 'Interview Completed' | 'Offer Stage' | 'Rejected' | 'Interview Canceled';
  stageIndex: number; // 1: Submitted, 2: AI Screening, 3: Virtual Interview, 4: Clearances & Offer
  screeningScore?: number;
  mandatoryCriteriaMet?: boolean;
  screeningSummary?: string;
  screeningSummaryAr?: string;
  cvScannedByRecruiter?: boolean;
  shortlistedByRecruiter?: boolean;
  interviewScore?: number;
  interviewFeedback?: string;
  interviewFeedbackAr?: string;
  interviewTranscript?: {
    question: string;
    questionAr?: string;
    answer: string;
    answerAr?: string;
  };
  hasAudioVoice?: boolean;
  finalSelected?: boolean;
  interviewCanceled?: boolean;
  ruleViolated?: boolean;
  warningCount?: number;
  lastWarningReason?: string;
  lastWarningReasonAr?: string;
  lastWarningTimestamp?: string;
  cancellationReason?: string;
  cancellationReasonAr?: string;
  cancellationTimestamp?: string;
  proctoringSnapshots?: ProctoringSnapshot[];
  aiContentScore?: number;
  humanAuthenticityScore?: number;
  nafathStatus: 'Verified' | 'Pending' | 'Unverified';
}

export interface InterviewQuestionItem {
  id: string;
  questionNumber: number;
  questionEn: string;
  questionAr: string;
  category: string;
  requisitionCode?: string;
  jobTitle?: string;
  aiGenerated?: boolean;
  generatedAt?: string;
  questionType?: 'Technical' | 'Situational' | 'Behavioral';
  competency?: string;
  roleFamily?: string;
  mandatory?: boolean;
  durationSeconds?: number;
  difficulty?: 'Standard' | 'Advanced' | 'Expert';
  suggestedAnswerEn: string;
  suggestedAnswerAr: string;
  keyRubricsEn: string[];
  keyRubricsAr: string[];
}


