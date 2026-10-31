import React from 'react';
import { useAuthRbac } from '../../context/AuthRbacContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { PERSONAS } from '../../data/personas';
import { Globe, Database } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { role, setRole, activePersona } = useAuthRbac();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="logo-box">
          <div className="logo-badge">SANS</div>
          <div className="logo-text-block">
            <span className="logo-title">{t('sans.brand')}</span>
            <span className="logo-subtitle">{t('sans.subtitle')}</span>
          </div>
        </div>

        <div className="oracle-sync-pill">
          <span className="pulse-dot"></span>
          <span>{t('oracle.connected')}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Dynamic RBAC Persona Switcher */}
        <div className="rbac-selector-group">
          <span className="rbac-label">Persona:</span>
          <select 
            className="rbac-select" 
            value={role} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            id="rbac-persona-dropdown"
          >
            <option value="recruiter">Sarah Al-Harbi (HR Specialist)</option>
            <option value="manager">Capt. Khalid Al-Otaibi (Requirement Specialist)</option>
            <option value="admin">Mona Al-Dawsari (HR Administrator)</option>
            <option value="reviewer">Dr. Faisal Al-Harthi (Assessment Specialist)</option>
            <option value="compliance">Waleed Al-Mutairi (Compliance Officer)</option>
            <option value="sysadmin">Eng. Yasser Al-Ghamdi (System Administrator)</option>
            <option value="candidate">Mohammad Al-Zahrani (Candidate Portal)</option>
          </select>
        </div>

        {/* Language Switcher */}
        <button 
          className="lang-btn" 
          onClick={toggleLanguage}
          title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
        >
          <Globe size={14} />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Current User Profile Chip */}
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {activePersona.initials}
          </div>
          <div className="user-text-info">
            <div className="user-fullname">
              {language === 'ar' ? activePersona.nameAr : activePersona.name}
            </div>
            <div className="user-role-label">
              {language === 'ar' ? activePersona.titleAr : activePersona.title}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
