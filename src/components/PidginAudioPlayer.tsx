import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Copy, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PidginAudioPlayerProps {
  script: string;
  cropName?: string;
  pathologyName?: string | null;
}

// Fallback hierarchy for authentic African/Nigerian voice selection
const selectPreferredVoice = (availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!availableVoices || availableVoices.length === 0) return null;

  // 1. Voice with lang === 'en-NG'
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

  // 4. Any female English voice
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
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);

  // Split script into manageable sentences for visual cadence tracking
  const sentences = React.useMemo(() => {
    if (!script) return [];
    return script
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [script]);

  // Load speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
        const preferred = selectPreferredVoice(available);
        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop playback when component unmounts or script changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [script]);

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('Text-to-speech is not supported by your browser. Please read the transcript below.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
      return;
    }

    window.speechSynthesis.cancel();
    setAudioError(null);

    const utterance = new SpeechSynthesisUtterance(script);
    utteranceRef.current = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentSentenceIndex(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback note:', e);
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        setAudioError('Audio playback was interrupted. You can read the written Pidgin transcript below.');
      }
    };

    // Estimate sentence progression for visual karaoke highlighting
    const avgCharsPerSec = 14 * speechRate;
    let accumulatedTime = 0;
    sentences.forEach((sentence, idx) => {
      const sentenceDurationMs = (sentence.length / avgCharsPerSec) * 1000;
      setTimeout(() => {
        if (utteranceRef.current && window.speechSynthesis.speaking) {
          setCurrentSentenceIndex(idx);
        }
      }, accumulatedTime);
      accumulatedTime += sentenceDurationMs;
    });

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err: unknown) {
      console.error('TTS execution error:', err);
      setIsPlaying(false);
      setAudioError('Unable to synthesize speech. Please read the written Pidgin transcript below.');
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
    <div
      id="pidgin-audio-player-card"
      className="bg-[#181816]/80 backdrop-blur-md border border-[#2D2D2A]/60 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden text-white"
    >
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#2D2D2A]">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Pidgin Audio Script (Field Guide)
              </h3>
              <Badge variant="outline" className="text-xs py-0.5 bg-amber-500/15 text-amber-300 border-amber-500/30">
                Spoken Voice
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#A3A19B] mt-0.5 font-normal">
              Direct spoken instructions formulated in Nigerian Pidgin for rural field hands
            </p>
          </div>
        </div>

        {/* Action button: Copy script */}
        <Button
          id="btn-copy-pidgin-script"
          type="button"
          variant="outline"
          size="default"
          onClick={handleCopyScript}
          className="min-h-[48px] text-sm sm:text-base font-bold text-white bg-[#141412] hover:bg-[#20201D] border-[#2D2D2A] rounded-2xl cursor-pointer"
          title="Copy Pidgin speech script to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-amber-400 mr-1.5" /> : <Copy className="w-4 h-4 text-amber-400 mr-1.5" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
        </Button>
      </div>

      {/* Audio Playback Controls */}
      <div className="mt-5 flex items-center justify-between flex-wrap gap-4 bg-[#141412] rounded-2xl p-4 border border-[#2D2D2A]">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            id="btn-toggle-speech-play"
            type="button"
            variant="default"
            onClick={handleTogglePlay}
            className="gap-2.5 px-6 py-3 min-h-[48px] text-base font-black bg-[#D97706] text-white hover:bg-[#B45309] shadow-[0_0_20px_rgba(217,119,6,0.4)] active:scale-95 rounded-2xl cursor-pointer"
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
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleRestart}
              className="min-h-[48px] min-w-[48px] rounded-2xl border border-[#2D2D2A] bg-[#22221F] text-white hover:bg-[#2A2A26] cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </Button>
          )}

          {/* Animated visualizer waves when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse" />
              <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-3 bg-amber-300 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1.5 h-7 bg-amber-500 rounded-full animate-pulse [animation-delay:75ms]" />
              <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-pulse [animation-delay:225ms]" />
            </div>
          )}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2.5 text-sm">
          <span className="text-[#A3A19B] font-bold text-xs uppercase tracking-wider">Speed:</span>
          <div className="inline-flex rounded-xl bg-[#22221F] p-1 border border-[#2D2D2A]">
            {[0.8, 0.88, 1.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  setSpeechRate(rate);
                  if (isPlaying) {
                    handleRestart();
                  }
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all font-bold text-xs sm:text-sm cursor-pointer ${
                  speechRate === rate
                    ? 'bg-[#D97706] text-white shadow-md font-black'
                    : 'text-[#A3A19B] hover:text-white hover:bg-white/5'
                }`}
              >
                {rate === 0.8 ? 'Slow (0.8x)' : rate === 0.88 ? 'Field Cadence (0.88x)' : 'Normal (1x)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual fallback alert if audio synthesis fails */}
      {audioError && (
        <div className="mt-4 bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 text-xs sm:text-sm text-amber-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <p>
              <strong className="text-white font-semibold">Audio notice: </strong>
              {audioError}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAudioError(null)}
            className="text-amber-400 hover:text-white font-bold text-xs uppercase tracking-wider shrink-0 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Spoken Text Script with active sentence highlighting */}
      <div className="mt-4 bg-[#121211] rounded-2xl p-5 border border-[#2D2D2A] max-h-60 overflow-y-auto leading-relaxed text-base">
        <p className="text-[#E6E4DD]">
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`transition-colors duration-200 inline ${
                currentSentenceIndex === idx
                  ? 'bg-amber-500/30 text-white font-semibold px-1 rounded'
                  : 'text-[#E6E4DD]'
              }`}
            >
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-[#A3A19B]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Native Nigerian Pidgin translation tuned for rural smallholders
        </span>
        {cropName && (
          <span className="font-bold text-amber-400">
            Target Crop: {cropName}
          </span>
        )}
      </div>
    </div>
  );
};
