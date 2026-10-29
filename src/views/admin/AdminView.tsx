import React, { useState } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { PostJobModal } from '../../components/admin/PostJobModal';
import {
  Sliders,
  BookOpen,
  BellRing,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Save,
  LayoutDashboard,
  Briefcase,
  Sparkles,
  MapPin,
  Search,
  Trash2,
  ExternalLink,
  Eye,
  Users,
  Calendar,
  ArrowRight,
  Zap
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    weights,
    updateWeight,
    allRequisitions,
    deleteJobRequisition,
    setActiveRequisition,
    applications
  } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab, setActiveNavTab, setRole } = useAuthRbac();

  // Job Postings management states
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all');

  // SLA config states
  const [screeningHours, setScreeningHours] = useState(24);
  const [interviewHours, setInterviewHours] = useState(48);
  const [clearanceHours, setClearanceHours] = useState(72);
  const [autoEscalateLevel2, setAutoEscalateLevel2] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New competency prompt state
  const [newPromptText, setNewPromptText] = useState('');
  const [promptsList, setPromptsList] = useState([
    {
      title: 'Airspace Safety & Emergency De-confliction',
      desc: '3 Situational scenario prompts for rapid depressurization, weather diversions, and military corridors.'
    },
    {
      title: 'Air Traffic Phraseology & ICAO Annex 11 Compliance',
      desc: 'Evaluation of speech clarity, standardized phraseology, and communication discipline under high traffic loads.'
    },
    {
      title: 'Hajj Air Traffic Surge & Sequencing Control',
      desc: 'High-density terminal approach sequencing and arrival slot de-confliction at Western Region airports.'
    }
  ]);

  const handleSaveSla = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddPrompt = () => {
    if (!newPromptText.trim()) return;
    setPromptsList(prev => [
      ...prev,
      {
        title: newPromptText,
        desc: 'Custom interview rubric scenario configured by SANS HR Administrator.'
      }
    ]);
    setNewPromptText('');
  };

  const filteredRequisitions = allRequisitions.filter(job => {
    const q = jobSearch.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.titleAr.includes(q) ||
      job.code.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);

    const matchesDept =
      selectedDepartmentFilter === 'all' ||
      job.department.toLowerCase().includes(selectedDepartmentFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  const handleViewRequisitionPipeline = (job: typeof allRequisitions[0]) => {
    setActiveRequisition(job.id);
    setActiveNavTab('jobs_ai_rankings');
  };

  const handleDeleteJob = (jobId: string, code: string) => {
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من أرشفة الوظيفة ${code}؟` : `Are you sure you want to archive requisition ${code}?`)) {
      deleteJobRequisition(jobId);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'لوحة تحكم إدارة وتكوين سياسات الموارد البشرية' : 'HR Administrator Control Center — Policy & Job Requisitions'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'نشر وإدارة الوظائف الملاحية الشاغرة، تكوين أوزان الفرز، بنوك أسئلة المقابلات الذكية، وسياسات الخدمة'
              : 'Post new job requisitions for candidates, configure AI scoring rules, interview rubrics, and SLA thresholds.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            onClick={() => setShowPostJobModal(true)}
          >
            <Plus size={15} />
            <span>{language === 'ar' ? '➕ نشر وظيفة ملاحية جديدة' : '➕ Post New Job Requisition'}</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setActiveNavTab('recruiter_hub')}
          >
            <LayoutDashboard size={14} />
            <span>{language === 'ar' ? 'مركز عمليات التوظيف ←' : 'Recruitment Pipeline Hub →'}</span>
          </button>
        </div>
      </div>

      {/* ================= JOB REQUISITION & CAREER PORTAL POSTINGS (Section HR-POST) ================= */}
      {(activeNavTab === 'job_postings' || activeNavTab === 'admin_dashboard') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {/* KPI Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'ar' ? 'الوظائف المتاحة في بوابة المرشحين' : 'Active Career Portal Openings'}
                </span>
                <Briefcase size={16} color="var(--color-primary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-primary-dark)' }}>
                  {allRequisitions.length}
                </h2>
                <span className="badge green-badge" style={{ fontSize: 10 }}>Live On Portal</span>
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'ar' ? 'إجمالي طلبات المرشحين المستلمة' : 'Total Candidate Submissions'}
                </span>
                <Users size={16} color="#3B82F6" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#1E40AF' }}>
                  {allRequisitions.reduce((acc, r) => acc + (r.totalApplicants || 0), 0) + applications.length}
                </h2>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Across all requisitions</span>
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'ar' ? 'تم اجتياز الفرز الآلي' : 'AI Screened & Qualified'}
                </span>
                <Sparkles size={16} color="#10B981" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#065F46' }}>
                  {allRequisitions.reduce((acc, r) => acc + (r.shortlistCount || 0), 0)}
                </h2>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Shortlisted for interviews</span>
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'ar' ? 'بوابة تكامل أوراكل' : 'Oracle HCM Integration'}
                </span>
                <Zap size={16} color="#F59E0B" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#92400E' }}>
                  100%
                </h2>
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 10 }}>REST Gateway Active</span>
              </div>
            </div>
          </div>

          {/* Directory of Job Requisitions Card */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={16} color="var(--color-primary)" />
                  <span>
                    {language === 'ar'
                      ? 'دليل ونشر الوظائف الملاحية (SANS Air Navigation Job Postings)'
                      : 'Active Job Requisitions & Career Portal Directory'}
                  </span>
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {language === 'ar'
                    ? 'الوظائف المنشورة هنا تظهر فوراً في بوابة المتقدمين للتقديم والخضوع للفرز الآلي والمقابلات الذكية'
                    : 'Requisitions published here are instantly visible to candidates for online application, automated AI screening, and voice interview.'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'بحث بالرمز، المسمى، أو القطاع...' : 'Search jobs by title, code, unit...'}
                    className="clean-input"
                    style={{ width: '100%', paddingLeft: 30, fontSize: 12 }}
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  onClick={() => setShowPostJobModal(true)}
                >
                  <Plus size={14} />
                  <span>{language === 'ar' ? 'نشر وظيفة جديدة' : 'Post New Job'}</span>
                </button>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                {filteredRequisitions.map(job => (
                  <div
                    key={job.id}
                    style={{
                      padding: 18,
                      border: job.isNew ? '2px solid #F59E0B' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: job.isNew ? '#FFFDF7' : '#FFFFFF',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge outline-badge" style={{ fontWeight: 800, fontSize: 11, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                            {job.code}
                          </span>
                          {job.isNew && (
                            <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', fontWeight: 800, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Sparkles size={11} color="#D97706" />
                              <span>{language === 'ar' ? 'حديثة النشر' : 'Newly Posted'}</span>
                            </span>
                          )}
                        </div>

                        <span className="badge green-badge" style={{ fontSize: 11 }}>
                          {job.status}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h4 style={{ margin: '4px 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                        {language === 'ar' ? job.titleAr : job.title}
                      </h4>
                      {language === 'en' && job.titleAr && (
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 8 }}>
                          {job.titleAr}
                        </p>
                      )}

                      {/* Department and Location */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Building2 size={13} color="var(--color-primary)" />
                          <span>{language === 'ar' ? job.departmentAr : job.department}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} color="var(--color-primary)" />
                          <span>{job.location}</span>
                        </div>
                        {job.salaryRange && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--color-primary)' }}>
                            <Briefcase size={13} />
                            <span>{job.salaryRange} &bull; {job.experienceLevel || 'Mid-Senior Level'}</span>
                          </div>
                        )}
                      </div>

                      {/* Description Preview */}
                      <p style={{ fontSize: 12, color: 'var(--color-text-main)', lineHeight: 1.4, margin: '8px 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {language === 'ar' ? job.descriptionAr : job.description}
                      </p>

                      {/* Application Stats Strip */}
                      <div style={{ display: 'flex', gap: 8, padding: '8px 10px', backgroundColor: 'var(--color-subtle-green)', borderRadius: 6, fontSize: 11, marginBottom: 14 }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: 13 }}>{job.totalApplicants}</strong>
                          <span style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'متقدم' : 'Applicants'}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                          <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: 13 }}>{job.screenedCount}</strong>
                          <span style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'مفحوص آلياً' : 'Screened'}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <strong style={{ display: 'block', color: 'var(--color-accent)', fontSize: 13 }}>{job.shortlistCount}</strong>
                          <span style={{ color: 'var(--color-text-muted)' }}>{language === 'ar' ? 'مؤهل' : 'Shortlisted'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                          onClick={() => handleViewRequisitionPipeline(job)}
                          title="View candidates ranked for this job"
                        >
                          <Eye size={13} />
                          <span>{language === 'ar' ? 'عرض المرشحين والمطابقة الآلية' : 'View Ranked Candidates'}</span>
                        </button>
                      </div>

                      {allRequisitions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id, job.code)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: 4
                          }}
                          title="Archive requisition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCORING WEIGHTS & RULES */}
      {(activeNavTab === 'scoring_rules') && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {language === 'ar' ? 'إعداد أوزان معايير الفرز الافتراضية' : 'Default AI Evaluation Scoring Matrix'}
            </h3>
            <span className="badge green-badge">Global Active Baseline</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, padding: 20 }}>
            <div style={{ padding: 14, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>Technical Experience:</strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{weights.experience}%</span>
              </div>
              <input 
                type="range" 
                min={10} 
                max={60} 
                value={weights.experience}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                onChange={(e) => updateWeight('experience', parseInt(e.target.value, 10))}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Minimum threshold: 5 years for senior ATC.</span>
            </div>

            <div style={{ padding: 14, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>Certificates &amp; Ratings:</strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{weights.certifications}%</span>
              </div>
              <input 
                type="range" 
                min={10} 
                max={50} 
                value={weights.certifications}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                onChange={(e) => updateWeight('certifications', parseInt(e.target.value, 10))}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>GACA License &amp; OJTI rating weights.</span>
            </div>

            <div style={{ padding: 14, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>Formal Education:</strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{weights.education}%</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={40} 
                value={weights.education}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                onChange={(e) => updateWeight('education', parseInt(e.target.value, 10))}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Aviation Management or Engineering degree.</span>
            </div>

            <div style={{ padding: 14, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>ICAO Language Proficiency:</strong>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{weights.language}%</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={30} 
                value={weights.language}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                onChange={(e) => updateWeight('language', parseInt(e.target.value, 10))}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Level 4 mandatory; Level 5+ preferred.</span>
            </div>
          </div>

          <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={() => alert('Default scoring weights committed to SANS tenant policy.')}>
              <Save size={14} />
              <span>Save Tenant Policy Baseline</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPETENCY BANKS */}
      {activeNavTab === 'competency_banks' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Interview Question Banks &amp; Scoring Rubrics</h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Configured scenarios for automated AI voice &amp; text evaluations
              </span>
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                placeholder={language === 'ar' ? 'إضافة سيناريو أو معيار كفاءة جديد...' : 'Add new interview scenario or competency domain...'}
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)' }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddPrompt}>
                <Plus size={14} />
                <span>{language === 'ar' ? 'إضافة للبنك' : 'Add to Rubric Bank'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {promptsList.map((item, idx) => (
                <div key={idx} style={{ padding: 14, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--color-primary-dark)' }}>{item.title}</strong>
                    <span className="badge green-badge">Active</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SLA & ESCALATION POLICIES */}
      {activeNavTab === 'sla_rules' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'سياسات وقواعد الالتزام باتفاقية مستوى الخدمة (SLA)' : 'SLA Turnaround Thresholds & Escalation Policies'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Target response times, automated warning alerts, and executive escalations
              </span>
            </div>
            {savedSuccess && (
              <span className="badge green-badge">&#10003; SLA Policies Saved</span>
            )}
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>Screening SLA Target:</strong>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{screeningHours} Hours</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={screeningHours}
                  onChange={(e) => setScreeningHours(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Maximum 48h limit before Level 1 notification.</span>
              </div>

              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>Interview Turnaround:</strong>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{interviewHours} Hours</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={120}
                  value={interviewHours}
                  onChange={(e) => setInterviewHours(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Evaluation window for hiring committee review.</span>
              </div>

              <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>Clearances &amp; Offer SLA:</strong>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{clearanceHours} Hours</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={168}
                  value={clearanceHours}
                  onChange={(e) => setClearanceHours(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Nafath &amp; Amn security approval timeline.</span>
              </div>
            </div>

            {/* Escalation Rules Toggles */}
            <div style={{ padding: 14, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 10 }}>
                Escalation Triggers &amp; Notification Automation
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoEscalateLevel2}
                    onChange={(e) => setAutoEscalateLevel2(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong>Auto-Escalate to Talent Acquisition Lead</strong> if candidate stays in screening queue &gt; 48 hours without recruiter override.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={smsAlertsEnabled}
                    onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    <strong>Send Immediate SMS &amp; Mobile Push Notification</strong> to candidates when Virtual AI Interview is unlocked.
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSaveSla}>
                <CheckCircle2 size={14} />
                <span>Save SLA Escalation Policies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSIDIARY CONFIG */}
      {activeNavTab === 'subsidiary_config' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Subsidiary Tenant Configuration (SANS, NERA, SACA)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20 }}>
            <div style={{ padding: 14, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-md)' }}>
              <strong>SANS Core Operations</strong>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Primary En-Route Radar &amp; ACC Operations (Riyadh &amp; Jeddah Centers).</p>
              <span className="badge green-badge" style={{ marginTop: 8 }}>Active Tenant</span>
            </div>
            <div style={{ padding: 14, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <strong>NERA</strong>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Air Navigation &amp; Airport Technical Infrastructure Maintenance.</p>
              <span className="badge green-badge" style={{ marginTop: 8 }}>Active Tenant</span>
            </div>
            <div style={{ padding: 14, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <strong>SACA Academy</strong>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Saudi Academy of Civil Aviation Training Programs &amp; Trainee Cadets.</p>
              <span className="badge green-badge" style={{ marginTop: 8 }}>Active Tenant</span>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW JOB MODAL */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
      />
    </div>
  );
};
