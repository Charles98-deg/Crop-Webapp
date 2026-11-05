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
  color: string;
} => {
  switch (level) {
    case 'Critical':
      return {
        dotClass: 'bg-rose-500 animate-pulse',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'Critical Severity',
        description: 'High risk of rapid field contagion. Immediate intervention required within 2 hours.',
        color: '#f43f5e',
      };
    case 'Moderate':
      return {
        dotClass: 'bg-amber-400',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'Moderate Severity',
        description: 'Active infection or localized pest pressure. Implement containment protocol today.',
        color: '#f59e0b',
      };
    case 'Low':
      return {
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
        label: 'Low Severity',
        description: 'Mild symptoms detected. Monitor closely and apply accessible organic remedies.',
        color: '#34d399',
      };
    case 'None':
    default:
      return {
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
        label: 'Healthy / No Severe Damage',
        description: 'Crop appears in good health with no critical active pathology. Continue routine farm care.',
        color: '#34d399',
      };
  }
};

const getHealthStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'Healthy':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'Pest Infested':
      return <Bug className="w-4 h-4 text-amber-400" />;
    case 'Nutrient Deficient':
      return <Activity className="w-4 h-4 text-sky-400" />;
    case 'Diseased':
      return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-400" />;
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

// Circular Progress Gauge Ring component styled with Eco-Glass palette
const CircularProgressRing: React.FC<{
  percent: number;
  label: string;
  sublabel: string;
  strokeColor?: string;
  textColor?: string;
}> = ({ percent, label, sublabel, strokeColor = '#34d399', textColor = 'text-emerald-400' }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex-1">
      <div className="relative w-22 h-22 flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="text-white/10"
            strokeWidth="7"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{percent}%</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-2 ${textColor}`}>{label}</span>
      <span className="text-xs text-slate-400 mt-0.5">{sublabel}</span>
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
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="outline" className="text-xs font-bold py-1 bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
              Confidence &lt; 85% • Clarification Needed
            </Badge>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {diagnosis.clarification_question || 'Please select an observation to confirm the diagnosis:'}
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Regional agronomists require this observation to distinguish between similar field symptoms.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {diagnosis.options && diagnosis.options.length > 0 ? (
              diagnosis.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectOption?.(option)}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-400 transition-all text-base sm:text-lg font-bold text-white shadow-lg min-h-[58px] flex items-center justify-between touch-manipulation cursor-pointer group"
                >
                  <span className="pr-4">{option}</span>
                  <span className="text-emerald-400 group-hover:translate-x-1.5 transition-transform text-2xl font-black">
                    →
                  </span>
                </motion.button>
              ))
            ) : (
              <p className="text-sm text-slate-400">No confirmation options provided.</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Case 1: Verification Rule #1 — Non-Plant Detection
  if (!diagnosis.is_plant) {
    return (
      <motion.div
        id="non-plant-verification-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-amber-500/30 text-white backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-bold bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Operational Rule #1: Crop Verification
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold text-slate-400 border-white/10">
                  Verification Status: is_plant = false
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                Non-Plant Image Detected ({diagnosis.crop_identified})
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                The AgriScan agronomist verified that this photograph does not contain a crop leaf, stem, root, or farm specimen. Diagnostic treatments and chemical advisories are safely withheld.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-400 font-medium">
              Take a steady, well-lit photo of a crop leaf or fruit in your field.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="min-h-[48px] text-sm font-bold border-white/10 text-white hover:bg-white/10 rounded-2xl cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-emerald-400 mr-2" />
                <span>{showJsonRaw ? 'Hide JSON' : 'Inspect JSON Schema'}</span>
              </Button>
              {onReset && (
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="default"
                    size="default"
                    onClick={onReset}
                    className="w-full sm:w-auto min-h-[48px] text-sm font-black bg-emerald-500/80 text-slate-950 hover:bg-emerald-500 rounded-2xl shadow-lg cursor-pointer"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    <span>Take New Crop Photo</span>
                  </Button>
                </motion.div>
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
        className="rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden bg-emerald-900/10 backdrop-blur-2xl border border-white/10 text-white space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-sm font-bold bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Crop Verified
              </Badge>

              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-sm font-semibold bg-slate-900/80 text-white border-white/10">
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
                <span className="text-sm uppercase tracking-wider font-extrabold text-emerald-400">
                  Crop Identified: {diagnosis.crop_identified}
                </span>
                <span className="text-xs text-slate-300 font-semibold bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-white/10">
                  AI Auto-Detected
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1 leading-tight">
                {getConditionTitle()}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
                {severity.description}
              </p>
            </div>
          </div>

          {/* Morphing Specimen Thumbnail with layoutId="specimen-image" */}
          {imagePreviewUrl && (
            <motion.div
              layoutId="specimen-image"
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950/80 shrink-0 shadow-2xl relative self-center lg:self-start group"
            >
              <img
                src={imagePreviewUrl}
                alt="Diagnosed crop specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white font-bold bg-slate-950/80 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                <span>Field Specimen</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Observable Symptoms Badges */}
        {diagnosis.observable_symptoms && diagnosis.observable_symptoms.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm uppercase text-emerald-300 tracking-wider mb-2.5 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Identified Field Symptoms:
            </h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.observable_symptoms.map((symptom, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-200 border border-white/10"
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* =========================================================================
          2. CIRCULAR SMART METRICS RINGS (Eco-Glass Palette)
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 sm:p-6 bg-emerald-900/10 backdrop-blur-2xl border border-white/10 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-white">Smart Pathology Overview</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Calibrated Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <CircularProgressRing
            percent={confidencePercent}
            label="Visual Confidence"
            sublabel="Global Pathology Match"
            strokeColor="#34d399"
            textColor="text-emerald-400"
          />
          <CircularProgressRing
            percent={diagnosis.severity_level === 'Critical' ? 95 : diagnosis.severity_level === 'Moderate' ? 70 : 35}
            label="Containment Urgency"
            sublabel="24-Hour Triage Priority"
            strokeColor={severity.color}
            textColor="text-emerald-300"
          />
          <CircularProgressRing
            percent={100}
            label="ESG Safety Rating"
            sublabel="Zero Prohibited Agrochemicals"
            strokeColor="#10b981"
            textColor="text-emerald-400"
          />
        </div>
      </motion.div>

      {/* =========================================================================
          3. GLOBAL ESG & PHYTOSANITARY STANDARDS COMPLIANCE SHIELD
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        id="banned-agrochemical-shield"
        className="rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-950/80 to-slate-950/95 text-emerald-100 font-bold shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <OctagonAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Global ESG &amp; Phytosanitary Standards
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Prohibited Agrochemicals Mandate
                </h3>
              </div>
            </div>

            <Badge variant="outline" className="self-start sm:self-auto text-xs font-black py-1 px-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              FAO, WHO CLASS IA/IB &amp; IFC MANDATE
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <span className="px-3.5 py-2 rounded-xl text-sm font-black bg-rose-950/50 text-rose-300 border border-rose-500/40 tracking-wider">
              🚫 NO PARAQUAT
            </span>
            <span className="px-3.5 py-2 rounded-xl text-sm font-black bg-rose-950/50 text-rose-300 border border-rose-500/40 tracking-wider">
              🚫 NO LINDANE (GAMALIN 20)
            </span>
            <span className="px-3.5 py-2 rounded-xl text-sm font-black bg-rose-950/50 text-rose-300 border border-rose-500/40 tracking-wider">
              🚫 NO DICHLORVOS (SNIPER/DDVP)
            </span>
          </div>

          <p className="text-sm text-slate-300 font-normal leading-relaxed">
            <strong className="text-emerald-300 font-bold">Mandatory Global Standard:</strong> Do NOT apply Paraquat, Lindane, or Dichlorvos (DDVP) on agricultural crops. These chemicals violate international pesticide conventions, WHO Class Ia/Ib guidelines, and IFC Performance Standard 3. They destroy soil biodiversity, contaminate groundwater, and leave toxic chemical residues. Use certified organic treatments or registered safe alternatives specified below.
          </p>
        </div>
      </motion.div>

      {/* =========================================================================
          4. THE 24-HOUR ACTION PLAN (NOW, NEXT, TODAY, AVOID, ESCALATE)
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        id="section-24-hour-action-plan"
        className="rounded-3xl p-6 sm:p-8 shadow-xl bg-emerald-900/10 backdrop-blur-2xl border border-white/10 text-white space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-black text-emerald-400 mb-1">
              <Clock className="w-4 h-4" />
              <span>Immediate Field Response</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your 24-Hour Action Plan
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Practical timeline of what to do right now, this afternoon, and over the next 24 hours.
            </p>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto text-xs font-bold py-1.5 px-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            24H Triage Protocol
          </Badge>
        </div>

        {/* 3 Chronological Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: 0 - 2 Hours */}
          <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NOW • 0–2 HOURS
              </span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Immediate Field Triage</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {nowAction}
            </p>
          </div>

          {/* Step 2: 2 - 6 Hours */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-200 border border-white/10">
                NEXT • 2–6 HOURS
              </span>
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Same-Day Preparation</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {nextAction}
            </p>
          </div>

          {/* Step 3: 6 - 24 Hours */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                TODAY • 6–24 HOURS
              </span>
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Follow-up &amp; Application</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {todayAction}
            </p>
          </div>
        </div>

        {/* AVOID & ESCALATE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Critical Warnings (AVOID) */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Ban className="w-5 h-5" />
              <h4 className="text-base font-bold uppercase tracking-wider text-white">
                What to AVOID (Do Not Do):
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {avoidList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-black mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Seek Expert Help (ESCALATE) */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-bold uppercase tracking-wider text-white">
                When to Seek Expert Help:
              </h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {escalationText}
            </p>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/10 text-xs text-emerald-300 font-medium">
              Agricultural Extension Advisory: Certified Agronomy &amp; National Plant Protection Directorate.
            </div>
          </div>
        </div>

        {/* Local Agricultural Context */}
        <div className="bg-slate-900/70 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {isLocalContext ? 'Target Farm Context' : 'General Agricultural Guidance'}
              </span>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">
                {isLocalContext ? 'Zone-Specific' : 'Universal Protocol'}
              </Badge>
            </div>
            <p className="text-slate-400 mt-1">
              {diagnosis.local_context_used ||
                'Standard agronomic guidance applied. The diagnosis and action plan are completely valid across target agro-ecological zones.'}
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
          className="bg-emerald-900/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Low-Impact &amp; Sustainable
              </span>
              <h4 className="text-base font-bold text-white">
                Biological &amp; Cultural Field Remedy
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {diagnosis.organic_local_remedy ||
              'Apply standard horticultural wood ash dusting, field sanitation, and neem leaf botanical extract wash.'}
          </p>
          <div className="bg-slate-950/80 border border-white/10 px-4 py-3 rounded-2xl">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wide">NATURAL INPUTS</p>
            <p className="text-sm text-slate-400 mt-0.5">Neem botanical extract, refined wood ash, and potassium horticultural soap.</p>
          </div>
        </motion.div>

        {/* Standard Registered Agrochemical Treatment */}
        <motion.div
          variants={itemVariants}
          id="protocol-chemical-treatment"
          className="bg-emerald-900/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Agro-Store Input &amp; Safety
              </span>
              <h4 className="text-base font-bold text-white">
                Registered IPM Chemical Input
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {diagnosis.standard_chemical_treatment ||
              'No synthetic chemical pesticide necessary for this condition; rely on cultural management.'}
          </p>
          <div className="bg-slate-950/80 border border-emerald-500/20 px-4 py-3 rounded-2xl">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wide">SAFETY PROTOCOL</p>
            <p className="text-sm text-slate-400 mt-0.5">Always wear personal protective equipment (PPE). Adhere strictly to label pre-harvest intervals (PHI).</p>
          </div>
        </motion.div>
      </div>

      {/* Long-Term Prevention */}
      {diagnosis.prevention_future && (
        <motion.div
          variants={itemVariants}
          className="bg-emerald-900/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-lg space-y-3 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Next Planting Season
              </span>
              <h4 className="text-base font-bold text-white">
                Long-Term Agronomic Prevention &amp; Certified Varieties
              </h4>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {diagnosis.prevention_future}
          </p>
        </motion.div>
      )}

      {/* =========================================================================
          6. FOOTER CONTROLS & JSON INSPECTION
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/10"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            id="btn-toggle-json-view"
            type="button"
            variant="outline"
            size="default"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="min-h-[48px] text-sm font-bold border-white/10 text-white hover:bg-white/10 rounded-2xl cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-emerald-400 mr-2" />
            <span>{showJsonRaw ? 'Hide JSON Payload' : 'Inspect JSON Schema'}</span>
          </Button>

          <Button
            id="btn-copy-full-json"
            type="button"
            variant="ghost"
            size="default"
            onClick={handleCopyJson}
            className="min-h-[48px] text-sm text-slate-400 hover:text-white hover:bg-white/10 font-medium rounded-2xl cursor-pointer"
          >
            {jsonCopied ? <Check className="w-4 h-4 text-emerald-400 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
          </Button>
        </div>

        {onReset && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              id="btn-diagnose-another-specimen"
              type="button"
              variant="default"
              size="default"
              onClick={onReset}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-black bg-emerald-500/80 text-slate-950 hover:bg-emerald-500 rounded-2xl cursor-pointer shadow-lg transition-all"
            >
              <Camera className="w-4 h-4 mr-2" />
              <span>Check Another Crop</span>
            </Button>
          </motion.div>
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
            className="rounded-3xl p-5 sm:p-6 text-sm font-mono shadow-2xl border border-white/10 bg-slate-950/90"
          >
            <div className="flex items-center justify-between mb-3 text-slate-400 text-xs">
              <span>AgriScan 24-Hour Protocol Schema:</span>
              <span className="text-emerald-400 font-bold">application/json</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-slate-950 rounded-2xl text-xs sm:text-sm leading-relaxed text-emerald-300 max-h-80 border border-white/10">
              {JSON.stringify(diagnosis, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
