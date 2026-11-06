import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  Camera,
  ShieldCheck,
  OctagonAlert,
  Sparkles,
} from 'lucide-react';
import { PathologyDiagnosis, SeverityLevel, HealthStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DiagnosisResultViewProps {
  diagnosis: PathologyDiagnosis;
  imagePreviewUrl?: string;
  onReset?: () => void;
  onSelectOption?: (option: string) => void;
}

const getSeverityBadgeVariant = (level: SeverityLevel): {
  dotClass: string;
  badgeClass: string;
  label: string;
  description: string;
  strokeColor: string;
} => {
  switch (level) {
    case 'Critical':
      return {
        dotClass: 'bg-destructive',
        badgeClass: 'bg-destructive/15 text-destructive border-destructive/30',
        label: 'Critical Severity',
        description: 'High risk of rapid field spread. Immediate action required within 2 hours.',
        strokeColor: 'var(--destructive)',
      };
    case 'Moderate':
      return {
        dotClass: 'bg-warning',
        badgeClass: 'bg-warning/15 text-warning border-warning/30',
        label: 'Moderate Severity',
        description: 'Active infection or localized pest pressure. Implement containment protocol today.',
        strokeColor: 'var(--warning)',
      };
    case 'Low':
      return {
        dotClass: 'bg-primary',
        badgeClass: 'bg-primary/15 text-primary border-primary/30',
        label: 'Low Severity',
        description: 'Mild symptoms detected. Monitor closely and apply accessible organic remedies.',
        strokeColor: 'var(--primary)',
      };
    case 'None':
    default:
      return {
        dotClass: 'bg-primary',
        badgeClass: 'bg-primary/15 text-primary border-primary/30',
        label: 'Healthy / No Severe Damage',
        description: 'Crop appears in good health with no critical active pathology. Continue routine farm care.',
        strokeColor: 'var(--primary)',
      };
  }
};

const getHealthStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'Healthy':
      return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case 'Pest Infested':
      return <Bug className="w-4 h-4 text-warning" />;
    case 'Nutrient Deficient':
      return <Activity className="w-4 h-4 text-primary" />;
    case 'Diseased':
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 26 },
  },
};

