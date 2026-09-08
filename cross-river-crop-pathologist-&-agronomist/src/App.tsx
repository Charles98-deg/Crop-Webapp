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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          zone: location || 'Cross River State',
          crop: cropHint || 'Auto-detect',
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
    <div className={`min-h-screen ${activeView === 'landing' ? 'bg-[#0B150E] text-slate-100' : 'bg-background text-foreground'} flex flex-col font-sans selection:bg-accent selection:text-accent-foreground`}>
      {activeView === 'landing' ? (
        <LandingPage onStart={handleStartScanner} />
      ) : (
        <div className="flex-1 flex flex-col">
          <Header />

          {/* Navigation Sub-header */}
          <div className="border-b border-border bg-secondary/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  id="btn-back-landing"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('landing')}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                  <span>Return to Landing Page</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                <span>AgriScan API • Calabar-Ikom Active</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
            <div id="scanner" className="space-y-6">
              {/* Context Notice / Operational rules explanation */}
              <Alert>
                <Info className="w-4 h-4" />
                <AlertTitle>Operational Rules Active:</AlertTitle>
                <AlertDescription>
                  1. Verification first (is_plant check) • 2. Cross River local treatments (Dongoyaro neem, wood ash, Nigerian agrochemicals) • 3. Direct Nigerian Pidgin audio for rural field hands • 4. Strictly typed JSON schema.
                </AlertDescription>
                <Badge variant="default" className="absolute top-4 right-4">
                  Tropical Agrologist AI
                </Badge>
              </Alert>

              {/* Error Message Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-5 h-5" />
                  <AlertTitle>Diagnostic Analysis Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  {lastSelectedParams && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleReanalyzeWithAi}
                      className="absolute top-4 right-4"
                    >
                      Retry
                    </Button>
                  )}
                </Alert>
              )}

              {/* Main view: either Uploader or Diagnosis Result */}
              {diagnosis ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Button
                      id="btn-back-to-upload"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                    >
                      ← Upload or choose another crop
                    </Button>

                    <Button
                      id="btn-force-rerun-gemini"
                      variant="secondary"
                      size="sm"
                      onClick={handleReanalyzeWithAi}
                      disabled={isLoading}
                      title="Send image to AgriScan API on server"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
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

          {/* Footer matching Natural Tones Theme with Persistent Connectivity & Sync Status */}
          <footer className="px-6 md:px-8 py-4 bg-secondary border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground">
            <ConnectivityStatus theme="natural" />
            <div className="flex items-center gap-4 text-center sm:text-right">
              <p className="text-[10px] opacity-70 font-mono">
                REF_ID: CR-8812-CAS-01 | CALABAR-IKOM NODE
              </p>
              <p className="text-[10px] opacity-80 text-primary font-semibold">
                Cross River Smallholder Edition
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
