import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosisResultView } from './components/DiagnosisResultView';
import { AgronomyGuide } from './components/AgronomyGuide';
import { LandingPage } from './components/LandingPage';
import { ConnectivityStatus } from './components/ConnectivityStatus';
import { PathologyDiagnosis, WestAfricanCrop, FieldSample } from './types';
import { FIELD_SAMPLES } from './data/fieldSamples';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Camera,
  Layers,
  X,
  Scan,
  ShieldCheck,
  Sprout,
  CloudSun,
  Grid,
  FileText,
} from 'lucide-react';

const LOADING_STAGES = [
  {
    title: 'Checking leaf symptoms...',
    subtitle: 'Looking at spots, coloring, and damage patterns on the plant.',
  },
  {
    title: 'Identifying crop disease...',
    subtitle: 'Matching symptoms with plant health records.',
  },
  {
    title: 'Checking remedy safety...',
    subtitle: 'Finding safe, practical treatments that can be applied quickly.',
  },
  {
    title: 'Building your 24-hour plan...',
    subtitle: 'Organizing steps to save the plant and prevent further spread.',
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'scanner'>('landing');
  const [diagnosis, setDiagnosis] = useState<PathologyDiagnosis | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [lastSelectedParams, setLastSelectedParams] = useState<{
    imageData: string;
    mimeType: string;
    cropHint: WestAfricanCrop;
    location: string;
    fieldNotes: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showPresetsModal, setShowPresetsModal] = useState<boolean>(false);
  const [desktopNavTab, setDesktopNavTab] = useState<'scan' | 'presets' | 'guide'>('scan');

  const abortControllerRef = useRef<AbortController | null>(null);

  // 25-Second Loading State interval and progress ticker
  useEffect(() => {
    let stageInterval: ReturnType<typeof setInterval> | null = null;
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    if (isLoading) {
      setLoadingStage(0);
      setLoadingProgress(5);

      stageInterval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 4800);

      const startTime = Date.now();
      const totalDuration = 24000;
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculated = Math.min(Math.round((elapsed / totalDuration) * 95), 95);
        setLoadingProgress((prev) => Math.max(prev, calculated));
      }, 250);
    } else {
      setLoadingProgress(100);
    }

    return () => {
      if (stageInterval) clearInterval(stageInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading]);

  const handleCancelDiagnosis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setError('Diagnosis cancelled by user.');
  };

  const runLiveDiagnosis = async (
    imageData: string,
    mimeType: string,
    cropHint: WestAfricanCrop,
    location: string,
    fieldNotes: string
  ) => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error(
          'You are currently working in offline mode without internet connectivity. Preset crop samples and offline agronomy guides remain active on your device. Connect to 3G/4G or Wi-Fi to run live cloud diagnosis.'
        );
      }

      const rawApiBase = (
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        ''
      ).trim();
      const configuredApiBase = rawApiBase
        .replace(/^(https?:\/\/)+/, (match) =>
          match.includes('https://') ? 'https://' : 'http://'
        )
        .replace(/\/+$/, '')
        .replace(/\/api\/diagnose\/?$/, '')
        .replace(/\/api\/?$/, '');
      const payloadBody = JSON.stringify({
        image: imageData,
        mimeType: mimeType || 'image/jpeg',
        zone: location || '',
        location: location || '',
        crop: cropHint || 'Auto-detect',
        cropHint: cropHint || 'Auto-detect',
        fieldNotes: fieldNotes || '',
      });

      const targetUrl = configuredApiBase ? `${configuredApiBase}/api/diagnose` : '/api/diagnose';
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadBody,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || `Diagnosis failed with server status ${response.status}`
        );
      }

      const data = await response.json();
      const mappedDiagnosis: PathologyDiagnosis = {
        is_plant: Boolean(data.is_plant),
        crop_identified: data.crop_identified || 'Unknown',
        health_status: (data.health_status as PathologyDiagnosis['health_status']) || 'Unknown',
        pathology_name: data.pathology_name ?? null,
        confidence_score: typeof data.confidence_score === 'number' ? data.confidence_score : 0,
        severity_level: (data.severity_level as PathologyDiagnosis['severity_level']) || 'None',
        observable_symptoms: Array.isArray(data.observable_symptoms) ? data.observable_symptoms : [],
        immediate_containment_step: data.immediate_containment_step ?? data.action_plan_0_2_hours ?? null,
        action_plan_0_2_hours: data.action_plan_0_2_hours ?? data.immediate_containment_step ?? null,
        action_plan_2_6_hours: data.action_plan_2_6_hours ?? data.organic_local_remedy ?? null,
        action_plan_6_24_hours: data.action_plan_6_24_hours ?? null,
        avoid: Array.isArray(data.avoid)
          ? data.avoid
          : typeof data.avoid === 'string'
          ? [data.avoid]
          : null,
        escalation: data.escalation ?? null,
        local_context_used:
          data.local_context_used ??
          (location && !location.toLowerCase().includes('general')
            ? location
            : 'Global agro-ecological guidance applied'),
        is_uncertain: Boolean(data.is_uncertain),
        more_info_needed: data.more_info_needed ?? null,
        organic_local_remedy: data.organic_local_remedy ?? null,
        standard_chemical_treatment: data.standard_chemical_treatment ?? null,
        prevention_future: data.prevention_future ?? null,
        pidgin_audio_script: data.pidgin_audio_script || '',
        needs_clarification: Boolean(data.needs_clarification),
        clarification_question: data.clarification_question ?? null,
        options: Array.isArray(data.options) ? data.options : [],
      };
      setDiagnosis(mappedDiagnosis);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const e = err as Error;
      console.error('Diagnosis request error:', e);
      if (e.name === 'AbortError') {
        setError('Diagnosis request timed out after 25 seconds. Cloud connection is slow; you can retry or consult the offline agronomy guide.');
      } else {
        setError(e.message || 'Failed to analyze crop image. Please check connectivity.');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleImageSelected = (
    imageData: string,
    mimeType: string,
    cropHint: WestAfricanCrop,
    location: string,
    fieldNotes: string,
    samplePreset?: FieldSample['presetDiagnosis']
  ) => {
    setImagePreviewUrl(imageData);
    setLastSelectedParams({ imageData, mimeType, cropHint, location, fieldNotes });

    if (samplePreset) {
      setDiagnosis(samplePreset);
      setError(null);
    } else {
      runLiveDiagnosis(imageData, mimeType, cropHint, location, fieldNotes);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setImagePreviewUrl(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReanalyzeWithAi = () => {
    if (lastSelectedParams) {
      runLiveDiagnosis(
        lastSelectedParams.imageData,
        lastSelectedParams.mimeType,
        lastSelectedParams.cropHint,
        lastSelectedParams.location,
        lastSelectedParams.fieldNotes
      );
    }
  };

  const handleClarificationOptionSelect = (option: string) => {
    if (lastSelectedParams) {
      const updatedNotes = lastSelectedParams.fieldNotes
        ? `${lastSelectedParams.fieldNotes}. Farmer clarification: ${option}`
        : `Farmer clarification: ${option}`;
      const newParams = { ...lastSelectedParams, fieldNotes: updatedNotes };
      setLastSelectedParams(newParams);
      runLiveDiagnosis(
        newParams.imageData,
        newParams.mimeType,
        newParams.cropHint,
        newParams.location,
        newParams.fieldNotes
      );
    }
  };

  const handleStartScanner = () => {
    setActiveView('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPresetFromModal = (sample: FieldSample) => {
    setShowPresetsModal(false);
    handleImageSelected(
      sample.thumbnailUrl,
      'image/jpeg',
      sample.crop,
      sample.localZone,
      `Field sample: ${sample.title} (${sample.category})`,
      sample.presetDiagnosis
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground relative">
      {/* =========================================================================
          FULL-SCREEN LOADING OVERLAY (Calm, Tokenized, Plain Wording)
          ========================================================================= */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Calm Circular Spinner */}
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-6" />

            {/* Rotating Diagnostic Stage Ticker */}
            <div className="max-w-md w-full space-y-2 min-h-[80px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight leading-snug">
                    {LOADING_STAGES[loadingStage]?.title || 'Analyzing image...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {LOADING_STAGES[loadingStage]?.subtitle || 'Please wait while we review the symptoms.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Bar & Cancel */}
            <div className="w-full max-w-xs mt-6 space-y-3">
              <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                <span className="font-semibold text-foreground">Analyzing photo</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                <motion.div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Usually takes 5 to 15 seconds</p>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelDiagnosis}
                  className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW SWITCHER (LANDING VS SCANNER DASHBOARD)
          ========================================================================= */}
      {activeView === 'landing' ? (
        <LandingPage onStart={handleStartScanner} />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          {/* =========================================================================
              DESKTOP VERTICAL SIDEBAR (Eco-Glass & Sage Green)
              ========================================================================= */}
          <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0 h-screen sticky top-0 p-5 space-y-6 z-30 justify-between">
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground tracking-tight">AgriScan</h2>
                  <p className="text-xs text-muted-foreground font-medium">Field Triage</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDesktopNavTab('scan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    desktopNavTab === 'scan'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Scan className="w-5 h-5" />
                  <span>Scan Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDesktopNavTab('presets');
                    setShowPresetsModal(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    desktopNavTab === 'presets'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Layers className="w-5 h-5 text-primary" />
                  <span>Field Samples</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDesktopNavTab('guide');
                    setShowGuideModal(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    desktopNavTab === 'guide'
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>Agronomy Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('landing')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Landing Page</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Bottom: Connectivity Status */}
            <div className="pt-4 border-t border-border">
              <ConnectivityStatus theme="dark" />
            </div>
          </aside>

          {/* =========================================================================
              MAIN CONTENT CONTAINER
              ========================================================================= */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header onOpenGuide={() => setShowGuideModal(true)} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
              {/* Error Message Display */}
              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/15 p-4 text-foreground shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-destructive font-bold text-base">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>Diagnosis Notice</span>
                    </div>
                    {lastSelectedParams && (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleReanalyzeWithAi}
                          className="min-h-[40px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                        >
                          Retry Analysis
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">{error}</p>
                </div>
              )}

              {/* =========================================================================
                  WORKSPACE: MOBILE SWAP VS DESKTOP SPLIT-SCREEN DASHBOARD
                  ========================================================================= */}
              <div className="w-full">
                {/* On large screens (lg:), render split screen dashboard side-by-side */}
                <div className="hidden lg:flex lg:flex-row gap-8 items-start">
                  {/* Left 40%: Pinned ImageUploader Workspace */}
                  <div className="w-[42%] max-w-lg shrink-0 sticky top-20 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs uppercase tracking-widest font-bold text-primary flex items-center gap-1.5">
                        <Camera className="w-4 h-4" /> Specimen Capture
                      </span>
                      {diagnosis && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="text-xs text-primary hover:underline font-bold cursor-pointer"
                        >
                          Clear &amp; New Scan
                        </button>
                      )}
                    </div>

                    <ImageUploader
                      onImageSelected={handleImageSelected}
                      isLoading={isLoading}
                    />
                  </div>

                  {/* Right 60%: Diagnosis Report or Awaiting State */}
                  <div className="flex-1 w-full space-y-6">
                    <AnimatePresence mode="wait">
                      {diagnosis ? (
                        <motion.div
                          key="desktop-diagnosis"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-xs uppercase tracking-widest font-bold text-primary flex items-center gap-1.5">
                              <FileText className="w-4 h-4" /> 24-Hour Diagnostic Report
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={handleReanalyzeWithAi}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                              <span>Re-analyze</span>
                            </motion.button>
                          </div>

                          <DiagnosisResultView
                            diagnosis={diagnosis}
                            imagePreviewUrl={imagePreviewUrl || undefined}
                            onReset={handleReset}
                            onSelectOption={handleClarificationOptionSelect}
                          />
                        </motion.div>
                      ) : (
                        /* Desktop Idle State: Ready to Scan Dashboard */
                        <motion.div
                          key="desktop-awaiting"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl p-8 bg-card border border-border shadow-sm text-center space-y-6"
                        >
                          <div className="w-14 h-14 rounded-xl bg-secondary border border-border text-primary flex items-center justify-center mx-auto">
                            <Scan className="w-7 h-7" />
                          </div>

                          <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-2xl font-serif font-bold text-foreground">
                              Diagnostic Workspace Ready
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Use the camera viewfinder on the left or select a sample photo below to test instant AI diagnosis.
                            </p>
                          </div>

                          {/* Quick Preset Selector Tiles on Desktop */}
                          <div className="pt-4 border-t border-border text-left">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-foreground mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              Field Sample Presets:
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {FIELD_SAMPLES.slice(0, 3).map((sample) => (
                                <motion.button
                                  key={sample.id}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleSelectPresetFromModal(sample)}
                                  className="p-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border transition-colors text-left group cursor-pointer"
                                >
                                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-background mb-2 border border-border">
                                    <img
                                      src={sample.thumbnailUrl}
                                      alt={sample.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-primary block truncate">
                                    {sample.crop}
                                  </span>
                                  <p className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">
                                    {sample.title}
                                  </p>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* On mobile screens (< lg), render animated screen swap */}
                <div className="lg:hidden">
                  <AnimatePresence mode="wait">
                    {diagnosis ? (
                      <motion.div
                        key="mobile-diagnosis"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className="min-h-[48px] px-4 py-2 text-sm font-semibold text-foreground hover:text-primary rounded-xl bg-secondary border border-border cursor-pointer"
                          >
                            ← Upload or take another photo
                          </motion.button>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReanalyzeWithAi}
                            disabled={isLoading}
                            className="min-h-[48px] px-4 py-2 text-sm font-semibold text-primary rounded-xl bg-secondary border border-border flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Re-analyze</span>
                          </motion.button>
                        </div>

                        <DiagnosisResultView
                          diagnosis={diagnosis}
                          imagePreviewUrl={imagePreviewUrl || undefined}
                          onReset={handleReset}
                          onSelectOption={handleClarificationOptionSelect}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mobile-uploader"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <ImageUploader
                          onImageSelected={handleImageSelected}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </main>
          </div>

          {/* =========================================================================
              FLOATING MOBILE BOTTOM NAVIGATION
              ========================================================================= */}
          <div className="fixed bottom-6 left-4 right-4 z-40 rounded-2xl bg-card/95 backdrop-blur-md border border-border p-2 flex justify-around items-center md:hidden shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {/* Target 1: Fields / Samples */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowPresetsModal(true)}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Grid className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold">Samples</span>
            </motion.button>

            {/* Target 2: Shutter/Scan */}
            <motion.button
              id="btn-floating-shutter"
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (diagnosis) {
                  handleReset();
                } else {
                  const snapBtn = document.getElementById('btn-shutter-snap') as HTMLButtonElement | null;
                  if (snapBtn) {
                    snapBtn.click();
                  } else {
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }
                }
              }}
              className="-mt-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-2 border-background shadow-md flex items-center justify-center cursor-pointer transition-transform"
              title={diagnosis ? 'Start New Scan' : 'Trigger Camera Shutter'}
            >
              {diagnosis ? <Camera className="w-6 h-6" /> : <Scan className="w-6 h-6" />}
            </motion.button>

            {/* Target 3: Guide */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowGuideModal(true)}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold">Guide</span>
            </motion.button>
          </div>

          {/* =========================================================================
              MODAL 1: FIELD SPECIMEN PRESETS
              ========================================================================= */}
          <AnimatePresence>
            {showPresetsModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
                onClick={() => setShowPresetsModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  className="bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">Field Sample Presets</h3>
                        <p className="text-xs text-muted-foreground">Sample crop photos for testing</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPresetsModal(false)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {FIELD_SAMPLES.map((sample) => (
                      <motion.button
                        key={sample.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectPresetFromModal(sample)}
                        className="text-left p-3.5 rounded-xl bg-secondary/60 border border-border hover:border-primary flex items-center gap-3 group transition-colors cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-background shrink-0 border border-border">
                          <img
                            src={sample.thumbnailUrl}
                            alt={sample.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2 mb-1">
                            {sample.crop} • {sample.category}
                          </Badge>
                          <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {sample.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{sample.localZone}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MODAL 2: AGRONOMY REFERENCE MODAL
              ========================================================================= */}
          <AnimatePresence>
            {showGuideModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
                onClick={() => setShowGuideModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  className="bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto space-y-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">Agronomy Guide</h3>
                        <p className="text-xs text-muted-foreground">Crop pathology references and biological remedies</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(false)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="pt-2">
                    <AgronomyGuide />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
