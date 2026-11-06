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
      className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden text-foreground"
    >
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">
                Pidgin Audio Field Guide
              </h3>
              <Badge variant="outline" className="text-xs py-0.5">
                Spoken Voice
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
              Direct spoken instructions in Nigerian Pidgin for rural field hands
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
          className="min-h-[48px] text-sm sm:text-base font-bold text-foreground bg-secondary hover:bg-secondary/80 border-border rounded-xl cursor-pointer"
          title="Copy Pidgin speech script to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-primary mr-1.5" /> : <Copy className="w-4 h-4 text-primary mr-1.5" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
        </Button>
      </div>

      {/* Audio Playback Controls */}
      <div className="mt-5 flex items-center justify-between flex-wrap gap-4 bg-secondary/60 rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            id="btn-toggle-speech-play"
            type="button"
            variant="default"
            onClick={handleTogglePlay}
            className="gap-2.5 px-6 py-3 min-h-[48px] text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 rounded-xl cursor-pointer"
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
              className="min-h-[48px] min-w-[48px] rounded-xl border border-border bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-5 h-5 text-foreground" />
            </Button>
          )}

          {/* Visualizer bars when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2" aria-hidden="true">
              <span className="w-1.5 h-3 bg-primary rounded-full" />
              <span className="w-1.5 h-5 bg-primary/80 rounded-full" />
              <span className="w-1.5 h-2 bg-primary/60 rounded-full" />
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              <span className="w-1.5 h-4 bg-primary/80 rounded-full" />
            </div>
          )}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2.5 text-sm">
          <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Speed:</span>
          <div className="inline-flex rounded-xl bg-secondary p-1 border border-border">
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
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {rate === 0.8 ? 'Slow (0.8x)' : rate === 0.88 ? 'Field (0.88x)' : 'Normal (1x)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual fallback alert if audio synthesis fails */}
      {audioError && (
        <div className="mt-4 bg-warning/15 border border-warning/30 rounded-xl p-4 text-xs sm:text-sm text-foreground flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
            <p>
              <strong className="font-semibold text-foreground">Audio notice: </strong>
              {audioError}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAudioError(null)}
            className="text-warning hover:underline font-bold text-xs uppercase tracking-wider shrink-0 px-2 py-1 rounded-md cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Spoken Text Script with active sentence highlighting */}
      <div className="mt-4 bg-background rounded-xl p-4 border border-border max-h-60 overflow-y-auto leading-relaxed text-sm">
        <p className="text-foreground">
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`transition-colors duration-200 inline ${
                currentSentenceIndex === idx
                  ? 'bg-primary/20 text-foreground font-semibold px-1 rounded'
                  : 'text-foreground'
              }`}
            >
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Native Nigerian Pidgin translation tuned for rural smallholders
        </span>
        {cropName && (
          <span className="font-bold text-primary">
            Target Crop: {cropName}
          </span>
        )}
      </div>
    </div>
  );
};
