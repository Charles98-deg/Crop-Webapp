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
        <div className="bg-[#0D1C13]/85 backdrop-blur-md border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <Badge variant="warning" className="text-xs font-bold py-1">
              Confidence &lt; 85% • Clarification Needed
            </Badge>
          </div>

          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {diagnosis.clarification_question || 'Please answer this question to confirm diagnosis:'}
          </h2>

          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {diagnosis.options && diagnosis.options.length > 0 ? (
              diagnosis.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOption?.(option)}
                  className="w-full text-left p-5 rounded-2xl border-2 border-emerald-500/40 bg-[#0A160F]/90 hover:bg-[#10281A] hover:border-[#22C55E] active:scale-[0.98] transition-all duration-150 text-base sm:text-lg font-bold text-white shadow-md min-h-[58px] flex items-center justify-between touch-manipulation cursor-pointer group"
                >
                  <span>{option}</span>
                  <span className="text-[#22C55E] group-hover:translate-x-1 transition-transform text-2xl font-black ml-3">
                    →
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-300">No options provided.</p>
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
          className="rounded-[32px] p-6 md:p-8 bg-red-950/40 border-2 border-red-500/40 text-white backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive">
                  Strict Operational Rule #1 Applied
                </Badge>
                <Badge variant="outline" className="text-slate-300 border-white/20">
                  Verification Status: is_plant = false
                </Badge>
              </div>
              <AlertTitle
                className="text-xl sm:text-2xl font-bold text-white mt-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Non-Plant Image Detected ({diagnosis.crop_identified})
              </AlertTitle>
              <AlertDescription className="text-sm sm:text-base text-slate-200 leading-relaxed">
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

          <Separator className="my-6 bg-red-500/20" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Please take a clear photo of a crop leaf, stem, or fruit in your field.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="min-h-[48px] text-base"
              >
                <Code2 className="w-4 h-4 text-[#22C55E]" />
                <span>{showJsonRaw ? 'Hide Raw JSON' : 'Inspect JSON Schema'}</span>
              </Button>
              {onReset && (
                <Button
                  variant="default"
                  size="default"
                  onClick={onReset}
                  className="min-h-[48px] text-base font-black bg-[#22C55E] text-[#060D09]"
                >
                  Upload New Photo
                </Button>
              )}
            </div>
          </div>
        </Alert>

        {/* JSON Schema Viewer */}
        {showJsonRaw && (
          <Card className="rounded-[28px] p-5 sm:p-6 text-xs sm:text-sm font-mono shadow-2xl bg-[#0A160F] border-2 border-emerald-500/30">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/20 text-slate-300">
              <span className="font-bold">Strict JSON Output Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="min-h-[44px] text-emerald-400 hover:text-white font-bold"
              >
                {jsonCopied ? <Check className="w-4 h-4 mr-1 text-[#22C55E]" /> : <Copy className="w-4 h-4 mr-1" />}
                <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
              </Button>
            </div>
            <pre className="overflow-x-auto p-4 bg-black/60 rounded-xl text-xs sm:text-sm leading-relaxed text-emerald-300 border border-emerald-500/20">
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
      <Card className="rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-[#0D1C13]/85 backdrop-blur-md border border-emerald-500/30 text-white">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default" className="gap-1.5 py-1 text-xs">
                <FileCheck className="w-4 h-4 text-[#22C55E]" />
                Plant Verified
              </Badge>

              <Badge variant="outline" className="gap-1.5 py-1 text-xs bg-[#0A160F] text-white border-emerald-500/40">
                {getHealthStatusIcon(diagnosis.health_status)}
                {diagnosis.health_status}
              </Badge>

              <Badge variant={severity.variant} className="gap-1.5 py-1 text-xs">
                <span className={`w-2 h-2 rounded-full ${severity.dotClass}`} />
                {severity.label}
              </Badge>
            </div>

            {/* Pathology Title with Serif Georgia styling */}
            <div>
              <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-[#22C55E]">
                {diagnosis.crop_identified}
              </span>
              <h2
                className="text-2xl sm:text-4xl font-serif italic text-white tracking-tight mt-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {diagnosis.pathology_name || 'Healthy Crop'}
              </h2>
            </div>

            {/* Confidence & Diagnostic Score card in Dark Obsidian & Emerald */}
            <div className="bg-[#0A160F] border-2 border-emerald-500/40 text-white rounded-[22px] p-4.5 flex flex-col gap-2 max-w-sm shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Confidence Score
                </span>
                <span className="text-xl font-black text-white">{confidencePercent}%</span>
              </div>
              <Progress
                value={Math.max(confidencePercent, 10)}
                className="h-2 bg-emerald-950/80 border border-emerald-500/30"
                indicatorClassName="bg-[#22C55E]"
              />
              <p className="text-xs text-slate-300 font-medium text-center">
                Validated against regional West African pathology models
              </p>
            </div>
          </div>

          {/* Side Thumbnail with container */}
          {imagePreviewUrl && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[24px] overflow-hidden border-2 border-emerald-500/40 bg-black/60 shrink-0 shadow-lg relative">
              <img
                src={imagePreviewUrl}
                alt="Diagnosed crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-xs text-white font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                Specimen
              </span>
            </div>
          )}
        </div>

        {/* Observable Symptoms Checklist */}
        {diagnosis.observable_symptoms && diagnosis.observable_symptoms.length > 0 && (
          <div className="mt-6 pt-5 border-t border-emerald-500/20">
            <h4 className="text-xs uppercase text-emerald-400 tracking-wider mb-2.5 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
              Symptoms Identified in Specimen:
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {diagnosis.observable_symptoms.map((symptom, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-[#0A160F] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white border-2 border-emerald-500/40"
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
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-red-500/30 shadow-xl relative space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                Action 1 • Critical 24h
              </span>
              <h4 className="text-base font-bold text-white">
                Immediate Field Containment
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.immediate_containment_step ||
              'No immediate quarantine required; continue standard field monitoring.'}
          </p>
          <div className="bg-[#0A160F] border border-red-500/30 px-4 py-2.5 rounded-xl mt-2">
            <p className="text-[11px] font-black text-red-400 uppercase">IMMEDIATE STEP</p>
            <p className="text-xs sm:text-sm text-slate-200">Isolate or rogue diseased plants immediately to prevent spore migration.</p>
          </div>
        </Card>

        {/* Card 2: Organic Local Remedies */}
        <Card
          id="protocol-organic-remedy"
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-emerald-500/30 shadow-xl relative space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#22C55E]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Action 2 • Low-Cost &amp; Local
              </span>
              <h4 className="text-base font-bold text-white">
                Organic &amp; Traditional Remedy (Nigeria)
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.organic_local_remedy ||
              'Apply standard compost, mulching, and maintain weed sanitation.'}
          </p>
          <div className="bg-[#0A160F] border border-emerald-500/30 px-4 py-2.5 rounded-xl mt-2">
            <p className="text-[11px] font-black text-[#22C55E] uppercase">TRADITIONAL PRACTICE</p>
            <p className="text-xs sm:text-sm text-slate-200">Utilize hearth wood ash and steeped neem (Dongoyaro) solutions.</p>
          </div>
        </Card>

        {/* Card 3: Standard Agrochemical Treatment */}
        <Card
          id="protocol-chemical-treatment"
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-emerald-500/30 shadow-xl relative space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Action 3 • Agro-Store Input
              </span>
              <h4 className="text-base font-bold text-white">
                Standard Agrochemical Protocol &amp; Safety
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.standard_chemical_treatment ||
              'No chemical pesticide or fungicide necessary for this condition.'}
          </p>
        </Card>

        {/* Card 4: Long-Term Agronomic Prevention */}
        <Card
          id="protocol-future-prevention"
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-emerald-500/30 shadow-xl relative space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Action 4 • Next Season
              </span>
              <h4 className="text-base font-bold text-white">
                Agronomic Prevention &amp; Certified Varieties
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.prevention_future ||
              'Rotate crops, use certified clean seed stock, and maintain proper plant spacing.'}
          </p>
          <div className="bg-[#0A160F] border border-emerald-500/30 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] font-black text-emerald-400 uppercase">CERTIFIED SEED STOCK</p>
            <p className="text-xs sm:text-sm text-slate-200">Acquire clean stock from IITA or local Cross River agricultural extension offices.</p>
          </div>
        </Card>
      </div>

      {/* Footer controls & Raw JSON inspection */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            id="btn-toggle-json-view"
            variant="outline"
            size="default"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="min-h-[48px] text-base font-bold"
          >
            <Code2 className="w-4 h-4 text-[#22C55E] mr-1.5" />
            <span>{showJsonRaw ? 'Hide JSON Payload' : 'Inspect JSON Schema'}</span>
          </Button>

          <Button
            id="btn-copy-full-json"
            variant="ghost"
            size="default"
            onClick={handleCopyJson}
            className="min-h-[48px] text-base text-slate-300 hover:text-white font-medium"
          >
            {jsonCopied ? <Check className="w-4 h-4 text-[#22C55E] mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
          </Button>
        </div>

        {onReset && (
          <Button
            id="btn-diagnose-another-specimen"
            variant="default"
            size="default"
            onClick={onReset}
            className="min-h-[48px] px-8 py-3 text-base font-black bg-[#22C55E] text-[#060D09]"
          >
            Diagnose Another Crop
          </Button>
        )}
      </div>

      {/* JSON Schema Code View */}
      {showJsonRaw && (
        <Card className="rounded-[28px] p-5 sm:p-6 text-xs sm:text-sm font-mono shadow-2xl border-2 border-emerald-500/30 bg-[#0A160F]">
          <div className="flex items-center justify-between mb-3 text-slate-300 text-xs">
            <span>Payload Conforming to Strict Operational Schema:</span>
            <span className="text-[#22C55E] font-bold font-mono">application/json</span>
          </div>
          <pre className="overflow-x-auto p-4 bg-black/60 rounded-xl text-xs sm:text-sm leading-relaxed text-emerald-300 max-h-72 border border-emerald-500/20">
            {JSON.stringify(diagnosis, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
