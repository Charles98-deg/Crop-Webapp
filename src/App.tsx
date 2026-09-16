import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DiagnosisResultView } from './components/DiagnosisResultView';
import { AgronomyGuide } from './components/AgronomyGuide';
import { LandingPage } from './components/LandingPage';
import { ConnectivityStatus } from './components/ConnectivityStatus';
import { PathologyDiagnosis, WestAfricanCrop, FieldSample } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sprout,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Info,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { ElasticMeshShowcase } from './components/AnimatedCard';

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
  const [error, setError] = useState<string | null>(null);

  const runLiveDiagnosis = async (
    imageData: string,
    mimeType: string,
    cropHint: WestAfricanCrop,
    location: string,
    fieldNotes: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error(
          'You are currently working in offline mode without internet connectivity. Preset crop samples and offline agronomy guides remain active on your device. Connect to 3G/4G or Wi-Fi to run live cloud diagnosis.'
        );
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          mimeType: mimeType,
          cropHint: cropHint || 'Auto-detect',
          location: location || 'Cross River State',
          fieldNotes: fieldNotes,
        }),
      });

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
        immediate_containment_step: data.immediate_containment_step ?? null,
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
      const e = err as Error;
      console.error('Diagnosis request error:', e);
      setError(e.message || 'Failed to analyze crop image. Please check connectivity.');
    } finally {
      setIsLoading(false);
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
      // Instant diagnostic load for preset sample case
      setDiagnosis(samplePreset);
      setError(null);
    } else {
      // User uploaded or snapped image -> trigger live AgriScan API analysis
      runLiveDiagnosis(imageData, mimeType, cropHint, location, fieldNotes);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setImagePreviewUrl(null);
    setError(null);
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

  return (
    <div className="min-h-screen bg-[#060D09] text-white flex flex-col font-sans selection:bg-[#22C55E] selection:text-[#060D09]">
      {activeView === 'landing' ? (
        <LandingPage onStart={handleStartScanner} />
      ) : (
        <div className="flex-1 flex flex-col bg-[#060D09]">
          <Header />

          {/* Navigation Sub-header */}
          <div className="border-b border-emerald-500/20 bg-[#0A160F]/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  id="btn-back-landing"
                  variant="ghost"
                  size="default"
                  onClick={() => setActiveView('landing')}
                  className="min-h-[48px] text-base font-bold text-white hover:text-[#22C55E] hover:bg-white/10 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Landing Page</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span>AgriScan API • Calabar-Ikom Active</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
            <div id="scanner" className="space-y-6">
              {/* Context Notice / Operational rules explanation */}
              <Alert className="border-2 border-emerald-500/30 bg-[#0D1C13]/85 text-white backdrop-blur-md shadow-xl">
                <Info className="w-5 h-5 text-[#22C55E]" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <AlertTitle className="text-base font-bold text-white">Operational Rules Active:</AlertTitle>
                  <Badge variant="default" className="self-start sm:self-auto text-xs font-bold py-1">
                    Tropical Agrologist AI
                  </Badge>
                </div>
                <AlertDescription className="text-sm text-slate-200 mt-2">
                  1. Verification first (is_plant check) • 2. Cross River local treatments (Dongoyaro neem, wood ash, Nigerian agrochemicals) • 3. Direct Nigerian Pidgin audio for rural field hands • 4. Strictly typed JSON schema.
                </AlertDescription>
              </Alert>

              {/* Error Message Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-5 h-5" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <AlertTitle className="text-base font-bold">Diagnostic Analysis Error</AlertTitle>
                    {lastSelectedParams && (
                      <Button
                        variant="default"
                        size="default"
                        onClick={handleReanalyzeWithAi}
                        className="min-h-[48px] text-base font-black bg-[#22C55E] text-[#060D09]"
                      >
                        Retry Analysis
                      </Button>
                    )}
                  </div>
                  <AlertDescription className="text-sm mt-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Main view: either Uploader or Diagnosis Result */}
              {diagnosis ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      id="btn-back-to-upload"
                      variant="ghost"
                      size="default"
                      onClick={handleReset}
                      className="min-h-[48px] text-base font-bold text-white hover:text-[#22C55E] hover:bg-white/10"
                    >
                      ← Upload or choose another crop
                    </Button>

                    <Button
                      id="btn-force-rerun-gemini"
                      variant="secondary"
                      size="default"
                      onClick={handleReanalyzeWithAi}
                      disabled={isLoading}
                      title="Send image to AgriScan API on server"
                      className="min-h-[48px] text-base font-bold border-2 border-emerald-500/40 text-white hover:border-[#22C55E]"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Re-analyzing...' : 'Run Live AgriScan API'}</span>
                    </Button>
                  </div>

                  <DiagnosisResultView
                    diagnosis={diagnosis}
                    imagePreviewUrl={imagePreviewUrl || undefined}
                    onReset={handleReset}
                    onSelectOption={handleClarificationOptionSelect}
                  />
                </div>
              ) : (
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  isLoading={isLoading}
                />
              )}
            </div>
          </main>

          {/* Footer matching Unified Dark Obsidian Theme with Persistent Connectivity & Sync Status */}
          <footer className="px-6 md:px-8 py-5 bg-[#060D09] border-t border-emerald-500/20 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-300">
            <ConnectivityStatus theme="dark" />
            <div className="flex items-center gap-4 text-center sm:text-right">
              <p className="text-xs opacity-80 font-mono text-slate-400">
                REF_ID: CR-8812-CAS-01 | CALABAR-IKOM NODE
              </p>
              <p className="text-xs text-[#22C55E] font-bold">
                Cross River Smallholder Edition
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
