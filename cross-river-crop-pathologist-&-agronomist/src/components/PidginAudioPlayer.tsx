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

export const PidginAudioPlayer: React.FC<PidginAudioPlayerProps> = ({
  script,
  cropName,
  pathologyName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9); // Slightly slower for clear rural field comprehension
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

  // Load browser speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Prioritize English voices, preferably African or British English (familiar in Nigeria)
        const preferredVoice =
          availableVoices.find(
            (v) =>
              v.lang.toLowerCase().includes('en-ng') ||
              v.lang.toLowerCase().includes('en-za') ||
              v.lang.toLowerCase().includes('en-gh')
          ) ||
          availableVoices.find((v) => v.lang.toLowerCase().includes('en-gb')) ||
          availableVoices.find((v) => v.lang.toLowerCase().includes('en'));

        if (preferredVoice) {
          setSelectedVoice(preferredVoice);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
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
      className="bg-muted border-border rounded-[24px] p-5 md:p-6 shadow-sm relative overflow-hidden"
    >
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0 shadow-sm">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-base font-bold text-primary"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Pidgin Audio Script (Field Guide)
              </h3>
              <Badge variant="default" className="text-[10px] py-0.5">
                Spoken Voice
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct spoken instructions formulated in Nigerian Pidgin for rural field hands
            </p>
          </div>
        </div>

        {/* Action button: Copy script */}
        <Button
          id="btn-copy-pidgin-script"
          variant="outline"
          size="sm"
          onClick={handleCopyScript}
          className="text-xs font-medium text-foreground/80 bg-background hover:bg-secondary border-border"
          title="Copy Pidgin speech script to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary mr-1" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground mr-1" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
        </Button>
      </div>

      {/* Audio Playback Controls */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-4 bg-background rounded-2xl p-3.5 border border-border">
        <div className="flex items-center gap-3">
          <Button
            id="btn-toggle-speech-play"
            variant="accent"
            onClick={handleTogglePlay}
            className="gap-2 px-5 py-2.5 text-xs font-bold shadow-sm active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Spoken Pidgin</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
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
              className="p-2.5 rounded-xl border-border"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {/* Animated visualizer waves when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1 pl-2">
              <span className="w-1 h-3 bg-accent rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-primary rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-2 bg-accent rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-6 bg-primary rounded-full animate-pulse [animation-delay:75ms]" />
              <span className="w-1 h-4 bg-accent rounded-full animate-pulse [animation-delay:225ms]" />
            </div>
          )}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">Speed:</span>
          <div className="inline-flex rounded-xl bg-secondary p-0.5 border border-border">
            {[0.8, 0.9, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setSpeechRate(rate);
                  if (isPlaying) {
                    handleRestart();
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold text-xs ${
                  speechRate === rate
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {rate === 0.8 ? 'Slow (0.8x)' : rate === 0.9 ? 'Field (0.9x)' : 'Normal (1x)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spoken Text Script with active sentence highlighting */}
      <div className="mt-4 bg-background rounded-2xl p-4.5 border border-border max-h-56 overflow-y-auto leading-relaxed text-sm">
        <p className="font-serif italic text-foreground/80">
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`transition-colors duration-200 inline ${
                currentSentenceIndex === idx
                  ? 'bg-accent/25 text-foreground font-medium px-1 rounded not-italic'
                  : 'text-foreground/80'
              }`}
            >
              {sentence}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent" />
          Native Nigerian Pidgin translation tuned for rural smallholders
        </span>
        {cropName && (
          <span className="font-semibold text-primary">
            Target Crop: {cropName}
          </span>
        )}
      </div>
    </Card>
  );
};
