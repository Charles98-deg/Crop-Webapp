import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Sprout,
  FlaskConical,
  CalendarCheck,
  Code2,
  Copy,
  Check,
  FileCheck,
  HelpCircle,
  Bug,
  Activity,
} from 'lucide-react';
import { PathologyDiagnosis, SeverityLevel, HealthStatus } from '../types';
import { PidginAudioPlayer } from './PidginAudioPlayer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface DiagnosisResultViewProps {
  diagnosis: PathologyDiagnosis;
  imagePreviewUrl?: string;
  onReset?: () => void;
  onSelectOption?: (option: string) => void;
}


const getSeverityBadgeVariant = (level: SeverityLevel): {
  variant: 'destructive' | 'warning' | 'secondary' | 'default';
  dotClass: string;
  label: string;
} => {
  switch (level) {
    case 'Critical':
      return {
        variant: 'destructive',
        dotClass: 'bg-destructive animate-pulse',
        label: 'Critical Severity',
      };
    case 'Moderate':
      return {
        variant: 'warning',
        dotClass: 'bg-accent',
        label: 'Moderate Severity (Spread Risk)',
      };
    case 'Low':
      return {
        variant: 'secondary',
        dotClass: 'bg-muted-foreground',
        label: 'Low Severity',
      };
    case 'None':
    default:
      return {
        variant: 'default',
        dotClass: 'bg-primary-foreground',
        label: 'No Severe Damage',
      };
  }
};

const getHealthStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'Healthy':
      return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case 'Pest Infested':
      return <Bug className="w-4 h-4 text-accent" />;
    case 'Nutrient Deficient':
      return <Activity className="w-4 h-4 text-muted-foreground" />;
    case 'Diseased':
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  diagnosis,
  imagePreviewUrl,
  onReset,
  onSelectOption,
}) => {
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const severity = getSeverityBadgeVariant(diagnosis.severity_level);
  const confidencePercent = Math.round((diagnosis.confidence_score || 0) * 100);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosis, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Case 0: Inverse Prompting Clarification Flow (Result Card Hidden)
  if (diagnosis.needs_clarification) {
    return (
      <div id="clarification-dialog-view" className="space-y-6 max-w-2xl mx-auto py-2">
        <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <Badge variant="outline" className="text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300">
              Confidence &lt; 85% • Clarification Needed
            </Badge>
          </div>

          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-snug mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {diagnosis.clarification_question || 'Please answer this question to confirm diagnosis:'}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {diagnosis.options && diagnosis.options.length > 0 ? (
              diagnosis.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOption?.(option)}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-border bg-secondary/70 hover:bg-primary/10 hover:border-primary active:scale-[0.98] transition-all duration-150 text-base sm:text-lg font-semibold text-foreground shadow-sm min-h-[58px] flex items-center justify-between touch-manipulation cursor-pointer group"
                >
                  <span>{option}</span>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors text-xl font-bold ml-3">
                    →
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No options provided.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 1: Verification Rule #1 — Image is not a plant
  if (!diagnosis.is_plant) {
    return (
      <div id="non-plant-verification-card" className="space-y-6">
        <Alert
          variant="destructive"
          className="rounded-[32px] p-6 md:p-8 bg-destructive/10 border-destructive/30 text-foreground"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive">
                  Strict Operational Rule #1 Applied
                </Badge>
                <Badge variant="outline" className="text-muted-foreground border-border">
                  Verification Status: is_plant = false
                </Badge>
              </div>
              <AlertTitle
                className="text-xl md:text-2xl font-bold text-foreground mt-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Non-Plant Image Detected ({diagnosis.crop_identified})
              </AlertTitle>
              <AlertDescription className="text-sm text-foreground/80 leading-relaxed">
                The AI agronomist analyzed the submitted photo and verified that it does not contain a crop leaf, stem, fruit, or plant tissue. All pathology fields remain null in accordance with strict protocol.
              </AlertDescription>
            </div>
          </div>

          {/* Pidgin Audio Guidance for Non-Plant */}
          <div className="mt-6">
            <PidginAudioPlayer
              script={diagnosis.pidgin_audio_script}
              cropName="Not a plant"
              pathologyName="N/A"
            />
          </div>

          <Separator className="my-6 bg-destructive/20" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Please take a clear photo of a crop leaf, stem, or fruit in your field.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJsonRaw(!showJsonRaw)}
              >
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span>{showJsonRaw ? 'Hide Raw JSON' : 'Inspect JSON Schema'}</span>
              </Button>
              {onReset && (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={onReset}
                  className="font-bold"
                >
                  Upload New Photo
                </Button>
              )}
            </div>
          </div>
        </Alert>

        {/* JSON Schema Viewer */}
        {showJsonRaw && (
          <Card className="rounded-[24px] p-5 text-xs font-mono shadow-sm">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border text-muted-foreground">
              <span>Strict JSON Output Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="h-auto p-0 text-primary hover:text-primary hover:bg-transparent font-bold"
              >
                {jsonCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
              </Button>
            </div>
            <pre className="overflow-x-auto p-3 bg-secondary/50 rounded-xl text-[11px] leading-relaxed text-foreground">
              {JSON.stringify(diagnosis, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    );
  }

  // Case 2: Plant Identified — Complete Pathology Protocol
  return (
    <div id="pathology-diagnostic-report" className="space-y-6">
      {/* Primary Diagnostic Summary Header */}
      <Card className="rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden bg-card border-border">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3.5 flex-1">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1">
                <FileCheck className="w-3.5 h-3.5" />
                Plant Verified
              </Badge>

              <Badge variant="outline" className="gap-1.5 py-1 bg-background text-foreground border-input">
                {getHealthStatusIcon(diagnosis.health_status)}
                {diagnosis.health_status}
              </Badge>

              <Badge variant={severity.variant} className="gap-1.5 py-1">
                <span className={`w-2 h-2 rounded-full ${severity.dotClass}`} />
                {severity.label}
              </Badge>
            </div>

            {/* Pathology Title with Serif Georgia styling */}
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-accent">
                {diagnosis.crop_identified}
              </span>
              <h2
                className="text-2xl md:text-3xl font-serif italic text-primary tracking-tight mt-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {diagnosis.pathology_name || 'Healthy Crop'}
              </h2>
            </div>

            {/* Confidence & Diagnostic Score card in Natural Tones olive-khaki */}
            <div className="bg-[#5A5A40] text-[#F5F2ED] rounded-[20px] p-4 flex flex-col gap-1.5 max-w-sm shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest opacity-80">
                  Confidence Score
                </span>
                <span className="text-lg font-bold">{confidencePercent}%</span>
              </div>
              <Progress
                value={Math.max(confidencePercent, 10)}
                className="h-1.5 bg-white/20"
                indicatorClassName="bg-accent"
              />
              <p className="text-[10px] italic opacity-80 mt-0.5 text-center">
                Validated against regional West African pathology models
              </p>
            </div>
          </div>

          {/* Side Thumbnail with container */}
          {imagePreviewUrl && (
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[24px] overflow-hidden border-2 border-border bg-muted shrink-0 shadow-sm relative">
              <img
                src={imagePreviewUrl}
                alt="Diagnosed crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                Specimen
              </span>
            </div>
          )}
        </div>

        {/* Observable Symptoms Checklist */}
        {diagnosis.observable_symptoms && diagnosis.observable_symptoms.length > 0 && (
          <div className="mt-6 pt-5 border-t border-border">
            <h4 className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" />
              Symptoms Identified in Specimen:
            </h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.observable_symptoms.map((symptom, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-background px-3 py-1.5 rounded-xl text-xs font-medium text-foreground border-input"
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Spoken Nigerian Pidgin Audio Instructions Card (Operational Rule #3) */}
      <PidginAudioPlayer
        script={diagnosis.pidgin_audio_script}
        cropName={diagnosis.crop_identified}
        pathologyName={diagnosis.pathology_name}
      />

      {/* Cross River Action Protocol Grid (Operational Rule #2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Immediate Containment Step */}
        <Card
          id="protocol-immediate-containment"
          className="bg-muted p-5 md:p-6 rounded-[24px] border-border shadow-xs relative space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                Action 1 • Critical 24h
              </span>
              <h4 className="text-sm font-bold text-primary">
                Immediate Field Containment
              </h4>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {diagnosis.immediate_containment_step ||
              'No immediate quarantine required; continue standard field monitoring.'}
          </p>
          <div className="bg-primary/10 px-3 py-2 rounded-lg mt-2">
            <p className="text-[10px] font-bold text-primary uppercase">IMMEDIATE STEP</p>
            <p className="text-xs text-foreground">Isolate or rogue diseased plants immediately to prevent spore migration.</p>
          </div>
        </Card>

        {/* Card 2: Organic Local Remedies */}
        <Card
          id="protocol-organic-remedy"
          className="bg-muted p-5 md:p-6 rounded-[24px] border-border shadow-xs relative space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Action 2 • Low-Cost & Local
              </span>
              <h4 className="text-sm font-bold text-primary">
                Organic & Traditional Remedy (Nigeria)
              </h4>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {diagnosis.organic_local_remedy ||
              'Apply standard compost, mulching, and maintain weed sanitation.'}
          </p>
          <div className="bg-accent/10 px-3 py-2 rounded-lg mt-2">
            <p className="text-[10px] font-bold text-accent uppercase">TRADITIONAL PRACTICE</p>
            <p className="text-xs text-foreground">Utilize hearth wood ash and steeped neem (Dongoyaro) solutions.</p>
          </div>
        </Card>

        {/* Card 3: Standard Agrochemical Treatment */}
        <Card
          id="protocol-chemical-treatment"
          className="bg-muted p-5 md:p-6 rounded-[24px] border-border shadow-xs relative space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-secondary-foreground">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Action 3 • Agro-Store Input
              </span>
              <h4 className="text-sm font-bold text-primary">
                Standard Agrochemical Protocol & Safety
              </h4>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {diagnosis.standard_chemical_treatment ||
              'No chemical pesticide or fungicide necessary for this condition.'}
          </p>
        </Card>

        {/* Card 4: Long-Term Agronomic Prevention */}
        <Card
          id="protocol-future-prevention"
          className="bg-muted p-5 md:p-6 rounded-[24px] border-border shadow-xs relative space-y-3 border-l-4 border-l-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-secondary-foreground">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Action 4 • Next Season
              </span>
              <h4 className="text-sm font-bold text-primary">
                Agronomic Prevention & Certified Varieties
              </h4>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {diagnosis.prevention_future ||
              'Rotate crops, use certified clean seed stock, and maintain proper plant spacing.'}
          </p>
          <div className="bg-secondary/60 px-3 py-2 rounded-lg">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">CERTIFIED SEED STOCK</p>
            <p className="text-xs text-foreground/80">Acquire clean stock from IITA or local Cross River agricultural extension offices.</p>
          </div>
        </Card>
      </div>

      {/* Footer controls & Raw JSON inspection */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            id="btn-toggle-json-view"
            variant="outline"
            size="sm"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="shadow-2xs font-semibold"
          >
            <Code2 className="w-4 h-4 text-primary mr-1.5" />
            <span>{showJsonRaw ? 'Hide JSON Payload' : 'Inspect JSON Schema'}</span>
          </Button>

          <Button
            id="btn-copy-full-json"
            variant="ghost"
            size="sm"
            onClick={handleCopyJson}
            className="text-muted-foreground hover:text-foreground font-medium"
          >
            {jsonCopied ? <Check className="w-3.5 h-3.5 text-primary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
          </Button>
        </div>

        {onReset && (
          <Button
            id="btn-diagnose-another-specimen"
            variant="default"
            onClick={onReset}
            className="px-6 py-2.5 font-bold shadow-sm"
          >
            Diagnose Another Crop
          </Button>
        )}
      </div>

      {/* JSON Schema Code View */}
      {showJsonRaw && (
        <Card className="rounded-[24px] p-5 text-xs font-mono shadow-sm border-border">
          <div className="flex items-center justify-between mb-2 text-muted-foreground text-[11px]">
            <span>Payload Conforming to Strict Operational Schema:</span>
            <span className="text-primary font-bold font-mono">application/json</span>
          </div>
          <pre className="overflow-x-auto p-3.5 bg-secondary/50 rounded-xl text-[11px] leading-relaxed text-foreground max-h-72 border border-border">
            {JSON.stringify(diagnosis, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
