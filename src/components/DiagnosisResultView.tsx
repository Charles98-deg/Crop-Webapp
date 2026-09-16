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
  Clock,
  Ban,
  PhoneCall,
  MapPin,
  Info,
  Camera,
} from 'lucide-react';
import { PathologyDiagnosis, SeverityLevel, HealthStatus } from '../types';
import { PidginAudioPlayer } from './PidginAudioPlayer';
import { Card } from '@/components/ui/card';
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
  description: string;
} => {
  switch (level) {
    case 'Critical':
      return {
        variant: 'destructive',
        dotClass: 'bg-destructive animate-pulse',
        label: 'Critical Severity',
        description: 'High risk of rapid field spread. Immediate action required within 2 hours.',
      };
    case 'Moderate':
      return {
        variant: 'warning',
        dotClass: 'bg-accent',
        label: 'Moderate Severity',
        description: 'Active infection or pest pressure. Apply containment actions today.',
      };
    case 'Low':
      return {
        variant: 'secondary',
        dotClass: 'bg-muted-foreground',
        label: 'Low Severity',
        description: 'Mild symptoms detected. Monitor closely and use organic remedies.',
      };
    case 'None':
    default:
      return {
        variant: 'default',
        dotClass: 'bg-primary-foreground',
        label: 'Healthy / No Severe Damage',
        description: 'Crop appears in good health. Continue routine farm maintenance.',
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

  // Case 0: Inverse Prompting Clarification Flow (if AI requested specific confirmation)
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
                  Operational Rule #1: Verification
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
                The AI agronomist analyzed this photo and determined that it does not show a crop leaf, stem, pod, root, or plant tissue. All diagnosis and treatment fields are safely withheld.
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
                <Code2 className="w-4 h-4 text-[#22C55E] mr-1.5" />
                <span>{showJsonRaw ? 'Hide JSON' : 'Inspect JSON Schema'}</span>
              </Button>
              {onReset && (
                <Button
                  variant="default"
                  size="default"
                  onClick={onReset}
                  className="min-h-[48px] text-base font-black bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A]"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  <span>Take New Crop Photo</span>
                </Button>
              )}
            </div>
          </div>
        </Alert>

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

  // Calibrated uncertainty text helper
  const getConditionTitle = () => {
    if (diagnosis.health_status === 'Healthy') {
      return 'Healthy Plant — No Disease Detected';
    }
    const name = diagnosis.pathology_name || 'Unidentified Crop Condition';
    if (diagnosis.is_uncertain || confidencePercent < 60) {
      return `Possible Issue: ${name}`;
    }
    if (confidencePercent < 85) {
      return `Likely Issue: ${name}`;
    }
    return name;
  };

  const avoidList: string[] = Array.isArray(diagnosis.avoid)
    ? diagnosis.avoid
    : typeof diagnosis.avoid === 'string'
    ? [diagnosis.avoid]
    : [
        'Do NOT spray chemical pesticides in full midday sun or during heavy rainfall.',
        'Do NOT use unsterilized cutting tools between sick and healthy plants.',
        'Do NOT discard diseased plant material near farm irrigation channels.',
      ];

  const nowAction =
    diagnosis.action_plan_0_2_hours ||
    diagnosis.immediate_containment_step ||
    'Isolate or rogue out affected stands immediately to prevent disease spread.';

  const nextAction =
    diagnosis.action_plan_2_6_hours ||
    diagnosis.organic_local_remedy ||
    'Prepare accessible organic deterrent (wood ash or neem wash) and inspect surrounding rows.';

  const todayAction =
    diagnosis.action_plan_6_24_hours ||
    'Monitor adjacent crops at dusk/dawn; apply recommended treatment during cool hours.';

  const escalationText =
    diagnosis.escalation ||
    'If symptoms continue spreading to more than 20% of your crop within 48 hours, contact your local Cross River Agricultural Development Programme (CRADP) extension worker.';

  const isLocalContext =
    diagnosis.local_context_used &&
    !diagnosis.local_context_used.toLowerCase().includes('general') &&
    !diagnosis.local_context_used.toLowerCase().includes('no lga');

  return (
    <div id="pathology-diagnostic-report" className="space-y-6">
      {/* =========================================================================
          1. PRIMARY DIAGNOSTIC SUMMARY: CROP, ISSUE & CONFIDENCE
          ========================================================================= */}
      <Card className="rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-[#0D1C13]/85 backdrop-blur-md border border-emerald-500/30 text-white space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 text-xs">
                <FileCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                Crop Verified
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

            {/* Crop & Pathology Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-[#22C55E]">
                  Crop Identified: {diagnosis.crop_identified}
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30 bg-black/40">
                  AI Auto-Detected
                </Badge>
              </div>

              <h2
                className="text-2xl sm:text-4xl font-serif italic text-white tracking-tight mt-1 leading-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {getConditionTitle()}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal">
                {severity.description}
              </p>
            </div>

            {/* Confidence & Reliability Bar */}
            <div className="bg-[#0A160F] border-2 border-emerald-500/40 text-white rounded-[20px] p-4 flex flex-col gap-2 max-w-sm shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-widest text-emerald-400 font-bold">
                  Visual Match Confidence
                </span>
                <span className="text-lg font-black text-white">{confidencePercent}%</span>
              </div>
              <Progress
                value={Math.max(confidencePercent, 10)}
                className="h-2 bg-emerald-950/80 border border-emerald-500/30"
                indicatorClassName="bg-[#22C55E]"
              />
              <p className="text-[11px] text-slate-300 text-center font-medium">
                {confidencePercent >= 85
                  ? 'High confidence matching Cross River agricultural symptom library'
                  : confidencePercent >= 60
                  ? 'Moderate visual likelihood — monitor early progression'
                  : 'Low confidence — recommend taking a closer, well-lit photo'}
              </p>
            </div>
          </div>

          {/* Side Specimen Thumbnail */}
          {imagePreviewUrl && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[24px] overflow-hidden border-2 border-emerald-500/40 bg-black/60 shrink-0 shadow-lg relative self-center lg:self-start">
              <img
                src={imagePreviewUrl}
                alt="Diagnosed crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-[10px] text-white font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs">
                Your Specimen
              </span>
            </div>
          )}
        </div>

        {/* Low Confidence or Insufficient Evidence Banner */}
        {(diagnosis.is_uncertain || diagnosis.more_info_needed || confidencePercent < 60) && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-200 space-y-1">
              <strong className="font-bold block text-white">
                More Information Recommended for Precision:
              </strong>
              <p>
                {diagnosis.more_info_needed ||
                  'The image may be slightly distant or shadowed. For highest precision, photograph the underside of the affected leaf or inspect the stem base.'}
              </p>
            </div>
          </div>
        )}

        {/* Observable Symptoms */}
        {diagnosis.observable_symptoms && diagnosis.observable_symptoms.length > 0 && (
          <div className="pt-4 border-t border-emerald-500/20">
            <h4 className="text-xs uppercase text-emerald-400 tracking-wider mb-2.5 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
              Visible Symptoms Identified by AI:
            </h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.observable_symptoms.map((symptom, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-[#0A160F] px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold text-white border border-emerald-500/40"
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* =========================================================================
          2. NIGERIAN PIDGIN SPOKEN AUDIO (ACCESSIBILITY FOR RURAL/OLDER FARMERS)
          ========================================================================= */}
      <PidginAudioPlayer
        script={diagnosis.pidgin_audio_script}
        cropName={diagnosis.crop_identified}
        pathologyName={diagnosis.pathology_name}
      />

      {/* =========================================================================
          3. THE 24-HOUR ACTION PLAN (CORE PROMISE: NOW, NEXT, TODAY, AVOID, ESCALATE)
          ========================================================================= */}
      <Card
        id="section-24-hour-action-plan"
        className="rounded-[32px] p-6 sm:p-8 shadow-2xl bg-[#0D1C13]/90 backdrop-blur-md border-2 border-emerald-500/40 text-white space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-[#22C55E] mb-1">
              <Clock className="w-4 h-4" />
              <span>Immediate Field Response</span>
            </div>
            <h3
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Your 24-Hour Action Plan
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Practical timeline of what to do right now, this afternoon, and over the next 24 hours.
            </p>
          </div>

          <Badge variant="default" className="self-start sm:self-auto text-xs py-1">
            24H Triage Protocol
          </Badge>
        </div>

        {/* 3 Chronological Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Timeline Step 1: 0 - 2 Hours */}
          <div className="bg-[#0A160F] border-2 border-red-500/40 rounded-2xl p-5 space-y-3 shadow-lg relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                NOW • 0–2 HOURS
              </span>
              <Flame className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="text-base font-bold text-white">Immediate Field Triage</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {nowAction}
            </p>
          </div>

          {/* Timeline Step 2: 2 - 6 Hours */}
          <div className="bg-[#0A160F] border-2 border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-lg relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                NEXT • 2–6 HOURS
              </span>
              <Sprout className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-base font-bold text-white">Same-Day Preparation</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {nextAction}
            </p>
          </div>

          {/* Timeline Step 3: 6 - 24 Hours */}
          <div className="bg-[#0A160F] border-2 border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-lg relative">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#22C55E] border border-emerald-500/30">
                TODAY • 6–24 HOURS
              </span>
              <CalendarCheck className="w-4 h-4 text-[#22C55E]" />
            </div>
            <h4 className="text-base font-bold text-white">Follow-up &amp; Application</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {todayAction}
            </p>
          </div>
        </div>

        {/* AVOID & ESCALATE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Critical Warnings (AVOID) */}
          <div className="bg-red-950/30 border-2 border-red-500/35 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                What to AVOID (Do Not Do):
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {avoidList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 font-black mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Seek Expert Help (ESCALATE) */}
          <div className="bg-emerald-950/30 border-2 border-emerald-500/35 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <PhoneCall className="w-5 h-5 text-[#22C55E]" />
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                When to Seek Expert Help:
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {escalationText}
            </p>
            <div className="bg-[#0A160F] p-3 rounded-xl border border-emerald-500/25 text-xs text-emerald-300 font-medium">
              Agricultural Extension Lead: Cross River State Ministry of Agriculture / CRADP (Calabar, Ikom, Ogoja zones).
            </div>
          </div>
        </div>

        {/* Local Agricultural Context Card */}
        <div className="bg-[#0A160F] rounded-2xl p-4 border border-emerald-500/30 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {isLocalContext ? 'Localized Farm Context' : 'General Agricultural Guidance'}
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
                {isLocalContext ? 'Zone-Specific' : 'No LGA Required'}
              </Badge>
            </div>
            <p className="text-slate-300 mt-1">
              {diagnosis.local_context_used ||
                'Standard Cross River agronomic guidance applied. The diagnosis and action plan are completely valid without an LGA.'}
            </p>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          4. DETAILED TREATMENT PROTOCOLS (ORGANIC & CHEMICAL)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Organic & Traditional Remedy */}
        <Card
          id="protocol-organic-remedy"
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-emerald-500/30 shadow-xl space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#22C55E]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Low-Cost &amp; Accessible
              </span>
              <h4 className="text-base font-bold text-white">
                Organic &amp; Traditional Nigerian Remedy
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.organic_local_remedy ||
              'Apply standard hearth wood ash dusting, clean weed sanitation, and neem leaf steep.'}
          </p>
          <div className="bg-[#0A160F] border border-emerald-500/30 px-4 py-2.5 rounded-xl mt-2">
            <p className="text-[11px] font-black text-[#22C55E] uppercase">LOCAL MATERIALS</p>
            <p className="text-xs sm:text-sm text-slate-200">Neem (Dongoyaro) leaves, domestic wood ash, and local black soap.</p>
          </div>
        </Card>

        {/* Standard Agrochemical Treatment with Safety Warnings */}
        <Card
          id="protocol-chemical-treatment"
          className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border-2 border-emerald-500/30 shadow-xl space-y-3.5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Agro-Store Input &amp; Safety
              </span>
              <h4 className="text-base font-bold text-white">
                Standard Registered Chemical Input
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {diagnosis.standard_chemical_treatment ||
              'No chemical pesticide or fungicide necessary for this condition; rely on cultural management.'}
          </p>
          <div className="bg-[#0A160F] border border-amber-500/30 px-4 py-2.5 rounded-xl">
            <p className="text-[11px] font-black text-amber-400 uppercase">SAFETY PROTOCOL</p>
            <p className="text-xs text-slate-200">Always wear face mask, boots, and gloves when handling agrochemicals. Respect harvest withholding periods.</p>
          </div>
        </Card>
      </div>

      {/* Long-Term Prevention */}
      {diagnosis.prevention_future && (
        <Card className="bg-[#0D1C13]/75 backdrop-blur-md p-6 rounded-[28px] border border-emerald-500/30 shadow-xl space-y-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Next Planting Season
              </span>
              <h4 className="text-base font-bold text-white">
                Long-Term Agronomic Prevention &amp; Certified Varieties
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {diagnosis.prevention_future}
          </p>
        </Card>
      )}

      {/* =========================================================================
          5. FOOTER CONTROLS & RAW JSON SCHEMA INSPECTION
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            id="btn-toggle-json-view"
            type="button"
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
            type="button"
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
            type="button"
            variant="default"
            size="default"
            onClick={onReset}
            className="min-h-[48px] px-8 py-3 text-base font-black bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A] rounded-xl cursor-pointer"
          >
            <Camera className="w-4 h-4 mr-2" />
            <span>Check Another Crop</span>
          </Button>
        )}
      </div>

      {showJsonRaw && (
        <Card className="rounded-[28px] p-5 sm:p-6 text-xs sm:text-sm font-mono shadow-2xl border-2 border-emerald-500/30 bg-[#0A160F]">
          <div className="flex items-center justify-between mb-3 text-slate-300 text-xs">
            <span>Payload Conforming to AgriScan 24-Hour Protocol Schema:</span>
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

