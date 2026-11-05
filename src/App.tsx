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
    title: 'Analyzing leaf tissue & cellular structure...',
    subtitle: 'Extracting pigment dispersion, leaf venation, and necrotic lesion morphology.',
  },
  {
    title: 'Scanning pathology index against global agricultural registries...',
    subtitle: 'Cross-referencing IITA, FAO, and international crop disease pathology databases.',
  },
  {
    title: 'Cross-referencing international safety protocols & IFC standards...',
    subtitle: 'Enforcing environmental compliance: verifying zero prohibited agrochemicals.',
  },
  {
    title: 'Synthesizing 24-hour emergency containment & biological remedies...',
    subtitle: 'Formulating step-by-step triage using integrated pest management and approved inputs.',
  },
  {
    title: 'Verifying Global Phytosanitary & ESG Compliance Index...',
    subtitle: 'Generating certified agronomic diagnosis and immediate field response protocol.',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative">
      {/* =========================================================================
          FULL-SCREEN 25-SECOND LOADING OVERLAY (Eco-Glass & Emerald)
          ========================================================================= */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Concentric Pulsing Radar Scanner (Emerald & Glass) */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-8">
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-500/15"
                animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-emerald-500/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
              />
              <div className="absolute inset-8 rounded-full border border-white/10" />

              {/* Rotating Radar Sweep Line */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(16, 185, 129, 0.45) 0deg, transparent 75deg, transparent 360deg)',
                }}
              />

              {/* Glowing Emerald Core */}
              <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.65)] text-slate-950">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            {/* Rotating Diagnostic Stage Ticker */}
            <div className="max-w-md w-full space-y-2 min-h-[96px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                    {LOADING_STAGES[loadingStage].title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {LOADING_STAGES[loadingStage].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 25-Second SLA Progress Bar & Cancel */}
            <div className="w-full max-w-xs mt-6 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                <span className="text-emerald-400 font-bold uppercase tracking-wider">AI AGRI-DIAGNOSTIC SLA</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Max 25s Response Target • Global Diagnostic Node</p>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelDiagnosis}
                  className="text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl cursor-pointer"
                >
                  Cancel Analysis
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
          <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl shrink-0 h-screen sticky top-0 p-5 space-y-6 z-30 justify-between">
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">AgriScan</h2>
                  <p className="text-xs text-emerald-400 font-semibold">Enterprise Hub</p>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    desktopNavTab === 'scan'
                      ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    desktopNavTab === 'presets'
                      ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Field Presets</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDesktopNavTab('guide');
                    setShowGuideModal(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    desktopNavTab === 'guide'
                      ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Agronomy Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('landing')}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Landing Page</span>
                </button>
              </nav>

              {/* Environmental Context Widget */}
              <div className="p-4 rounded-3xl bg-emerald-950/20 border border-white/10 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4" /> Global Telemetry
                  </span>
                  <span className="text-xs text-slate-400">Station Active</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">24°C</span>
                  <span className="text-xs text-slate-300">Clean / Optimal</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1 border-t border-white/10">
                  <div>
                    <span className="text-slate-400/70 block">Humidity</span>
                    <span className="font-bold text-white">65%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70 block">Precipitation</span>
                    <span className="font-bold text-white">0 mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Bottom: Connectivity Status */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <ConnectivityStatus theme="dark" />
              <p className="text-xs text-slate-400 font-mono">NODE: GLOBAL-ENTERPRISE-01</p>
            </div>
          </aside>

          {/* =========================================================================
              MAIN CONTENT CONTAINER (SPLIT-SCREEN ON lg: SCREENS)
              ========================================================================= */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header onOpenGuide={() => setShowGuideModal(true)} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
              {/* Operational Rules Banner */}
              <div className="rounded-3xl border border-white/10 bg-emerald-950/20 p-4 sm:p-5 text-white backdrop-blur-2xl shadow-lg flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      Global Plant Pathology AI Operational Rules Active
                    </h3>
                    <Badge variant="outline" className="self-start sm:self-auto text-xs font-bold py-0.5 px-3 bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                      Enterprise Certified
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    1. Verification first (is_plant check) • 2. Integrated biological &amp; cultural remedies • 3. Strict prohibited agrochemicals guardrail (No Paraquat, Lindane, DDVP) • 4. Rapid 24-hour containment triage.
                  </p>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="rounded-3xl border border-rose-500/40 bg-rose-950/40 p-5 text-white backdrop-blur-xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-rose-300 font-bold text-base">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>Diagnostic Analysis Notice</span>
                    </div>
                    {lastSelectedParams && (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleReanalyzeWithAi}
                          className="min-h-[40px] text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl"
                        >
                          Retry Analysis
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-rose-100/90">{error}</p>
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
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1.5">
                        <Camera className="w-4 h-4" /> Specimen Capture &amp; Ingest
                      </span>
                      {diagnosis && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
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
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="text-xs uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1.5">
                              <FileText className="w-4 h-4" /> 24-Hour Diagnostic Report
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={handleReanalyzeWithAi}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-all cursor-pointer"
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
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl p-8 bg-emerald-900/10 backdrop-blur-2xl border border-white/10 shadow-xl text-center space-y-6"
                        >
                          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Scan className="w-8 h-8" />
                          </div>

                          <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-2xl font-extrabold text-white">
                              Diagnostic Workspace Ready
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              Use the Camera Viewfinder on the left or select a verified enterprise pathology specimen below to test instant AI diagnosis.
                            </p>
                          </div>

                          {/* Quick Preset Selector Tiles on Desktop */}
                          <div className="pt-4 border-t border-white/10 text-left">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              Quick-Test Presets (Enterprise Showcase):
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {FIELD_SAMPLES.slice(0, 3).map((sample) => (
                                <motion.button
                                  key={sample.id}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleSelectPresetFromModal(sample)}
                                  className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 transition-all text-left group cursor-pointer"
                                >
                                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/70 mb-2 border border-white/10">
                                    <img
                                      src={sample.thumbnailUrl}
                                      alt={sample.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-emerald-400 block truncate">
                                    {sample.crop}
                                  </span>
                                  <p className="text-xs font-semibold text-white line-clamp-1 mt-0.5">
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
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className="min-h-[44px] px-4 py-2 text-sm font-bold text-white hover:text-emerald-300 rounded-2xl bg-slate-900/80 border border-white/10 cursor-pointer"
                          >
                            ← Upload or take another photo
                          </motion.button>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReanalyzeWithAi}
                            disabled={isLoading}
                            className="min-h-[44px] px-4 py-2 text-sm font-bold text-emerald-300 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-1.5 cursor-pointer"
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
                        transition={{ duration: 0.35, ease: 'easeOut' }}
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
              FLOATING PILL-SHAPED MOBILE BOTTOM NAVIGATION (Eco-Glass & Emerald)
              ========================================================================= */}
          <div className="fixed bottom-6 left-4 right-4 z-50 rounded-[2rem] bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-2 flex justify-around items-center md:hidden shadow-2xl">
            {/* Target 1: Fields / History */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowPresetsModal(true)}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] py-1 px-2 rounded-2xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Grid className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold">Fields</span>
            </motion.button>

            {/* Target 2: Massive Elevated Shutter/Scan in Sage Green */}
            <motion.button
              id="btn-floating-shutter"
              type="button"
              whileTap={{ scale: 0.90 }}
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
              className="-mt-7 w-16 h-16 rounded-full bg-emerald-500/90 hover:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.55)] flex items-center justify-center text-slate-950 font-bold border-4 border-slate-950 active:scale-90 transition-transform cursor-pointer"
              title={diagnosis ? 'Start New Scan' : 'Trigger Camera Shutter'}
            >
              {diagnosis ? <Camera className="w-7 h-7" /> : <Scan className="w-7 h-7" />}
            </motion.button>

            {/* Target 3: Profile / Settings / Guide */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowGuideModal(true)}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] py-1 px-2 rounded-2xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold">Guide</span>
            </motion.button>
          </div>

          {/* =========================================================================
              MODAL 1: ENTERPRISE SPECIMEN PRESETS (Eco-Glass & Emerald)
              ========================================================================= */}
          <AnimatePresence>
            {showPresetsModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
                onClick={() => setShowPresetsModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  className="bg-slate-950/95 border border-white/10 rounded-3xl p-5 sm:p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Enterprise Specimen Presets</h3>
                        <p className="text-xs text-slate-400">Instant offline testing showcase</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPresetsModal(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
                        className="text-left p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-emerald-400 flex items-center gap-3 group transition-colors cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/70 shrink-0 border border-white/10">
                          <img
                            src={sample.thumbnailUrl}
                            alt={sample.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs font-bold py-0.5 px-2 bg-emerald-500/15 text-emerald-300 border-emerald-500/30 mb-1">
                            {sample.crop} • {sample.category}
                          </Badge>
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {sample.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">{sample.localZone}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MODAL 2: GLOBAL AGRONOMY REFERENCE & COMPLIANCE MODAL
              ========================================================================= */}
          <AnimatePresence>
            {showGuideModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
                onClick={() => setShowGuideModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  className="bg-slate-950/95 border border-white/10 rounded-3xl p-5 sm:p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Global Agronomy Reference</h3>
                        <p className="text-xs text-slate-400">Offline crop pathology standards and biological remedies</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
