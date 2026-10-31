import React from 'react';

interface SpeakingAvatarProps {
  isSpeaking: boolean;
  avatarType?: 'interviewer' | 'candidate';
  size?: number;
  label?: string;
  showEqualizer?: boolean;
}

export const SpeakingAvatar: React.FC<SpeakingAvatarProps> = ({
  isSpeaking,
  avatarType = 'interviewer',
  size = 120,
  label,
  showEqualizer = true
}) => {
  const isInterviewer = avatarType === 'interviewer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Avatar Container with Animated Speaking Ring */}
      <div 
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isInterviewer ? '#ECFDF5' : '#EFF6FF',
          border: isSpeaking
            ? '3px solid #10B981'
            : isInterviewer ? '3px solid #6EE7B7' : '3px solid #93C5FD',
          boxShadow: isSpeaking 
            ? '0 0 0 4px rgba(16, 185, 129, 0.25), 0 4px 12px rgba(16, 185, 129, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.25s ease'
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '92%', height: '92%' }}
          className="avatar-presence"
        >
          {/* Circular Canvas matching screenshot */}
          <circle cx="50" cy="50" r="46" fill={isInterviewer ? '#D1FAE5' : '#DBEAFE'} />
          
          {/* Professional Suit / Uniform Body */}
          <path 
            d="M18 92 C18 76 33 70 50 70 C67 70 82 76 82 92 Z" 
            fill={isInterviewer ? '#064E3B' : '#1E3A8A'} 
          />
          {/* Epaulettes / Gold Aviation Shoulders */}
          {isInterviewer && (
            <>
              <path d="M20 78 L28 72 L32 75 L24 81 Z" fill="#F59E0B" />
              <path d="M80 78 L72 72 L68 75 L76 81 Z" fill="#F59E0B" />
            </>
          )}

          {/* Crisp White Shirt Collar */}
          <path d="M41 70 L50 82 L59 70 H41 Z" fill="#F8FAFC" />

          {/* Professional Corporate Tie */}
          <path d="M47 77 L50 90 L53 77 H47 Z" fill={isInterviewer ? '#10B981' : '#3B82F6'} />
          <path d="M47 75 L50 78 L53 75 H47 Z" fill="#047857" />

          {/* Neck */}
          <rect x="44" y="54" width="12" height="18" fill="#FBD38D" rx="3" />
          <path d="M44 64 C47 67 53 67 56 64" stroke="#ED8936" strokeWidth="1" fill="none" opacity="0.4" />

          {/* Realistic Head & Jawline */}
          <ellipse cx="50" cy="40" rx="19" ry="23" fill="#FBD38D" />
          
          {/* Ears */}
          <ellipse cx="30" cy="41" rx="2.8" ry="5.5" fill="#F6AD55" />
          <ellipse cx="70" cy="41" rx="2.8" ry="5.5" fill="#F6AD55" />

          {/* Hair Styling (Professional Executive Cut) */}
          {isInterviewer ? (
            <path 
              d="M31 36 C31 22 39 16 50 16 C61 16 69 22 69 36 C64 28 58 26 50 26 C42 26 35 28 31 36 Z" 
              fill="#1E293B" 
            />
          ) : (
            <path 
              d="M29 35 C29 20 38 15 50 15 C62 15 71 20 71 35 C66 26 57 23 50 23 C43 23 34 26 29 35 Z" 
              fill="#0F172A" 
            />
          )}

          {/* Natural Eyebrows */}
          <path d="M37 32 C40 30.5 44 31 46 32.5" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M63 32 C60 30.5 56 31 54 32.5" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />

          {/* Natural Focused Eyes */}
          <ellipse cx="41.5" cy="37" rx="3" ry="2" fill="#FFFFFF" />
          <circle cx="42" cy="37" r="1.6" fill="#0F172A" />
          <circle cx="42.5" cy="36.5" r="0.6" fill="#FFFFFF" />

          <ellipse cx="58.5" cy="37" rx="3" ry="2" fill="#FFFFFF" />
          <circle cx="58" cy="37" r="1.6" fill="#0F172A" />
          <circle cx="58.5" cy="36.5" r="0.6" fill="#FFFFFF" />

          {/* Nose Definition */}
          <path d="M50 38 V44 L48.5 45.5 H51.5" stroke="#DD6B20" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />

          {/* Realistic Mouth Definition: Natural Speaking Articulation */}
          {isSpeaking ? (
            /* Subtle, realistic talking mouth (modulated gently via CSS speaking-pulse) */
            <g className="speaking-pulse">
              {/* Natural lip contour with gentle slight opening */}
              <ellipse cx="50" cy="52" rx="3.5" ry="1.8" fill="#742A2A" />
              <path d="M47 51.2 C48.5 50.8 51.5 50.8 53 51.2" stroke="#9B2C2C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M47.2 52.8 C48.8 53.4 51.2 53.4 52.8 52.8" stroke="#9B2C2C" strokeWidth="1.1" strokeLinecap="round" fill="none" />
              {/* Subtle upper teeth hint */}
              <path d="M48.2 51.4 H51.8" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
            </g>
          ) : (
            /* Resting Natural Mouth */
            <g>
              <path d="M46.5 51.8 C48 52.6 52 52.6 53.5 51.8" stroke="#9C4221" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M48 53.2 C49.2 53.8 50.8 53.8 52 53.2" stroke="#C05621" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />
            </g>
          )}

          {/* Air Traffic Controller Professional Aviation Headset */}
          <path d="M29 38 C29 24 38 17 50 17 C62 17 71 24 71 38" stroke="#334155" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <ellipse cx="29" cy="40" rx="3.5" ry="5.5" fill="#1E293B" stroke="#10B981" strokeWidth="1.2" />
          <ellipse cx="71" cy="40" rx="3.5" ry="5.5" fill="#1E293B" stroke="#10B981" strokeWidth="1.2" />
          
          {/* Headset Microphone Boom Arm curving towards mouth */}
          <path d="M29 42 L36 50 L45 50.5" stroke="#1E293B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="50.5" r="1.8" fill="#10B981" />
        </svg>
      </div>

      {/* Speaking / Audio Equalizer Indicator */}
      {showEqualizer && isSpeaking && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
          <span style={{ width: 3, height: 8, background: '#10B981', borderRadius: 2, animation: 'audioBar1 0.4s ease-in-out infinite alternate' }} />
          <span style={{ width: 3, height: 14, background: '#10B981', borderRadius: 2, animation: 'audioBar2 0.35s ease-in-out infinite alternate' }} />
          <span style={{ width: 3, height: 10, background: '#10B981', borderRadius: 2, animation: 'audioBar1 0.45s ease-in-out infinite alternate' }} />
          <span style={{ width: 3, height: 16, background: '#10B981', borderRadius: 2, animation: 'audioBar2 0.3s ease-in-out infinite alternate' }} />
          <span style={{ width: 3, height: 7, background: '#10B981', borderRadius: 2, animation: 'audioBar1 0.5s ease-in-out infinite alternate' }} />
        </div>
      )}

      {/* Status Label */}
      {label && (
        <span style={{ fontSize: 11, fontWeight: 600, color: isSpeaking ? '#10B981' : '#94A3B8', letterSpacing: 0.2 }}>
          {label}
        </span>
      )}
    </div>
  );
};