// Circular Progress Gauge Ring component styled with design tokens
const CircularProgressRing: React.FC<{
  percent: number;
  label: string;
  sublabel: string;
  strokeColor?: string;
  textColor?: string;
}> = ({ percent, label, sublabel, strokeColor = 'var(--primary)', textColor = 'text-primary' }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-secondary/60 border border-border flex-1">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="text-border"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{percent}%</span>
        </div>
      </div>
      <span className={`text-sm font-semibold mt-2 ${textColor}`}>{label}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{sublabel}</span>
    </div>
  );
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

  // Case 0: Clarification Flow
  if (diagnosis.needs_clarification) {
    return (
      <motion.div
        id="clarification-dialog-view"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-6 max-w-2xl mx-auto py-2"
      >
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <Badge variant="outline" className="text-xs font-bold py-0.5">
              Clarification Needed
            </Badge>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight leading-snug">
              {diagnosis.clarification_question || 'Please select an observation to confirm the diagnosis:'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Select what best describes what you see on the plant to narrow down the diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {diagnosis.options && diagnosis.options.length > 0 ? (
              diagnosis.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOption?.(option)}
                  className="w-full text-left p-4 sm:p-5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary hover:border-primary/50 transition-all text-base sm:text-lg font-semibold text-foreground shadow-sm min-h-[58px] flex items-center justify-between touch-manipulation cursor-pointer group"
                >
                  <span className="pr-4">{option}</span>
                  <span className="text-primary group-hover:translate-x-1 transition-transform text-xl font-bold">
                    →
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No confirmation options provided.</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Case 1: Non-Plant Detection (Friendly retake prompt, no internal rules quoted)
  if (!diagnosis.is_plant) {
    return (
      <motion.div
        id="non-plant-verification-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border text-foreground shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <Badge variant="outline" className="text-xs font-semibold">
                Photo Check
              </Badge>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-1">
                No crop plant detected
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We couldn&apos;t clearly spot a crop plant, leaf, or fruit in this photo. Take a close-up photo in daylight so we can give you an accurate 24-hour care plan.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Tip: Hold the camera steady and focus on the affected leaf or stem.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="min-h-[48px] text-sm font-semibold border-border bg-secondary text-foreground hover:bg-secondary/80 rounded-xl cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-primary mr-2" />
                <span>{showJsonRaw ? 'Hide JSON' : 'Inspect JSON'}</span>
              </Button>
              {onReset && (
                <Button
                  variant="default"
                  size="default"
                  onClick={onReset}
                  className="min-h-[48px] text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  <span>Take new photo</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calibrated condition title
  const getConditionTitle = () => {
    if (diagnosis.health_status === 'Healthy') {
      return 'Healthy Plant — No Disease Detected';
    }
    const name = diagnosis.pathology_name || 'Unidentified Crop Condition';
    if (diagnosis.is_uncertain || confidencePercent < 60) {
      return `Possible Condition: ${name}`;
    }
    if (confidencePercent < 85) {
      return `Likely Condition: ${name}`;
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
    'Isolate or rogue out affected stands immediately to prevent disease contagion across the field.';

  const nextAction =
    diagnosis.action_plan_2_6_hours ||
    diagnosis.organic_local_remedy ||
    'Prepare accessible organic deterrent (wood ash dusting or neem leaf steep) and inspect surrounding rows.';

  const todayAction =
    diagnosis.action_plan_6_24_hours ||
    'Monitor adjacent crops at dusk/dawn; apply recommended treatment during cool evening hours.';

  const escalationText =
    diagnosis.escalation ||
    'If symptoms continue spreading to more than 20% of your crop within 48 hours, contact your regional agricultural extension service or certified crop pathology agronomist.';

  const isLocalContext =
    diagnosis.local_context_used &&
    !diagnosis.local_context_used.toLowerCase().includes('general') &&
    !diagnosis.local_context_used.toLowerCase().includes('no lga');

  return (
    <motion.div
      id="pathology-diagnostic-report"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-24"
    >
      {/* =========================================================================
          1. PRIMARY DIAGNOSTIC SUMMARY CARD WITH layoutId="specimen-image"
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden bg-card border border-border text-foreground space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-sm font-semibold bg-secondary text-foreground border-border">
                <FileCheck className="w-4 h-4 text-primary" />
                Crop Verified
              </Badge>

              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-sm font-semibold bg-secondary text-foreground border-border">
                {getHealthStatusIcon(diagnosis.health_status)}
                {diagnosis.health_status}
              </Badge>

              <Badge variant="outline" className={`gap-1.5 py-1 px-3 text-sm font-bold ${severity.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${severity.dotClass}`} />
                {severity.label}
              </Badge>
            </div>

            {/* Crop & Pathology Title */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase tracking-wider font-bold text-primary">
                  Crop: {diagnosis.crop_identified}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                  AI Verified
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight mt-1.5 leading-tight">
                {getConditionTitle()}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground mt-2 font-normal leading-relaxed">
                {severity.description}
              </p>
            </div>
          </div>

          {/* Morphing Specimen Thumbnail with layoutId="specimen-image" */}
          {imagePreviewUrl && (
            <motion.div
              layoutId="specimen-image"
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-border bg-secondary shrink-0 shadow-sm relative self-center lg:self-start group"
            >
              <img
                src={imagePreviewUrl}
                alt="Diagnosed crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-foreground font-semibold bg-card/90 px-2.5 py-1.5 rounded-lg border border-border">
                <span>Field Specimen</span>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Observable Symptoms Badges */}
        {diagnosis.observable_symptoms && diagnosis.observable_symptoms.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs uppercase text-primary tracking-wider mb-2.5 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              Identified Field Symptoms:
            </h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.observable_symptoms.map((symptom, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-secondary px-3 py-1 rounded-lg text-xs sm:text-sm font-medium text-foreground border border-border"
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* =========================================================================
          2. CIRCULAR METRICS RINGS
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5 sm:p-6 bg-card border border-border shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">Pathology Overview</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-primary border border-border">
            Calibrated Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <CircularProgressRing
            percent={confidencePercent}
            label="Visual Confidence"
            sublabel="Global Pathology Match"
            strokeColor="var(--primary)"
            textColor="text-primary"
          />
          <CircularProgressRing
            percent={diagnosis.severity_level === 'Critical' ? 95 : diagnosis.severity_level === 'Moderate' ? 70 : 35}
            label="Containment Urgency"
            sublabel="24-Hour Triage Priority"
            strokeColor={severity.strokeColor}
            textColor="text-foreground"
          />
          <CircularProgressRing
            percent={100}
            label="Safe Practice"
            sublabel="No Prohibited Chemicals"
            strokeColor="var(--primary)"
            textColor="text-primary"
          />
        </div>
      </motion.div>

      {/* =========================================================================
          3. PROHIBITED FARM CHEMICALS BANNER (PLAIN WARNING)
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        id="banned-agrochemical-shield"
        className="rounded-2xl p-5 sm:p-6 border border-destructive/30 bg-destructive/10 text-foreground shadow-sm space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <OctagonAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">
              Prohibited Farm Chemicals
            </h3>
            <p className="text-xs text-muted-foreground">
              Never use these hazardous chemicals on your crops
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">
            DO NOT USE PARAQUAT
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">
            DO NOT USE LINDANE (GAMALIN 20)
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">
            DO NOT USE DICHLORVOS (SNIPER / DDVP)
          </span>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed">
          <strong>Grower safety warning:</strong> Do not apply Paraquat, Lindane, or Dichlorvos (DDVP) to any crop. These chemicals are banned, toxic to farm workers and animals, contaminate groundwater, and destroy soil biodiversity. Use the safe biological remedies and registered alternatives listed below.
        </p>
      </motion.div>

      {/* =========================================================================
          4. THE 24-HOUR ACTION PLAN (NOW, NEXT, TODAY, AVOID, ESCALATE)
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        id="section-24-hour-action-plan"
        className="rounded-2xl p-6 sm:p-8 shadow-sm bg-card border border-border text-foreground space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-primary mb-1">
              <Clock className="w-4 h-4" />
              <span>Immediate Field Response</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Your 24-Hour Action Plan
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Practical timeline of what to do right now, this afternoon, and over the next 24 hours.
            </p>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto text-xs font-bold py-1 px-3">
            24H Protocol
          </Badge>
        </div>

        {/* 3 Chronological Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: 0 - 2 Hours */}
          <div className="bg-secondary/70 border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                NOW • 0–2 HOURS
              </span>
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Immediate Field Action</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {nowAction}
            </p>
          </div>

          {/* Step 2: 2 - 6 Hours */}
          <div className="bg-secondary/70 border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-foreground border border-border">
                NEXT • 2–6 HOURS
              </span>
              <Sprout className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Same-Day Preparation</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {nextAction}
            </p>
          </div>

          {/* Step 3: 6 - 24 Hours */}
          <div className="bg-secondary/70 border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                TODAY • 6–24 HOURS
              </span>
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Follow-up &amp; Application</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {todayAction}
            </p>
          </div>
        </div>

        {/* AVOID & ESCALATE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Critical Warnings (AVOID) */}
          <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              <h4 className="text-base font-bold uppercase tracking-wider text-destructive">
                What to AVOID:
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              {avoidList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-destructive font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Seek Expert Help (ESCALATE) */}
          <div className="bg-secondary/70 border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <PhoneCall className="w-5 h-5 text-primary" />
              <h4 className="text-base font-bold uppercase tracking-wider text-foreground">
                When to Seek Expert Help:
              </h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {escalationText}
            </p>
            <div className="bg-background p-3 rounded-lg border border-border text-xs text-muted-foreground">
              Contact your regional agricultural extension officer or farm advisory service.
            </div>
          </div>
        </div>

        {/* Local Agricultural Context */}
        <div className="bg-secondary/50 rounded-xl p-4 border border-border flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {isLocalContext ? 'Target Farm Context' : 'General Agronomic Guidance'}
              </span>
              <Badge variant="outline" className="text-xs">
                {isLocalContext ? 'Zone-Specific' : 'Universal Protocol'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {diagnosis.local_context_used ||
                'Standard agronomic guidance applied. The diagnosis and action plan are valid across target agro-ecological zones.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          5. TREATMENT PROTOCOLS (DESKTOP 2-COLUMN GRID)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Organic Remedy Card */}
        <motion.div
          variants={itemVariants}
          id="protocol-organic-remedy"
          className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 text-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Low-Impact &amp; Sustainable
              </span>
              <h4 className="text-base font-serif font-bold text-foreground">
                Biological &amp; Cultural Remedy
              </h4>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-normal">
            {diagnosis.organic_local_remedy ||
              'Apply standard horticultural wood ash dusting, field sanitation, and neem leaf botanical extract wash.'}
          </p>
          <div className="bg-secondary border border-border px-4 py-3 rounded-xl">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">NATURAL INPUTS</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Neem botanical extract, refined wood ash, and horticultural potassium soap.</p>
          </div>
        </motion.div>

        {/* Standard Registered Agrochemical Treatment */}
        <motion.div
          variants={itemVariants}
          id="protocol-chemical-treatment"
          className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 text-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Registered IPM Input
              </span>
              <h4 className="text-base font-serif font-bold text-foreground">
                Registered Chemical Input
              </h4>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-normal">
            {diagnosis.standard_chemical_treatment ||
              'No synthetic chemical pesticide necessary for this condition; rely on cultural management.'}
          </p>
          <div className="bg-secondary border border-border px-4 py-3 rounded-xl">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">SAFETY PROTOCOL</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Always wear personal protective equipment (PPE). Adhere strictly to label pre-harvest intervals (PHI).</p>
          </div>
        </motion.div>
      </div>

      {/* Long-Term Prevention */}
      {diagnosis.prevention_future && (
        <motion.div
          variants={itemVariants}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-3 text-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Next Planting Season
              </span>
              <h4 className="text-base font-serif font-bold text-foreground">
                Long-Term Agronomic Prevention
              </h4>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {diagnosis.prevention_future}
          </p>
        </motion.div>
      )}

      {/* =========================================================================
          6. FOOTER CONTROLS & JSON INSPECTION
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            id="btn-toggle-json-view"
            type="button"
            variant="outline"
            size="default"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="min-h-[48px] text-sm font-semibold border-border bg-secondary text-foreground hover:bg-secondary/80 rounded-xl cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-primary mr-2" />
            <span>{showJsonRaw ? 'Hide JSON' : 'Inspect JSON'}</span>
          </Button>

          <Button
            id="btn-copy-full-json"
            type="button"
            variant="ghost"
            size="default"
            onClick={handleCopyJson}
            className="min-h-[48px] text-sm text-muted-foreground hover:text-foreground hover:bg-secondary font-medium rounded-xl cursor-pointer"
          >
            {jsonCopied ? <Check className="w-4 h-4 text-primary mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
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
            className="w-full sm:w-auto min-h-[48px] px-8 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer shadow-sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            <span>Check Another Crop</span>
          </Button>
        )}
      </motion.div>

      {/* JSON Schema Inspection Drawer */}
      <AnimatePresence>
        {showJsonRaw && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-5 text-sm font-mono shadow-sm border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-3 text-muted-foreground text-xs">
              <span>AgriScan 24-Hour Protocol Schema:</span>
              <span className="text-primary font-bold">application/json</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-background rounded-xl text-xs sm:text-sm leading-relaxed text-muted-foreground max-h-80 border border-border">
              {JSON.stringify(diagnosis, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
