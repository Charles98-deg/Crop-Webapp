import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Copy, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PidginAudioPlayerProps {
  script: string;
  cropName?: string;
  pathologyName?: string | null;
}

// Fallback hierarchy for authentic African/Nigerian female voice selection
const selectPreferredVoice = (availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!availableVoices || availableVoices.length === 0) return null;

  // 1. Voice with lang === 'en-NG' or language starting with 'en-NG'
  const nigerianLangVoice = availableVoices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang === 'en-ng' || lang.startsWith('en-ng');
  });
  if (nigerianLangVoice) return nigerianLangVoice;

  // 2. Voice name containing "Nigeria", "Yoruba", "Igbo", or "Hausa"
  const nigerianKeywords = ['nigeria', 'yoruba', 'igbo', 'hausa'];
  const nigerianNameVoice = availableVoices.find((v) => {
    const name = (v.name || '').toLowerCase();
    return nigerianKeywords.some((keyword) => name.includes(keyword));
  });
  if (nigerianNameVoice) return nigerianNameVoice;

  // 3. Voice with lang === 'en-GH' (Ghana) or en-ZA (South Africa)
  const africanRegionalVoice = availableVoices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang === 'en-gh' || lang.startsWith('en-gh') || lang === 'en-za' || lang.startsWith('en-za');
  });
  if (africanRegionalVoice) return africanRegionalVoice;

  // 4. Any female English voice (name includes "Female", "Samantha", "Victoria", "Karen", "Zira", or "Google UK English Female")
  const femaleKeywords = ['female', 'samantha', 'victoria', 'karen', 'zira', 'google uk english female'];
  const femaleEnglishVoice = availableVoices.find((v) => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    const isEnglish = lang.startsWith('en');
    const isFemaleName = femaleKeywords.some((keyword) => name.includes(keyword));
    return isEnglish && isFemaleName;
  });
  if (femaleEnglishVoice) return femaleEnglishVoice;

  // Generic fallback: British/English or first available voice
  return (
    availableVoices.find((v) => (v.lang || '').toLowerCase().startsWith('en-gb')) ||
    availableVoices.find((v) => (v.lang || '').toLowerCase().startsWith('en')) ||
    availableVoices[0] ||
    null
  );
};

export const PidginAudioPlayer: React.FC<PidginAudioPlayerProps> = ({
  script,
  cropName,
  pathologyName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.88); // Clear, measured field cadence for Pidgin pronunciation
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);

  // Split script into sentences for highlighting during playback
  const sentences = React.useMemo(() => {
    return script
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [script]);

  // Load browser speech synthesis voices and listen for voiceschanged event
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
          const preferred = selectPreferredVoice(availableVoices);
          if (preferred) {
            setSelectedVoice(preferred);
          }
        }
      }
    };

    updateVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop playback if script changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
    }
  }, [script]);

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser device.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
    } else {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(script);
      // Configured speech properties for clear Nigerian Pidgin field cadence
      utterance.lang = 'en-NG';
      utterance.pitch = 1.1; // natural female pitch
      utterance.rate = speechRate; // clear, measured field cadence (0.88 default)

      const activeVoice =
        selectedVoice ||
        selectPreferredVoice(voices.length > 0 ? voices : window.speechSynthesis.getVoices());
      if (activeVoice) {
        utterance.voice = activeVoice;
      }

      utterance.onboundary = (event) => {
        if (event.name === 'sentence' || event.charIndex !== undefined) {
          // Estimate sentence position based on charIndex
          const textUpToChar = script.substring(0, event.charIndex);
          const sentenceCount = (textUpToChar.match(/[.!?]\s+/g) || []).length;
          setCurrentSentenceIndex(Math.min(sentenceCount, sentences.length - 1));
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentSentenceIndex(-1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentSentenceIndex(-1);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setCurrentSentenceIndex(0);
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        handleTogglePlay();
      }, 100);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Card
      id="pidgin-audio-player-card"
      className="bg-[#0D1C13]/85 backdrop-blur-md border border-emerald-500/30 rounded-[28px] p-5 sm:p-7 shadow-xl relative overflow-hidden text-white"
    >
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-emerald-500/20">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#22C55E] shrink-0 shadow-inner">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-base sm:text-lg font-bold text-white"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Pidgin Audio Script (Field Guide)
              </h3>
              <Badge variant="default" className="text-xs py-0.5">
                Spoken Voice
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-normal">
              Direct spoken instructions formulated in Nigerian Pidgin for rural field hands
            </p>
          </div>
        </div>

        {/* Action button: Copy script */}
        <Button
          id="btn-copy-pidgin-script"
          variant="outline"
          size="default"
          onClick={handleCopyScript}
          className="min-h-[48px] text-sm sm:text-base font-bold text-white bg-[#0A160F] hover:bg-[#10281A] border-emerald-500/40"
          title="Copy Pidgin speech script to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-[#22C55E] mr-1.5" /> : <Copy className="w-4 h-4 text-emerald-400 mr-1.5" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
        </Button>
      </div>

      {/* Audio Playback Controls */}
      <div className="mt-5 flex items-center justify-between flex-wrap gap-4 bg-[#0A160F] rounded-2xl p-4 border border-emerald-500/30">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            id="btn-toggle-speech-play"
            variant="default"
            onClick={handleTogglePlay}
            className="gap-2.5 px-6 py-3 min-h-[48px] text-base font-black bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A] shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 rounded-xl"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Spoken Pidgin</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Listen to Pidgin Audio</span>
              </>
            )}
          </Button>

          {isPlaying && (
            <Button
              id="btn-restart-speech"
              variant="secondary"
              size="icon"
              onClick={handleRestart}
              className="min-h-[48px] min-w-[48px] rounded-xl border border-emerald-500/40 bg-[#11261A] text-white"
              title="Restart from beginning"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </Button>
          )}

          {/* Animated visualizer waves when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <span className="w-1.5 h-4 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-3 bg-lime-400 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1.5 h-7 bg-[#22C55E] rounded-full animate-pulse [animation-delay:75ms]" />
              <span className="w-1.5 h-4 bg-emerald-300 rounded-full animate-pulse [animation-delay:225ms]" />
            </div>
          )}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2.5 text-sm">
          <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">Speed:</span>
          <div className="inline-flex rounded-xl bg-[#11261A] p-1 border border-emerald-500/30">
            {[0.8, 0.88, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setSpeechRate(rate);
                  if (isPlaying) {
                    handleRestart();
                  }
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all font-bold text-xs sm:text-sm cursor-pointer ${
                  speechRate === rate
                    ? 'bg-[#22C55E] text-[#060D09] shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {rate === 0.8 ? 'Slow (0.8x)' : rate === 0.88 ? 'Field Cadence (0.88x)' : 'Normal (1x)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spoken Text Script with active sentence highlighting */}
      <div className="mt-4 bg-[#0A160F] rounded-2xl p-5 border border-emerald-500/30 max-h-60 overflow-y-auto leading-relaxed text-base">
        <p className="font-serif italic text-slate-100">
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`transition-colors duration-200 inline ${
                currentSentenceIndex === idx
                  ? 'bg-[#22C55E]/30 text-white font-semibold px-1 rounded not-italic'
                  : 'text-slate-200'
              }`}
            >
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          Native Nigerian Pidgin translation tuned for rural smallholders
        </span>
        {cropName && (
          <span className="font-bold text-[#22C55E]">
            Target Crop: {cropName}
          </span>
        )}
      </div>
    </Card>
  );
};
