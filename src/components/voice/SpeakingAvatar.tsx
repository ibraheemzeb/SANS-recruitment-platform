import React from 'react';

interface SpeakingAvatarProps {
  isSpeaking: boolean;
  avatarType?: 'interviewer' | 'candidate';
  size?: number;
  label?: string;
}

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = ({
  isSpeaking,
  avatarType = 'interviewer',
  size = 96,
  label
}) => {
  const isInterviewer = avatarType === 'interviewer';

  return (
    <div className="avatar-stage">
      <div 
        className="avatar-character-box" 
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Background Circle */}
          <circle cx="50" cy="50" r="48" fill={isInterviewer ? "#E8F5E9" : "#F4FBF7"} stroke="#0F5132" strokeWidth="2" />
          
          {/* Torso / Uniform / Suit */}
          <path 
            d="M20 90C20 74 34 68 50 68C66 68 80 74 80 90" 
            fill={isInterviewer ? "#0A3622" : "#1A365D"} 
          />
          {/* Shirt Collar */}
          <path d="M42 68L50 80L58 68H42Z" fill="#FFFFFF" />
          {/* Tie or Badge */}
          {isInterviewer ? (
            <path d="M48 76L50 88L52 76H48Z" fill="#198754" />
          ) : (
            <path d="M48 76L50 88L52 76H48Z" fill="#0D6EFD" />
          )}

          {/* Neck */}
          <rect x="44" y="52" width="12" height="18" fill="#FCD34D" rx="2" />

          {/* Head */}
          <ellipse cx="50" cy="40" rx="20" ry="24" fill="#FCD34D" />

          {/* Hair / Headwear */}
          {isInterviewer ? (
            /* Professional Short Hair */
            <path d="M30 36C30 24 38 18 50 18C62 18 70 24 70 36C65 30 58 28 50 28C42 28 35 30 30 36Z" fill="#2D3748" />
          ) : (
            /* Traditional Ghutra / Shemagh Trim or Modern Hair */
            <path d="M28 34C28 22 38 16 50 16C62 16 72 22 72 34C68 28 58 24 50 24C42 24 32 28 28 34Z" fill="#1A202C" />
          )}

          {/* Eyes */}
          <circle cx="42" cy="38" r="2.5" fill="#1A202C" />
          <circle cx="58" cy="38" r="2.5" fill="#1A202C" />
          
          {/* Eyebrows */}
          <path d="M38 32C41 31 44 32 46 33" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M62 32C59 31 56 32 54 33" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />

          {/* Nose */}
          <path d="M50 40V44L48 46H52" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />

          {/* Mouth (Animates when isSpeaking is true!) */}
          {isSpeaking ? (
            <g className="speaking-pulse">
              <ellipse cx="50" cy="52" rx="5" ry="4" fill="#991B1B" />
              <path d="M47 50H53" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          ) : (
            <path d="M46 52C48 54 52 54 54 52" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Headset (For Air Traffic Control / Virtual Interviewer) */}
          <path d="M28 38C28 26 38 18 50 18C62 18 72 26 72 38" stroke="#198754" strokeWidth="2.5" fill="none" />
          <circle cx="28" cy="40" r="4" fill="#0F5132" />
          <circle cx="72" cy="40" r="4" fill="#0F5132" />
          <path d="M28 42L36 50L44 48" stroke="#0F5132" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="speaking-indicator">
        {isSpeaking ? (
          <>
            <span className="pulse-dot" style={{ backgroundColor: '#198754' }}></span>
            <span>{isInterviewer ? 'AI Interviewer Speaking...' : 'Candidate Responding (Voice Audio)...'}</span>
          </>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>
            {label || (isInterviewer ? 'AI Interviewer (Standby)' : 'Candidate Response (Recorded)')}
          </span>
        )}
      </div>
    </div>
  );
};
