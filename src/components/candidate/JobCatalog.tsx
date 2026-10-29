import React, { useState } from 'react';
import { JobRequisition } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import {
  Search,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface JobCatalogProps {
  onApplyJob: (job: JobRequisition) => void;
}

export const JobCatalog: React.FC<JobCatalogProps> = ({ onApplyJob }) => {
  const { language } = useLanguage();
  const { allRequisitions, applications } = useCandidate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);

  const appliedCodes = new Set(applications.map(a => a.requisitionCode));

  const filteredJobs = allRequisitions.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.titleAr.includes(searchTerm) ||
      job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === 'all' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const toggleExpand = (id: string) => {
    setExpandedReqId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header & Filter Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {language === 'ar' ? 'الوظائف الملاحية الشاغرة (SANS Open Requisitions)' : 'Explore SANS Air Navigation Requisitions'}
            </h3>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {language === 'ar'
                ? 'استعرض الشواغر المتاحة، اطلع على متطلبات التوظيف التفصيلية، وقدّم طلبك للخضوع للفرز الآلي والمقابلة الذكية'
                : 'Review active openings, inspect full GACA licensing criteria, and apply for instant AI screening & virtual interview.'}
            </span>
          </div>
          <span className="badge green-badge">
            {filteredJobs.length} {language === 'ar' ? 'وظائف متاحة' : 'Active Requisitions'}
          </span>
        </div>

        {/* Search & Location Bar */}
        <div style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', backgroundColor: 'var(--color-subtle-green)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', top: 10, left: 10 }} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث باسم الوظيفة، الرمز، أو الإدارة الملاحية...' : 'Search by job title, code, or department...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: 13
              }}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: 13,
                backgroundColor: '#fff'
              }}
            >
              <option value="all">{language === 'ar' ? 'جميع مناطق المملكة' : 'All Locations (KSA)'}</option>
              <option value="Riyadh">Riyadh (الرياض)</option>
              <option value="Jeddah">Jeddah (جدة)</option>
              <option value="Dammam">Dammam (الدمام)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        {filteredJobs.map(job => {
          const isApplied = appliedCodes.has(job.code);
          const isExpanded = expandedReqId === job.id;

          return (
            <div
              key={job.id}
              className="card"
              style={{
                border: isApplied ? '1.5px solid var(--color-border-green)' : '1px solid var(--color-border)',
                transition: 'border-color 0.2s',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="badge outline-badge" style={{ fontWeight: 700, fontSize: 11 }}>
                        {job.code}
                      </span>
                      {job.isNew && (
                        <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', fontWeight: 800, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={11} color="#D97706" />
                          <span>{language === 'ar' ? 'وظيفة معلنة حديثاً' : 'Newly Posted'}</span>
                        </span>
                      )}
                      {isApplied && (
                        <span className="badge green-badge" style={{ fontSize: 11 }}>
                          &#10003; {language === 'ar' ? 'تم التقديم مسبقاً' : 'Application Submitted'}
                        </span>
                      )}
                      <span className="badge" style={{ backgroundColor: '#E8F5E9', color: 'var(--color-primary-dark)', fontSize: 11 }}>
                        {job.experienceLevel || 'Mid-Senior Level'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-dark)', margin: '2px 0 6px' }}>
                      {language === 'ar' ? job.titleAr : job.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={14} color="var(--color-primary)" />
                        <span>{language === 'ar' ? job.departmentAr : job.department}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} color="var(--color-primary)" />
                        <span>{job.location}</span>
                      </span>
                      {job.salaryRange && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--color-primary)' }}>
                          <Briefcase size={14} />
                          <span>{job.salaryRange}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleExpand(job.id)}
                    >
                      <span>{isExpanded ? (language === 'ar' ? 'إخفاء المتطلبات' : 'Hide Details') : (language === 'ar' ? 'عرض المتطلبات' : 'View Requirements')}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onApplyJob(job)}
                      style={{ padding: '6px 14px', fontWeight: 700 }}
                    >
                      <Sparkles size={14} />
                      <span>
                        {isApplied 
                          ? (language === 'ar' ? 'إعادة التقديم / فحص جديد' : 'Re-apply / Screen') 
                          : (language === 'ar' ? 'التقديم الآن ←' : 'Apply Now →')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Brief description snippet */}
                <p style={{ fontSize: 12, color: 'var(--color-text-main)', marginTop: 10, lineHeight: 1.5 }}>
                  {language === 'ar' ? job.descriptionAr : job.description}
                </p>

                {/* EXPANDED REQUIREMENTS SECTION */}
                {isExpanded && (
                  <div style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px dashed var(--color-border)',
                    backgroundColor: 'var(--color-subtle-green)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 14
                  }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Award size={15} color="var(--color-primary)" />
                      <span>{language === 'ar' ? 'المعايير والمتطلبات الإلزامية للوظيفة:' : 'Mandatory Qualifications & GACA Licensing Requirements:'}</span>
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
                      {(language === 'ar' ? (job.requirementsAr || []) : (job.requirements || [])).map((reqText, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--color-text-main)' }}>
                          <CheckCircle2 size={15} color="var(--color-accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{reqText}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--color-border-green)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                      <span><strong>Deadline:</strong> {job.deadline || '15 Nov 2026'} &bull; <strong>Employment:</strong> {job.employmentType || 'Full-time'}</span>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onApplyJob(job)}
                      >
                        <span>{language === 'ar' ? 'تقديم على هذه الوظيفة الآن' : 'Apply for this Requisition Now'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
