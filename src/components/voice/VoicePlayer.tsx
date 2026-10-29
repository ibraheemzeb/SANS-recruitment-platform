import React, { useState, useEffect } from 'react';
import { voiceManager } from '../../utils/speechSynthesis';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakingAvatar } from './SpeakingAvatar';

interface VoicePlayerProps {
  speakerName: string;
  questionText: string;
  responseText: string;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  speakerName,
  questionText,
  responseText,
  onPlaybackStateChange
}) => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeechType, setActiveSpeechType] = useState<'question' | 'response' | null>(null);

  useEffect(() => {
    return () => {
      voiceManager.stop();
    };
  }, []);

  const handlePlaySpeech = (type: 'question' | 'response') => {
    if (isPlaying && activeSpeechType === type) {
      voiceManager.stop();
      setIsPlaying(false);
      setActiveSpeechType(null);
      if (onPlaybackStateChange) onPlaybackStateChange(false);
      return;
    }

    const textToSpeak = type === 'question' ? questionText : responseText;
    setActiveSpeechType(type);
    setIsPlaying(true);
    if (onPlaybackStateChange) onPlaybackStateChange(true);

    voiceManager.speak({
      text: textToSpeak,
      lang: language,
      onStart: () => {
        setIsPlaying(true);
        if (onPlaybackStateChange) onPlaybackStateChange(true);
      },
      onEnd: () => {
        setIsPlaying(false);
        setActiveSpeechType(null);
        if (onPlaybackStateChange) onPlaybackStateChange(false);
      },
      onError: () => {
        setIsPlaying(false);
        setActiveSpeechType(null);
        if (onPlaybackStateChange) onPlaybackStateChange(false);
      }
    });
  };

  const handleStop = () => {
    voiceManager.stop();
    setIsPlaying(false);
    setActiveSpeechType(null);
    if (onPlaybackStateChange) onPlaybackStateChange(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 2D Animated Speaking Avatar */}
      <SpeakingAvatar 
        isSpeaking={isPlaying} 
        avatarType={activeSpeechType === 'response' ? 'candidate' : 'interviewer'}
        label={
          activeSpeechType === 'response' 
            ? `${speakerName} (Candidate Speaking)` 
            : activeSpeechType === 'question' 
              ? 'SANS AI Virtual Interviewer' 
              : 'Voice Ready (Click Play below)'
        }
      />

      {/* Audio Controls Bar */}
      <div className="voice-controls-bar">
        <button 
          className={`btn btn-sm ${isPlaying && activeSpeechType === 'question' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handlePlaySpeech('question')}
        >
          {isPlaying && activeSpeechType === 'question' ? '⏹ Stop Question' : '▶ Speak Question (AI Voice)'}
        </button>

        <button 
          className={`btn btn-sm ${isPlaying && activeSpeechType === 'response' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handlePlaySpeech('response')}
        >
          {isPlaying && activeSpeechType === 'response' ? '⏹ Stop Response' : '▶ Play Candidate Voice'}
        </button>

        {isPlaying && (
          <button className="btn btn-sm btn-outline" onClick={handleStop}>
            Reset Voice
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)' }}>
          {language === 'ar' ? 'صوت طبيعي فوري (Web Speech)' : 'Natural Voice Audio (Web Speech)'}
        </div>
      </div>

      {/* Transcript with highlighting */}
      <div className="transcript-display">
        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)', marginBottom: 4 }}>
          {language === 'ar' ? 'نص السؤال المطروح:' : 'Question Prompt:'}
        </div>
        <p style={{ marginBottom: 10, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          {questionText}
        </p>

        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)', marginBottom: 4 }}>
          {language === 'ar' ? `إجابة المرشح الصوتية المكتوبة (${speakerName}):` : `Candidate Verbatim Response (${speakerName}):`}
        </div>
        <p style={{ lineHeight: 1.6 }}>
          "{responseText}"
        </p>
      </div>
    </div>
  );
};
