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
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'diagnose' | 'guide'>('landing');
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

      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          mimeType,
          cropHint,
          location,
          fieldNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Diagnosis failed with server status ${response.status}`
        );
      }

      const result: PathologyDiagnosis = await response.json();
      setDiagnosis(result);
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
      // User uploaded or snapped image -> trigger live Gemini API analysis
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

  const handleLaunchScannerFromLanding = () => {
    setActiveTab('diagnose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${activeTab === 'landing' ? 'bg-slate-950 text-slate-100' : 'bg-background text-foreground'} flex flex-col font-sans selection:bg-accent selection:text-accent-foreground`}>
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-primary text-primary-foreground border-b border-primary/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="bg-primary/50 border-none">
              <TabsTrigger
                value="landing"
                id="global-tab-landing"
                className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=inactive]:text-primary-foreground/80"
              >
                AgriScan Overview (Landing Page)
              </TabsTrigger>
              <TabsTrigger
                value="diagnose"
                id="global-tab-diagnose"
                className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=inactive]:text-primary-foreground/80"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Live AI Diagnostic Scanner</span>
              </TabsTrigger>
              <TabsTrigger
                value="guide"
                id="global-tab-guide"
                className="hidden sm:flex data-[state=active]:bg-card data-[state=active]:text-primary data-[state=inactive]:text-primary-foreground/80"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pathology Guide</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-primary-foreground/80">
            <span className="w-2 h-2 rounded-full bg-[#96C87C] animate-pulse" />
            <span>Cross River Field Edition • Multimodal Gemini Active</span>
          </div>
        </div>
      </div>

      {activeTab === 'landing' ? (
        <LandingPage onLaunchScanner={handleLaunchScannerFromLanding} />
      ) : (
        <div className="flex-1 flex flex-col">
          <Header />

          {/* Navigation Sub-header */}
          <div className="border-b border-border bg-secondary/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  id="tab-btn-back-landing"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('landing')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Landing Page</span>
                </Button>

                <div className="h-4 w-px bg-border mx-1" />

                <Button
                  id="tab-btn-diagnose"
                  variant={activeTab === 'diagnose' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('diagnose')}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Diagnostic Lab & Audio</span>
                </Button>

                <Button
                  id="tab-btn-guide"
                  variant={activeTab === 'guide' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('guide')}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Cross River Crops Guide</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                <span>Gemini 3.8 Flash • Akpabuyo & Ikom Lab Active</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
            {activeTab === 'diagnose' ? (
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
                        title="Send image to Gemini 3.8 Flash model on server"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'Re-analyzing...' : 'Run Live Gemini API'}</span>
                      </Button>
                    </div>

                    <DiagnosisResultView
                      diagnosis={diagnosis}
                      imagePreviewUrl={imagePreviewUrl || undefined}
                      onReset={handleReset}
                    />
                  </div>
                ) : (
                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    isLoading={isLoading}
                  />
                )}
              </div>
            ) : (
              <AgronomyGuide />
            )}
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
