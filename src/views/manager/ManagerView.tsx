import React, { useState, useEffect } from 'react';
import { useCandidate } from '../../context/CandidateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { VoicePlayer } from '../../components/voice/VoicePlayer';
import { XaiModal } from '../../components/modals/XaiModal';
import { Candidate } from '../../types';
import { 
  Users, 
  GitCompare, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  Award,
  Clock,
  AlertCircle,
  FileText,
  Volume2,
  ExternalLink,
  Shield,
  Check,
  Mic,
  Layers,
  Video
} from 'lucide-react';
import { getCandidateAllInterviewAnswers } from '../../data/candidateInterviewAnswers';

export const ManagerView: React.FC = () => {
  const { candidates, applications } = useCandidate();
  const { language } = useLanguage();
  const { activeNavTab, setActiveNavTab } = useAuthRbac();

  // Selected candidate IDs for side-by-side comparison
  const [candidateAId, setCandidateAId] = useState<string>(() => candidates[0]?.id || '');
  const [candidateBId, setCandidateBId] = useState<string>(() => candidates[1]?.id || candidates[0]?.id || '');
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);
  const [selectedManagerInterviewCandId, setSelectedManagerInterviewCandId] = useState<string>(() => candidates[0]?.id || '');
  const [selectedManagerQuestionTab, setSelectedManagerQuestionTab] = useState<number | 'ALL'>('ALL');

  // Synchronize when candidates pool updates
  useEffect(() => {
    if (candidates.length > 0) {
      if (!candidates.some(c => c.id === candidateAId)) {
        setCandidateAId(candidates[0].id);
      }
      if (!candidates.some(c => c.id === candidateBId)) {
        setCandidateBId(candidates[1]?.id || candidates[0].id);
      }
    }
  }, [candidates, candidateAId, candidateBId]);

  const topCandidates = candidates.filter(c => (c.overrideScore ?? c.rawMatchScore) >= 70);

  const candidateA = candidates.find(c => c.id === candidateAId) || candidates[0];
  const candidateB = candidates.find(c => c.id === candidateBId) || candidates[1] || candidates[0];

  const handleSwap = () => {
    const temp = candidateAId;
    setCandidateAId(candidateBId);
    setCandidateBId(temp);
  };

  const handleCompareTopTwo = () => {
    const sorted = [...candidates].sort((a, b) => {
      const scoreA = a.overrideScore ?? a.rawMatchScore;
      const scoreB = b.overrideScore ?? b.rawMatchScore;
      return scoreB - scoreA;
    });
    if (sorted.length >= 2) {
      setCandidateAId(sorted[0].id);
      setCandidateBId(sorted[1].id);
    }
  };

  const renderCandidateComparisonCard = (cand: Candidate, slot: 'A' | 'B', opponent: Candidate) => {
    const score = cand.overrideScore ?? cand.rawMatchScore;
    const opponentScore = opponent.overrideScore ?? opponent.rawMatchScore;
    const scoreDiff = score - opponentScore;

    const isSlotA = slot === 'A';
    const accentColor = isSlotA ? 'var(--color-primary)' : '#2B6CB0';
    const lightBg = isSlotA ? 'var(--color-subtle-green)' : '#F0F7FF';
    const borderColor = isSlotA ? 'var(--color-border-green)' : '#BEE3F8';

    return (
      <div 
        key={`cand-card-${slot}-${cand.id}`}
        style={{
          border: `1.5px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-white)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* CARD HEADER & SELECTOR */}
        <div style={{
          padding: '16px 18px',
          backgroundColor: lightBg,
          borderBottom: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span 
              className="badge" 
              style={{ 
                backgroundColor: accentColor, 
                color: '#fff', 
                fontWeight: 700, 
                fontSize: 11,
                padding: '4px 10px'
              }}
            >
              {isSlotA 
                ? (language === 'ar' ? 'المرشح (أ) — الخيار الأساسي' : 'Candidate A (Primary)')
                : (language === 'ar' ? 'المرشح (ب) — للمقارنة المباشرة' : 'Candidate B (Benchmark)')}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {cand.overrideScore !== null && (
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700 }}>
                  {language === 'ar' ? 'درجة معدلة' : 'Override'}
                </span>
              )}
              <span className="badge score-high" style={{ fontSize: 13, fontWeight: 800 }}>
                {score}% Match
              </span>
            </div>
          </div>


          {/* CANDIDATE NAME & TITLE */}
          <div>
            <h3 style={{ margin: 0, fontSize: 17, color: 'var(--color-primary-dark)', fontWeight: 800 }}>
              {language === 'ar' ? cand.nameAr : cand.name}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {language === 'ar' ? cand.currentTitleAr : cand.currentTitle} &bull; ID: {cand.nationalId}
            </div>
          </div>

          {/* SCORE DELTA CHIP */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            {scoreDiff > 0 ? (
              <span className="badge green-badge" style={{ fontSize: 11, fontWeight: 700 }}>
                +{scoreDiff}% {language === 'ar' ? 'أعلى في تقييم الذكاء الاصطناعي' : 'Higher AI Match Score'}
              </span>
            ) : scoreDiff < 0 ? (
              <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 11 }}>
                {scoreDiff}% {language === 'ar' ? 'مقارنة بالمرشح الآخر' : 'vs opponent'}
              </span>
            ) : (
              <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 11 }}>
                {language === 'ar' ? 'تطابق متعادل (0%)' : 'Identical Match Score (0%)'}
              </span>
            )}
          </div>
        </div>

        {/* METRICS QUICK GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          padding: '14px 18px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {/* Radar Experience */}
          <div style={{
            padding: 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              <span>{language === 'ar' ? 'خبرة الرادار' : 'Radar Experience'}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 2 }}>
              {cand.experienceYears} {language === 'ar' ? 'سنوات' : 'Years'}
            </div>
            {cand.experienceYears > opponent.experienceYears && (
              <span style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700 }}>
                +{cand.experienceYears - opponent.experienceYears} yrs {language === 'ar' ? 'أقدمية أعلى' : 'seniority'}
              </span>
            )}
          </div>

          {/* Interview Score */}
          <div style={{
            padding: 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Award size={12} />
              <span>{language === 'ar' ? 'درجة المقابلة' : 'Interview Score'}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 2 }}>
              {cand.virtualInterviewScore} <span style={{ fontSize: 11, fontWeight: 500 }}>/ 100</span>
            </div>
            {cand.virtualInterviewScore > opponent.virtualInterviewScore && (
              <span style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700 }}>
                +{cand.virtualInterviewScore - opponent.virtualInterviewScore} pts {language === 'ar' ? 'أداء صوتي أعلى' : 'higher'}
              </span>
            )}
          </div>

          {/* Cognitive Percentile */}
          <div style={{
            padding: 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {language === 'ar' ? 'اختبار ميرسر الإدراكي' : 'Mercer Cognitive'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 2 }}>
              {cand.mercerPercentile}th <span style={{ fontSize: 11, fontWeight: 500 }}>%ile</span>
            </div>
            {cand.mercerPercentile > opponent.mercerPercentile && (
              <span style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700 }}>
                +{cand.mercerPercentile - opponent.mercerPercentile}% {language === 'ar' ? 'كفاءة ذهنية' : 'higher'}
              </span>
            )}
          </div>

          {/* AI Final Match */}
          <div style={{
            padding: 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {language === 'ar' ? 'درجة المطابقة الكلية' : 'Final Match Index'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
              {score}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              {language === 'ar' ? 'مطابقة معايير SANS' : 'SANS Criteria Fit'}
            </div>
          </div>
        </div>

        {/* COMPARISON DETAILS ACCORDION/LIST */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12, flex: 1 }}>
          {/* Licensing & Ratings */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="var(--color-primary)" />
              <span>{language === 'ar' ? 'التراخيص والاعتمادات الملاحية (GACA):' : 'Licensing & Aviation Ratings (GACA):'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cand.certifications.map((cert, idx) => (
                <span 
                  key={idx}
                  style={{
                    backgroundColor: cert.includes('OJTI') ? 'var(--color-soft-green)' : '#F1F5F9',
                    border: cert.includes('OJTI') ? '1px solid var(--color-border-green)' : '1px solid var(--color-border)',
                    color: cert.includes('OJTI') ? 'var(--color-primary)' : 'var(--color-text-main)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: cert.includes('OJTI') ? 700 : 500
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 4 }}>
              {language === 'ar' ? 'المؤهل الأكاديمي والجامعة:' : 'Academic Qualification & University:'}
            </div>
            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {language === 'ar' ? cand.educationAr : cand.education}
            </div>
          </div>

          {/* Key Strengths */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 4 }}>
              {language === 'ar' ? 'أبرز نقاط القوة الميدانية:' : 'Key Operational Strengths:'}
            </div>
            <div style={{
              padding: 10,
              backgroundColor: 'var(--color-subtle-green)',
              border: '1px solid var(--color-border-green)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-main)',
              lineHeight: 1.5
            }}>
              {language === 'ar' ? cand.keyStrengthsAr : cand.keyStrengths}
            </div>
          </div>

          {/* Identified Gaps */}
          <div>
            <div style={{ fontWeight: 700, color: '#9A3412', marginBottom: 4 }}>
              {language === 'ar' ? 'الفجوات التشغيلية أو نقاط التطوير:' : 'Identified Operational Gaps & Development Focus:'}
            </div>
            <div style={{
              padding: 10,
              backgroundColor: '#FFF7ED',
              border: '1px solid #FFEDD5',
              borderRadius: 'var(--radius-sm)',
              color: '#9A3412',
              lineHeight: 1.5
            }}>
              {language === 'ar' ? cand.identifiedGapsAr : cand.identifiedGaps}
            </div>
          </div>

          {/* Clearances Status */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 6 }}>
              {language === 'ar' ? 'التفويضات والتحقق الأمني (نفاذ وأمن):' : 'Government & Security Clearances:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
              <div style={{ padding: '6px 8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <strong>{language === 'ar' ? 'نفاذ الوطني:' : 'Nafath ID:'}</strong>{' '}
                <span style={{ color: cand.clearances.nafath.status === 'Verified' ? 'var(--color-success)' : 'inherit', fontWeight: 700 }}>
                  {cand.clearances.nafath.status}
                </span>
              </div>
              <div style={{ padding: '6px 8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <strong>{language === 'ar' ? 'تصريح أمن:' : 'AMN Security:'}</strong>{' '}
                <span style={{ color: cand.clearances.amn.status === 'Approved' ? 'var(--color-success)' : 'inherit', fontWeight: 700 }}>
                  {cand.clearances.amn.status}
                </span>
              </div>
              <div style={{ padding: '6px 8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <strong>{language === 'ar' ? 'الفحص الطبي:' : 'Medical Class 1:'}</strong>{' '}
                <span style={{ color: cand.clearances.medical.status === 'Valid' ? 'var(--color-success)' : 'inherit', fontWeight: 700 }}>
                  {cand.clearances.medical.status}
                </span>
              </div>
              <div style={{ padding: '6px 8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <strong>{language === 'ar' ? 'العنوان الوطني:' : 'Address:'}</strong>{' '}
                <span style={{ color: cand.clearances.address.status === 'Confirmed' ? 'var(--color-success)' : 'inherit', fontWeight: 700 }}>
                  {cand.clearances.address.status}
                </span>
              </div>
            </div>
          </div>

          {/* AI Audited Citation Excerpt */}
          {cand.citations && cand.citations[0] && (
            <div style={{
              padding: 10,
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {language === 'ar' ? cand.citations[0].criterionAr : cand.citations[0].criterion}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'موثوقية:' : 'Confidence:'} {cand.citations[0].confidence}
                </span>
              </div>
              <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                &ldquo;{language === 'ar' ? (cand.citations[0].quoteAr || cand.citations[0].quote) : cand.citations[0].quote}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* CARD FOOTER ACTIONS */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setInspectingCandidate(cand)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileText size={13} />
            <span>{language === 'ar' ? 'تحليل التقييم (XAI)' : 'Explain Score (XAI)'}</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              alert(language === 'ar'
                ? `تم توثيق توصية الكابتن خالد العتيبي بقبول المرشح ${cand.nameAr} للمجلس الاستشاري النهائي للملاحة الجوية.`
                : `Endorsement recorded for ${cand.name}! Committee approval signed.`);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 size={13} />
            <span>{language === 'ar' ? 'اعتماد التوصية' : 'Endorse Candidate'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'ar' ? 'بوابة مدير العمليات والملاحة الجوية (ATC Operations)' : 'Hiring Manager Portal — Air Traffic Control Directorate'}
          </h1>
          <p className="page-subtitle">
            {language === 'ar'
              ? 'مراجعة المرشحين المحالين، مقارنة الكفاءات الميدانية، واعتماد التوصيات النهائية للجنة'
              : 'Evaluate shortlisted ATC candidates, compare technical proficiencies, and submit final committee endorsements.'}
          </p>
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setActiveNavTab('recruiter_hub')}
        >
          <LayoutDashboard size={14} />
          <span>{language === 'ar' ? 'مركز عمليات التوظيف والفرز الذكي ←' : 'Open Recruitment Hub Pipeline →'}</span>
        </button>
      </div>

      {/* DASHBOARD / ASSIGNED SHORTLISTS */}
      {(activeNavTab === 'manager_dashboard' || activeNavTab === 'assigned_shortlists') && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {language === 'ar' ? 'المرشحون المحالون لمراجعة إدارة المراقبة الجوية' : 'Assigned Candidates for ATC Operational Review'}
            </h3>
            <span className="badge green-badge">
              {topCandidates.length} {language === 'ar' ? 'مرشحين مؤهلين' : 'Candidates Awaiting Committee Endorsement'}
            </span>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'اسم المرشح' : 'Candidate Name'}</th>
                  <th>{language === 'ar' ? 'المؤهل الملاحي' : 'Aviation License & Degree'}</th>
                  <th>{language === 'ar' ? 'الخبرة الميدانية' : 'Radar Experience'}</th>
                  <th>{language === 'ar' ? 'تقييم الذكاء الاصطناعي' : 'AI Match Score'}</th>
                  <th>{language === 'ar' ? 'درجة المقابلة الذكية' : 'Interview Score'}</th>
                  <th>{language === 'ar' ? 'قرار اللجنة' : 'Committee Endorsement'}</th>
                </tr>
              </thead>
              <tbody>
                {topCandidates.map(cand => {
                  const score = cand.overrideScore ?? cand.rawMatchScore;
                  return (
                    <tr key={cand.id}>
                      <td>
                        <strong>{language === 'ar' ? cand.nameAr : cand.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {language === 'ar' ? cand.currentTitleAr : cand.currentTitle}
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {cand.certifications[0]}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <strong>{cand.experienceYears} Years</strong> En-Route Radar
                      </td>
                      <td>
                        <span className="badge score-high" style={{ fontWeight: 800 }}>{score}%</span>
                      </td>
                      <td>
                        <strong>{cand.virtualInterviewScore} / 100</strong>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            alert(language === 'ar' 
                              ? `تم توثيق توصية الكابتن خالد العتيبي بقبول المرشح ${cand.nameAr} للمجلس الاستشاري النهائي للملاحة الجوية.` 
                              : `Endorsement recorded for ${cand.name}! Committee approval signed.`);
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>{language === 'ar' ? 'اعتماد التوصية' : 'Endorse Candidate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON */}
      {activeNavTab === 'candidate_comparison' && (
        <div className="card">
          <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitCompare size={18} color="var(--color-primary)" />
                <h3 className="card-title" style={{ margin: 0 }}>
                  {language === 'ar' ? 'المقارنة الميدانية المباشرة بين كفاءات المرشحين' : 'Side-by-Side ATC Competency Comparison Matrix'}
                </h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 0 }}>
                {language === 'ar'
                  ? 'اختر أي مرشحين من القوائم المنسدلة أدناه لإجراء مقارنة تفصيلية شاملة بين الخبرات الرادارية، نتائج الذكاء الاصطناعي، والتراخيص الملاحية.'
                  : 'Select any two candidates using the dropdown menus below to compare radar qualifications, AI evaluation scores, cognitive percentiles, and operational credentials side-by-side.'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleCompareTopTwo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Reset comparison to the top 2 scored candidates"
              >
                <Sparkles size={14} color="var(--color-primary)" />
                <span>{language === 'ar' ? 'مقارنة المتصدرين (Top 2)' : 'Compare Top 2 Ranked'}</span>
              </button>
            </div>
          </div>

          {/* CANDIDATE DROPDOWN SELECTOR BAR */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-subtle-green)',
            borderBottom: '1px solid var(--color-border-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            {/* Candidate A Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
              <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 700, padding: '5px 9px' }}>
                {language === 'ar' ? 'المرشح (أ)' : 'Candidate A'}
              </span>
              <div style={{ flex: 1 }}>
                <select
                  id="candidate-a-dropdown"
                  className="clean-select"
                  style={{ width: '100%', fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 13 }}
                  value={candidateAId}
                  onChange={(e) => setCandidateAId(e.target.value)}
                >
                  {candidates.map(cand => {
                    const score = cand.overrideScore ?? cand.rawMatchScore;
                    return (
                      <option key={`cand-a-top-${cand.id}`} value={cand.id}>
                        {language === 'ar' ? cand.nameAr : cand.name} ({score}%) — {language === 'ar' ? cand.currentTitleAr : cand.currentTitle}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSwap}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
              title={language === 'ar' ? 'تبديل مواضع المرشحين' : 'Swap candidate positions'}
            >
              <ArrowLeftRight size={14} />
              <span>{language === 'ar' ? 'تبديل' : 'Swap'}</span>
            </button>

            {/* Candidate B Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
              <span className="badge" style={{ backgroundColor: '#2B6CB0', color: '#fff', fontWeight: 700, padding: '5px 9px' }}>
                {language === 'ar' ? 'المرشح (ب)' : 'Candidate B'}
              </span>
              <div style={{ flex: 1 }}>
                <select
                  id="candidate-b-dropdown"
                  className="clean-select"
                  style={{ width: '100%', fontWeight: 700, borderColor: '#2B6CB0', fontSize: 13 }}
                  value={candidateBId}
                  onChange={(e) => setCandidateBId(e.target.value)}
                >
                  {candidates.map(cand => {
                    const score = cand.overrideScore ?? cand.rawMatchScore;
                    return (
                      <option key={`cand-b-top-${cand.id}`} value={cand.id}>
                        {language === 'ar' ? cand.nameAr : cand.name} ({score}%) — {language === 'ar' ? cand.currentTitleAr : cand.currentTitle}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Same candidate notice if user selects same in both */}
          {candidateA && candidateB && candidateA.id === candidateBId && (
            <div style={{
              margin: '16px 20px 0 20px',
              padding: '10px 14px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={15} color="#D97706" />
              <span>
                {language === 'ar'
                  ? 'تنبيه: قمت باختيار نفس المرشح في كلا الجانبين. يرجى اختيار مرشح آخر من إحدى القوائم المنسدلة لإجراء المقارنة المباشرة.'
                  : 'Notice: You have selected the same candidate in both dropdowns. Select a different candidate from one of the selectors to perform a side-by-side comparison.'}
              </span>
            </div>
          )}

          {/* CARDS COMPARISON BODY */}
          <div style={{ padding: 20 }}>
            {candidateA && candidateB ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                {/* CANDIDATE A CARD */}
                {renderCandidateComparisonCard(candidateA, 'A', candidateB)}

                {/* CANDIDATE B CARD */}
                {renderCandidateComparisonCard(candidateB, 'B', candidateA)}
              </div>
            ) : (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {language === 'ar' ? 'لا يوجد مرشحون متاحون للمقارنة.' : 'No candidates available for comparison.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERVIEW EVALUATIONS & SPEECH */}
      {activeNavTab === 'interview_evaluations' && (() => {
        const activeCand = candidates.find(c => c.id === selectedManagerInterviewCandId) || candidates[0];
        const activeApp = applications.find(a => a.candidateId === activeCand.id || a.candidateName === activeCand.name) || applications[0];
        const allManagerAnswers = getCandidateAllInterviewAnswers(activeApp, activeCand);
        const displayedManagerAnswers = selectedManagerQuestionTab === 'ALL'
          ? allManagerAnswers
          : allManagerAnswers.filter(a => a.questionNumber === selectedManagerQuestionTab);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header Card */}
            <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mic size={18} color="var(--color-primary)" />
                    <span>{language === 'ar' ? 'تحليل الأداء الصوتي للمرشح ومراجعة كافة الإجابات' : 'Audio Interview Analysis & Candidate Complete Q&A Review'}</span>
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                    {language === 'ar'
                      ? 'مراجعة كافة الأسئلة الخمسة والإجابات الصوتية المسجلة، تفريغ النص الحقيقي، وتقييم مصطلحات الإيكاو'
                      : 'Review all 5 interview questions, verbatim voice recordings, speech pacing, and ICAO Annex 11 phraseology scores.'}
                  </p>
                </div>

                {/* Candidate Selector Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label htmlFor="mgr-candidate-select" style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {language === 'ar' ? 'المرشح المطلوب تقييمه:' : 'Select Candidate:'}
                  </label>
                  <select
                    id="mgr-candidate-select"
                    className="clean-select"
                    style={{ minWidth: 260, fontWeight: 700, borderColor: 'var(--color-primary)', fontSize: 13 }}
                    value={activeCand.id}
                    onChange={(e) => setSelectedManagerInterviewCandId(e.target.value)}
                  >
                    {candidates.map(c => {
                      const score = c.overrideScore ?? c.rawMatchScore;
                      return (
                        <option key={`mgr-cand-${c.id}`} value={c.id}>
                          {language === 'ar' ? c.nameAr : c.name} ({score}%) — {language === 'ar' ? c.currentTitleAr : c.currentTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Question Navigation Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)', marginRight: 6 }}>
                  {language === 'ar' ? 'تصفح الإجابات:' : 'Answers:'}
                </span>
                <button
                  className={`btn btn-sm ${selectedManagerQuestionTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedManagerQuestionTab('ALL')}
                  style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Layers size={12} />
                  <span>{language === 'ar' ? '✦ عرض كافة الإجابات (5)' : '✦ View All 5 Answers'}</span>
                </button>
                {allManagerAnswers.map(ans => (
                  <button
                    key={`mgr-q-tab-${ans.questionNumber}`}
                    className={`btn btn-sm ${selectedManagerQuestionTab === ans.questionNumber ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedManagerQuestionTab(ans.questionNumber)}
                    style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Q{ans.questionNumber}</span>
                    <span className="badge" style={{ 
                      backgroundColor: selectedManagerQuestionTab === ans.questionNumber ? 'rgba(255,255,255,0.25)' : '#DCFCE7',
                      color: selectedManagerQuestionTab === ans.questionNumber ? '#FFFFFF' : '#15803D',
                      fontSize: 10,
                      padding: '1px 5px'
                    }}>
                      {ans.score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions & Answers Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {displayedManagerAnswers.map((item) => {
                const qText = language === 'ar' ? item.questionAr : item.questionEn;
                const aText = language === 'ar' ? item.candidateAnswerAr : item.candidateAnswerEn;

                return (
                  <div 
                    key={`mgr-ans-${item.id}`}
                    className="card"
                    style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}
                  >
                    {/* Header */}
                    <div style={{
                      padding: '12px 18px',
                      backgroundColor: 'var(--color-subtle-green)',
                      borderBottom: '1px solid var(--color-border-green)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontWeight: 800, fontSize: 11 }}>
                          Question {item.questionNumber} of 5
                        </span>
                        <span className="badge outline-badge" style={{ fontSize: 11 }}>
                          {language === 'ar' ? item.categoryAr : item.category}
                        </span>
                        <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: 10 }}>
                          {item.questionType} &bull; {item.difficulty}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {item.duration} &bull; {item.wordCount} words
                        </span>
                        <span className="badge score-high" style={{ fontWeight: 800 }}>
                          {item.score} / 100
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <div style={{ padding: '14px 18px', backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        {language === 'ar' ? 'نص السؤال:' : 'Question Prompt:'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', lineHeight: 1.5 }}>
                        {qText}
                      </div>
                    </div>

                    {/* Voice player & Verbatim transcript */}
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mic size={14} color="var(--color-primary)" />
                          <span>{language === 'ar' ? `تشغيل التسجيل الصوتي لإجابة ${activeCand.nameAr} (السؤال ${item.questionNumber}):` : `Candidate Voice Recording (Question ${item.questionNumber}):`}</span>
                        </div>
                        <VoicePlayer
                          speakerName={language === 'ar' ? activeCand.nameAr : activeCand.name}
                          questionText={qText}
                          responseText={aText}
                        />
                      </div>

                      <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                            {language === 'ar' ? 'تفريغ إجابة المرشح الحرفية:' : 'Verbatim Candidate Response Transcript:'}
                          </span>
                          <span className="badge green-badge" style={{ fontSize: 10 }}>
                            {item.icaoCompliance}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-main)', margin: 0, fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 4, border: '1px solid var(--color-border-subtle)' }}>
                          &ldquo;{aText}&rdquo;
                        </p>
                      </div>

                      {/* Rubrics & AI Feedback */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, fontSize: 11 }}>
                        <div style={{ padding: 10, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                          <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: 3 }}>
                            {language === 'ar' ? 'تقييم الذكاء الاصطناعي:' : 'AI Evaluation Feedback:'}
                          </strong>
                          <span style={{ color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                            {language === 'ar' ? item.aiFeedbackAr : item.aiFeedbackEn}
                          </span>
                        </div>

                        <div style={{ padding: 10, backgroundColor: '#F1F5F9', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                          <strong style={{ color: '#334155', display: 'block', marginBottom: 3 }}>
                            {language === 'ar' ? 'معايير الإيكاو والملاحة المستوفاة:' : 'Evaluated SANS/ICAO Rubrics:'}
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: language === 'ar' ? 0 : 16, paddingRight: language === 'ar' ? 16 : 0, color: 'var(--color-text-muted)' }}>
                            {(language === 'ar' ? item.rubricsAr : item.rubricsEn).map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* COMMITTEE APPROVALS */}
      {activeNavTab === 'committee_approvals' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {language === 'ar' ? 'محاضر وقرارات لجان التوظيف المعتمدة (ATC Selection Board)' : 'Official ATC Committee Resolution & Sign-Off'}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Resolution #ATC-COM-2026-08 &bull; Area Control Center (Riyadh ACC)
              </span>
            </div>
            <span className="badge green-badge">Quorum Reached (3/3 Endorsed)</span>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Committee members tally */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Capt. Khalid Al-Otaibi</strong>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Head of ATC Operations (Board Chair)</div>
                <span className="badge green-badge" style={{ marginTop: 6 }}>&#10003; Vote: Approved (Mohammad Al-Zahrani)</span>
              </div>

              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Dr. Faisal Al-Harthi</strong>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Executive Assessment Specialist</div>
                <span className="badge green-badge" style={{ marginTop: 6 }}>&#10003; Vote: Approved (Cognitive 86th%)</span>
              </div>

              <div style={{ padding: 12, backgroundColor: 'var(--color-subtle-green)', border: '1px solid var(--color-border-green)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Eng. Tariq Al-Ghamdi</strong>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>CNS/ATM Technical Representative</div>
                <span className="badge green-badge" style={{ marginTop: 6 }}>&#10003; Vote: Approved (GACA Radar Endorsed)</span>
              </div>
            </div>

            {/* Resolution Statement */}
            <div style={{ padding: 14, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 12, lineHeight: 1.6 }}>
              <strong>Official Board Resolution:</strong>{' '}
              The ATC Selection Committee unanimously recommends candidate <strong>Mohammad Al-Zahrani</strong> for final job offer appointment as Senior Air Traffic Control Specialist (En-Route Radar, Riyadh ACC), subject to final security clearance and medical validation.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => alert('Resolution cryptographically signed with Capt. Khalid Al-Otaibi private key.')}>
                <CheckCircle2 size={14} />
                <span>Sign Digital Approval</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => alert('Official Committee Minutes exported to secure PDF pack.')}>
                <FileCheck size={14} />
                <span>Export Signed Minutes Pack</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectingCandidate && (
        <XaiModal candidate={inspectingCandidate} onClose={() => setInspectingCandidate(null)} />
      )}
    </div>
  );
};
