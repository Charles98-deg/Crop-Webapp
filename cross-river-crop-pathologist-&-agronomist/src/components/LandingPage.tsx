import React, { useState, useEffect } from 'react';
import {
  Scan,
  Leaf,
  ShieldCheck,
  Volume2,
  WifiOff,
  MapPin,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Sprout,
  FlaskConical,
  Download,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  Users,
  Menu,
  X,
  Compass,
  Radio,
} from 'lucide-react';
import { ConnectivityStatus } from './ConnectivityStatus';

interface LandingPageProps {
  onLaunchScanner?: () => void;
}

type CropKey = 'cassava' | 'cocoa' | 'oilpalm' | 'maize';

interface MockDiagnosisData {
  crop: string;
  lga: string;
  pathology: string;
  confidence: number;
  severity: 'Critical' | 'Moderate' | 'Low';
  symptoms: string[];
  pidginSummary: string;
  organicRemedy: string;
  chemicalRemedy: string;
  imageAlt: string;
}

const MOCK_DIAGNOSES: Record<CropKey, MockDiagnosisData> = {
  cassava: {
    crop: 'Cassava',
    lga: 'Odukpani LGA',
    pathology: 'Cassava Mosaic Disease (CMD)',
    confidence: 94,
    severity: 'Moderate',
    symptoms: ['Severe chlorotic leaf distortion', 'Stunted stem elongation', 'Whitefly nymph infestation on undersides'],
    pidginSummary: 'Abeg make una hear: Dis cassava get Cassava Mosaic sickness. Cut and burn di bad leaves fast make di sickness no jump go anoda cassava mound. Den mix Dongoyaro leaf water wash di healthy stems.',
    organicRemedy: 'Cut and burn heavily infected foliage (sanitation rouging). Spray cold-steeped neem (Dongoyaro) seed/leaf extract + local black soap twice weekly to repel Bemisia whitefly vectors.',
    chemicalRemedy: 'Imidacloprid 200 SL (15ml / 15L knapsack) applied strictly to field perimeter to check vector population.',
    imageAlt: 'Cassava leaf showing yellow chlorotic mosaic patterning'
  },
  cocoa: {
    crop: 'Cocoa',
    lga: 'Ikom Cocoa Belt',
    pathology: 'Black Pod Disease (Phytophthora)',
    confidence: 96,
    severity: 'Critical',
    symptoms: ['Brown water-soaked lesion on pod surface', 'White fungal sporulation under heavy humidity', 'Pod shriveling'],
    pidginSummary: 'Warning! Dis cocoa pod don catch Black Pod disease. Pick all black pods throw way or burn dem far from farm. Prune high canopy make breeze and sunlight enter di farm well-well.',
    organicRemedy: 'Immediate phytosanitary harvesting: strip and bury all mummified pods under 30cm soil. Dust hearth wood ash at stem base. Prune shade trees to increase aeration.',
    chemicalRemedy: 'Copper Hydroxide or Metalaxyl + Mancozeb (Ridomil Gold) at 50g per 15L knapsack sprayer, repeated every 21 days in rainy season.',
    imageAlt: 'Cocoa pod with dark spreading necrotic rot'
  },
  oilpalm: {
    crop: 'Oil Palm',
    lga: 'Akamkpa LGA',
    pathology: 'Cercospora Leaf Spot (Freckle)',
    confidence: 91,
    severity: 'Moderate',
    symptoms: ['Dark brown circular lesions with chlorotic halos', 'Premature frond desiccation in nursery seedlings'],
    pidginSummary: 'Dis young palm frond get Leaf Spot. Stop to dey splash muddy nursery water for di leaves. Prune dry bottom leaves and scatter wood ash for di soil base.',
    organicRemedy: 'Improve seedling nursery spacing to 60cm. Apply wood ash around nursery polybags to supply soluble potassium and reduce splash dispersal of fungal conidia.',
    chemicalRemedy: 'Mancozeb 80% WP (30g per 15L water) applied during early morning nursery rounds before noon heat.',
    imageAlt: 'Oil palm frond with dark circular necrotic spots'
  },
  maize: {
    crop: 'Maize',
    lga: 'Calabar Municipal / Odukpani',
    pathology: 'Fall Armyworm (Spodoptera frugiperda)',
    confidence: 97,
    severity: 'Critical',
    symptoms: ['Window-pane leaf skeletonization', 'Frass (sawdust-like droppings) packed in leaf whorls', 'Damaged growing tip'],
    pidginSummary: 'Wahala dey! Fall Armyworm caterpillars dey chop inside di maize funnel. Drop dry wood ash or fine sand mixed with chili pepper inside di maize center make di worm suffocate.',
    organicRemedy: 'Hand-drop a pinch of dry sieved hearth ash mixed with fine river sand and crushed dry cayenne pepper directly into each infected whorl funnel.',
    chemicalRemedy: 'Emamectin benzoate 5% WDG (10g / 15L knapsack) directed straight into the vegetative whorl funnel late in the evening when larvae feed.',
    imageAlt: 'Maize whorl damaged with armyworm feeding holes'
  }
};

const BACKGROUND_IMAGES = [
  '/images/media_1788672011845.jpg', // Section 1 (Hero): Lush Cross River cassava/cocoa field with morning sun
  '/images/media_1788672012365.jpg', // Section 2 (Experience/Mockup): Farmer inspecting a crop in the field
  '/images/media_1788672012877.jpg', // Section 3 (3 Quick Steps): Close-up hands examining leaf health
  '/images/media_1788672013386.jpg', // Section 4 (Crop Matrix): Cocoa pod & cassava harvest imagery
  '/images/media_1788672013662.jpg', // Section 5 (Innovations & PWA Install): Modern agricultural community view
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchScanner }) => {
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('cassava');
  const [activeSpecimenTab, setActiveSpecimenTab] = useState<CropKey>('cassava');
  const [isPlayingPidgin, setIsPlayingPidgin] = useState<boolean>(false);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [pwaPlatform, setPwaPlatform] = useState<'android' | 'ios'>('android');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [copiedPidgin, setCopiedPidgin] = useState<boolean>(false);
  const [pwaInstalledToast, setPwaInstalledToast] = useState<boolean>(false);
  const [showCoopModal, setShowCoopModal] = useState<boolean>(false);
  const [coopSubmitted, setCoopSubmitted] = useState<boolean>(false);

  // Active section for background slideshow
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  useEffect(() => {
    const visibleSections = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rawIndex = entry.target.getAttribute('data-section-index');
          if (rawIndex !== null) {
            const index = Number(rawIndex);
            if (!isNaN(index)) {
              if (entry.isIntersecting) {
                visibleSections.set(index, entry.intersectionRatio);
              } else {
                visibleSections.delete(index);
              }
            }
          }
        });

        let bestIndex = -1;
        let maxRatio = -1;
        visibleSections.forEach((ratio, idx) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            bestIndex = idx;
          }
        });

        if (bestIndex !== -1) {
          setActiveSectionIndex(bestIndex);
        }
      },
      {
        threshold: [0.1, 0.25, 0.4, 0.6, 0.8],
        rootMargin: '-10% 0px -15% 0px',
      }
    );

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeDiagnosis = MOCK_DIAGNOSES[activeSpecimenTab];

  const handleLaunchScanner = () => {
    if (onLaunchScanner) {
      onLaunchScanner();
    } else {
      const el = document.getElementById('app') || document.getElementById('scanner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePlayPidginMock = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingPidgin) {
        window.speechSynthesis.cancel();
        setIsPlayingPidgin(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeDiagnosis.pidginSummary);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingPidgin(false);
      utterance.onerror = () => setIsPlayingPidgin(false);
      setIsPlayingPidgin(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingPidgin(!isPlayingPidgin);
      setTimeout(() => setIsPlayingPidgin(false), 5000);
    }
  };

  const handleCopyPidgin = async () => {
    try {
      await navigator.clipboard.writeText(activeDiagnosis.pidginSummary);
      setCopiedPidgin(true);
      setTimeout(() => setCopiedPidgin(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSimulateInstall = () => {
    setPwaInstalledToast(true);
    setTimeout(() => setPwaInstalledToast(false), 3500);
  };

  return (
    <div className="relative isolate min-h-screen text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* =========================================================================
          PERSISTENT FULL-PAGE BACKGROUND: Fixed Root Container with Dark Overlay
          ========================================================================= */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none bg-slate-950">
        {BACKGROUND_IMAGES.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700 ease-in-out will-change-transform ${
              activeSectionIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              transitionProperty: 'opacity, transform',
              transitionDuration: '700ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}

        {/* Dark gradient overlays for high text contrast & legibility */}
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
      </div>

      {/* Toast for PWA installation simulation */}
      {pwaInstalledToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600/90 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <div>
            <p className="text-xs font-bold">AgriScan Cross River Added</p>
            <p className="text-[11px] text-emerald-100">Ready to diagnose in the field without internet!</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          HEADER / NAVBAR: Glassmorphic Floating Top Bar
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 transition-all text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Brand logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg border border-emerald-400/30">
              <div className="relative">
                <Leaf className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-emerald-700 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="font-bold text-lg sm:text-xl tracking-tight text-white drop-shadow-sm"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AgriScan
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cross River
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 hidden sm:block font-medium">
                AI Plant Pathology • Ikom • Calabar • Odukpani • Akamkpa
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-200">
            <a
              href="#how-it-works"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              How It Works
            </a>
            <a
              href="#supported-crops"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Supported Crops
            </a>
            <a
              href="#innovations"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Key Innovations
            </a>
            <a
              href="#pwa-install"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Install PWA
            </a>
            <button
              type="button"
              onClick={() => setShowCoopModal(true)}
              className="hover:text-emerald-400 transition-colors text-left"
            >
              For Cooperatives
            </button>
          </nav>

          {/* Primary CTA buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowPwaModal(true)}
              className="hidden lg:inline-flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-sm"
              title="Install progressive web app"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get PWA</span>
            </button>

            <button
              id="header-btn-launch-scanner"
              type="button"
              onClick={handleLaunchScanner}
              className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-lg shadow-emerald-950/50 group transition-all"
            >
              <Scan className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>Launch Scanner</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-white/15 px-4 py-4 space-y-3 shadow-2xl">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-200 hover:text-emerald-300"
            >
              How It Works (3 Steps)
            </a>
            <a
              href="#supported-crops"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-200 hover:text-emerald-300"
            >
              Supported Crops & Disease Matrix
            </a>
            <a
              href="#innovations"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-200 hover:text-emerald-300"
            >
              Key Innovations (Voice, Offline, Surveillance)
            </a>
            <a
              href="#pwa-install"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-200 hover:text-emerald-300"
            >
              Install PWA on Phone
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowCoopModal(true);
              }}
              className="block w-full text-left py-2 text-sm font-semibold text-emerald-400"
            >
              For Cooperatives & Ministry Extension
            </button>
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLaunchScanner();
                }}
                className="w-full py-3 rounded-xl font-bold text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg"
              >
                <Scan className="w-4 h-4 text-emerald-200" />
                <span>Open Disease Scanner Now</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 1 (Hero): Lush Cross River cassava/cocoa field with morning sun
          ========================================================================= */}
      <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden scroll-section flex flex-col justify-between" data-section-index={0}>
        <div className="relative z-10 flex flex-col justify-between flex-1 pt-12 sm:pt-16 pb-8 sm:pb-12">
          {/* Top Spacer */}
          <div />

          {/* Center: Main Word & Primary Value Hook */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 my-auto">
            {/* Micro Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-emerald-300 text-xs sm:text-sm font-semibold shadow-lg">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-white/95">Tuned for Cross River Soils & Tropical Microclimates</span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.08] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Save Your Harvest in <span className="text-emerald-300 italic">5 Seconds</span> Using AI.
            </h1>

            {/* Clear Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Snap a photo of your cassava, cocoa, or maize leaf. Get instant, locally accessible remedies in plain English and Nigerian Pidgin.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                id="hero-btn-scan-leaf"
                type="button"
                onClick={handleLaunchScanner}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-950/60 active:scale-95 group border border-emerald-400/40 ring-4 ring-emerald-500/20 transition-all"
              >
                <Scan className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>Scan a Leaf Now</span>
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-install-pwa"
                type="button"
                onClick={() => setShowPwaModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md text-white border border-white/30 text-base font-bold rounded-2xl shadow-lg hover:border-white/60 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Install Free App</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">100% Free</strong> for all smallholders
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-md">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">2G / 3G Ultra-light</strong> (&lt;300KB)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-md">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">Local Organic</strong> (Neem, Ash, Spacing)
              </span>
            </div>
          </div>

          {/* Bottom Floating Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between pt-6">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-200 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cross River Agricultural Surveillance Active</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                Section 1 of 5 • Cross River Field
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 (Experience/Mockup): Farmer inspecting a crop in the field
          ========================================================================= */}
      <section className="py-16 sm:py-24 scroll-section relative" data-section-index={1}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 drop-shadow-sm">
              Live Pathology Preview
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Experience AgriScan Diagnosis & Nigerian Pidgin Voice
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed drop-shadow-sm">
              Select a crop specimen below to test our multimodal diagnosis engine, confidence score, and voice guidance before launching the scanner.
            </p>
          </div>

          {/* Interactive Mobile Mockup Card with Frosted Glassmorphism */}
          <div className="max-w-md mx-auto bg-slate-900/65 backdrop-blur-xl rounded-[36px] p-4 sm:p-5 shadow-2xl border border-white/20 relative ring-1 ring-white/10">
            {/* Phone Top Notch / Speaker bar */}
            <div className="flex items-center justify-between px-3 pb-3 border-b border-white/15 text-[10px] text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Leaf className="w-3 h-3 text-emerald-400" />
                AGRISCAN LIVE AI
              </span>
              <span>9:41 AM • 3G IKOM</span>
            </div>

            {/* Specimen Switcher inside Mockup */}
            <div className="my-3 flex items-center justify-between gap-1 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
              {(['cassava', 'cocoa', 'oilpalm', 'maize'] as CropKey[]).map((cKey) => (
                <button
                  key={cKey}
                  type="button"
                  onClick={() => setActiveSpecimenTab(cKey)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    activeSpecimenTab === cKey
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cKey === 'oilpalm' ? 'Palm' : cKey}
                </button>
              ))}
            </div>

            {/* Mock Card Preview */}
            <div className="bg-slate-950/60 backdrop-blur-md rounded-[24px] p-4 border border-white/15 space-y-3 relative overflow-hidden text-white">
              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Plant Verified
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    activeDiagnosis.severity === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {activeDiagnosis.severity} Risk
                </span>
              </div>

              {/* Diagnosis title */}
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {activeDiagnosis.crop} • {activeDiagnosis.lga}
                </span>
                <h3
                  className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {activeDiagnosis.pathology}
                </h3>
              </div>

              {/* Confidence meter */}
              <div className="bg-white/10 backdrop-blur-md text-white p-2.5 rounded-xl flex items-center justify-between text-xs border border-white/10">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">AI Confidence:</span>
                <span className="font-bold text-emerald-300">{activeDiagnosis.confidence}% Match</span>
              </div>

              {/* Interactive Pidgin Audio Button */}
              <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    Pidgin Field Audio
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPidgin}
                    className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedPidgin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPidgin ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs font-serif italic text-slate-200 line-clamp-2 leading-relaxed">
                  &quot;{activeDiagnosis.pidginSummary}&quot;
                </p>
                <button
                  type="button"
                  onClick={handlePlayPidginMock}
                  className="w-full inline-flex items-center justify-center font-bold text-xs gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                >
                  {isPlayingPidgin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingPidgin ? 'Playing Spoken Pidgin...' : 'Listen in Nigerian Pidgin'}</span>
                </button>
              </div>

              {/* Immediate Organic Action Preview */}
              <div className="bg-emerald-950/40 backdrop-blur-sm p-2.5 rounded-xl border border-emerald-500/30 text-[11px] text-slate-200">
                <span className="font-bold text-emerald-300 block text-[10px] uppercase">
                  Instant Organic Treatment:
                </span>
                <p className="line-clamp-2 mt-0.5 text-slate-300">{activeDiagnosis.organicRemedy}</p>
              </div>
            </div>

            {/* Bottom Mock Phone Action */}
            <div className="mt-3 pt-2 text-center">
              <button
                type="button"
                onClick={handleLaunchScanner}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Try Real Scanner on Your Device</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 (3 Quick Steps): Close-up hands examining leaf health
          ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 scroll-section relative" data-section-index={2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Header */}
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 drop-shadow-sm">
              Simple Rural Workflow
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              How AgriScan Works in 3 Quick Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-sm">
              Built to operate right inside mobile Chrome or Safari—no 50MB app store download, no registration barrier, and no fees.
            </p>
          </div>

          {/* 3 Steps Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
            {/* Step 1 */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/15 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Scan className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-white/30 font-mono group-hover:text-white/50 transition-colors">01</span>
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Snap the Leaf
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Take a clear photo of the troubled leaf, stem, or fruit directly in your mobile browser. On-device canvas compression reduces upload size below 300 KB for rural 2G/3G connectivity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Works on any Android or iPhone camera</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/15 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-white/30 font-mono group-hover:text-white/50 transition-colors">02</span>
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AI Multimodal Diagnosis
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our Gemini-powered vision model analyzes chlorosis patterns, necrotic blight spots, or pest frass in under 3 seconds. It checks plant authenticity first and scores severity risk.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Calibrated for Cross River soil profiles</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/15 shadow-xl relative flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-white/30 font-mono group-hover:text-white/50 transition-colors">03</span>
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Treat, Protect & Listen
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Receive immediate organic remedies using ingredients you already have (neem leaf slurry, hearth wood ash, sanitation spacing) plus registered agrochemical fallbacks and a Pidgin voice readout.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-cyan-300 font-bold">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Instant audio playback for field workers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 (Crop Matrix): Cocoa pod & cassava harvest imagery
          ========================================================================= */}
      <section id="supported-crops" className="py-16 sm:py-24 scroll-section relative" data-section-index={3}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 drop-shadow-sm">
              Cross River Agricultural Baseline
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Primary Crops & Field Pathology Matrix
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-sm">
              Every diagnosis prioritizes low-cost, local remedies (neem slurry, wood ash barriers, prompt sanitation pruning) before prescribing costly agro-chemicals.
            </p>
          </div>

          {/* Crop Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 pb-2">
            {[
              { id: 'cassava', name: 'Cassava (Akpu / Garri)', region: 'Odukpani & Akamkpa' },
              { id: 'cocoa', name: 'Cocoa', region: 'Ikom Cocoa Belt' },
              { id: 'oilpalm', name: 'Oil Palm', region: 'Akamkpa & Calabar' },
              { id: 'maize', name: 'Maize (Oka)', region: 'Statewide' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCrop(tab.id as CropKey)}
                className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center gap-2.5 transition-all shadow-md ${
                  selectedCrop === tab.id
                    ? 'bg-emerald-600 text-white border border-emerald-400/40 shadow-emerald-950/50'
                    : 'bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/15 hover:bg-slate-800/80 hover:text-white hover:border-white/30'
                }`}
              >
                <Leaf className={`w-4 h-4 ${selectedCrop === tab.id ? 'text-emerald-200' : 'text-emerald-400'}`} />
                <span>{tab.name}</span>
                <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({tab.region})</span>
              </button>
            ))}
          </div>

          {/* Active Crop Disease & Treatment Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Target Specimen: {selectedCrop.toUpperCase()}
                </span>
                <h3
                  className="text-xl sm:text-2xl font-bold text-white mt-0.5"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {MOCK_DIAGNOSES[selectedCrop].pathology}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium">Prevalent in:</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15">
                  {MOCK_DIAGNOSES[selectedCrop].lga}
                </span>
              </div>
            </div>

            {/* Matrix Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Observable Symptoms */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Observable Symptoms
                </h4>
                <div className="space-y-2">
                  {MOCK_DIAGNOSES[selectedCrop].symptoms.map((symptom, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Organic & Accessible Local Remedies */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  1. Local Organic Remedy (Priority)
                </h4>
                <div className="bg-emerald-950/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    HEARTH ASH & NEEM SLURRY
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {MOCK_DIAGNOSES[selectedCrop].organicRemedy}
                  </p>
                </div>
              </div>

              {/* Column 3: Standard Agrochemical Treatment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-slate-300" />
                  2. Registered Agrochemical (Fallback)
                </h4>
                <div className="bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/20 text-[10px] font-bold">
                    LOCAL AGRO-DEALER STOCK
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {MOCK_DIAGNOSES[selectedCrop].chemicalRemedy}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick launch banner for this crop */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-300">
                Have a leaf showing these symptoms right now in your farm?
              </span>
              <button
                type="button"
                onClick={handleLaunchScanner}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all"
              >
                <Scan className="w-4 h-4 text-emerald-200" />
                <span>Scan {MOCK_DIAGNOSES[selectedCrop].crop} Leaf Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 (Innovations & PWA Install): Modern agricultural community view
          ========================================================================= */}
      <section id="innovations" className="py-16 sm:py-24 scroll-section relative" data-section-index={4}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 drop-shadow-sm">
              Tailored Engineering for West Africa
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              3 Key Innovations Built Specifically for Nigeria
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-sm">
              Generic AI vision models fail in rural farms. AgriScan is architected from the ground up for Nigerian field conditions, dialect diversity, and intermittent networks.
            </p>
          </div>

          {/* 3 Innovation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Innovation 1: Pidgin Voice Readout */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/15 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  1. Pidgin Voice Readout
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Listen to exact treatment dosages with one tap. Instructions are generated in natural Nigerian Pidgin so non-literate field hands and elderly farmers can hear and follow protocols without misunderstanding.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handlePlayPidginMock}
                  className="w-full inline-flex items-center justify-center gap-2 font-bold text-xs py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Nigerian Voice Audio</span>
                </button>
              </div>
            </div>

            {/* Innovation 2: Low-Data & Offline First */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/15 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <WifiOff className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  2. Low-Data & Offline First
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Native browser canvas algorithms compress camera captures below 300 KB before transmission, saving farmer data costs. All previous scans remain stored in offline IndexedDB cache when scouting remote bush tracts.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Bandwidth Savings:</span>
                <span className="font-bold text-emerald-400">&gt;85% Compression</span>
              </div>
            </div>

            {/* Innovation 3: State Epidemic Surveillance */}
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/15 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 hover:bg-slate-900/75 transition-all text-white group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  3. Epidemic Surveillance
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Anonymous geotagged scans cluster into early outbreak warnings for agricultural extension teams across Ikom, Akamkpa, and Odukpani—allowing regional quarantine before blights destroy community food supply.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Cooperative Alert:</span>
                <span className="font-bold text-amber-300">Real-Time Mapping</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PWA Installation Guide (Shares Index 4 with Section 5)
          ========================================================================= */}
      <section id="pwa-install" className="py-16 sm:py-24 scroll-section relative" data-section-index={4}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/75 backdrop-blur-2xl text-white rounded-[36px] p-8 sm:p-12 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Background art glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Context & Promise */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-white/15">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Works Like a Native Android / iOS App</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Install AgriScan in 10 Seconds—Zero Phone Memory Wasted.
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Progressive Web App technology allows you to add AgriScan directly to your home screen. It takes under 1MB of space, launches full-screen without browser address bars, and stays cached for offline field visits.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPwaModal(true)}
                    className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>View Step-by-Step Instructions</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateInstall}
                    className="inline-flex items-center gap-2 font-semibold text-xs sm:text-sm px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
                  >
                    Test Add to Home Screen
                  </button>
                </div>
              </div>

              {/* Right Column: 2-Step Visual Guide */}
              <div className="lg:col-span-6">
                <div className="bg-slate-950/60 backdrop-blur-md rounded-[28px] p-6 border border-white/15 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      2-Step Quick Setup
                    </span>
                    <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPwaPlatform('android')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                          pwaPlatform === 'android' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Android Chrome
                      </button>
                      <button
                        type="button"
                        onClick={() => setPwaPlatform('ios')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                          pwaPlatform === 'ios' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        iPhone Safari
                      </button>
                    </div>
                  </div>

                  {pwaPlatform === 'android' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                          1
                        </div>
                        <strong className="block text-sm font-bold text-white">Tap Chrome Menu</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Tap the three vertical dots <span className="font-bold text-white">(&#8942;)</span> in the top right corner of your Chrome browser.
                        </p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                          2
                        </div>
                        <strong className="block text-sm font-bold text-white">&quot;Install App&quot;</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Select <span className="font-bold text-white">&quot;Install app&quot;</span> or <span className="font-bold text-white">&quot;Add to Home screen&quot;</span>. It will appear on your phone home screen immediately!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                          1
                        </div>
                        <strong className="block text-sm font-bold text-white">Tap Share Button</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          In Safari, tap the <span className="font-bold text-white">Share</span> icon (square with arrow pointing upwards) at the bottom toolbar.
                        </p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/10">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                          2
                        </div>
                        <strong className="block text-sm font-bold text-white">&quot;Add to Home Screen&quot;</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Scroll down and tap <span className="font-bold text-white">&quot;Add to Home Screen&quot;</span>. Then tap &quot;Add&quot; in the top-right corner.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Play Store or App Store account required.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: Footer with Frosted Dark Glass & Preserved Status
          ========================================================================= */}
      <footer className="bg-slate-950/80 backdrop-blur-2xl text-slate-200 pt-16 pb-12 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Brand & Mission */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Leaf className="w-5 h-5" />
                </div>
                <span
                  className="text-xl font-bold tracking-tight text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AgriScan Cross River
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Empowering smallholder farmers across Ikom, Calabar, Odukpani, and Akamkpa with instant plant pathology and accessible organic remedies in plain English and Pidgin.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <span>Built with Google AI Studio (Gemini) for the Cross River AgTech Hackathon 2026.</span>
              </div>
            </div>

            {/* Middle Column: Quick Links */}
            <div className="md:col-span-3 space-y-3 text-xs text-slate-300">
              <strong className="block text-sm font-bold text-white uppercase tracking-wider">
                Crops & Pathology
              </strong>
              <ul className="space-y-2">
                <li><a href="#supported-crops" className="hover:text-emerald-400 transition-colors">Cassava Mosaic & Bacterial Blight</a></li>
                <li><a href="#supported-crops" className="hover:text-emerald-400 transition-colors">Cocoa Black Pod & Swollen Shoot</a></li>
                <li><a href="#supported-crops" className="hover:text-emerald-400 transition-colors">Oil Palm Freckle & Leaf Spot</a></li>
                <li><a href="#supported-crops" className="hover:text-emerald-400 transition-colors">Maize Fall Armyworm Protocols</a></li>
              </ul>
            </div>

            {/* Right Column: Cooperatives Contact Link */}
            <div className="md:col-span-3 space-y-3 text-xs">
              <strong className="block text-sm font-bold text-white uppercase tracking-wider">
                Farmer Cooperatives
              </strong>
              <p className="text-slate-300 text-xs leading-relaxed">
                Are you an agricultural extension worker or union coordinator in Cross River?
              </p>
              <button
                type="button"
                onClick={() => setShowCoopModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Request Cooperative Deployment Access →</span>
              </button>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchScanner}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-bold text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                >
                  <Scan className="w-4 h-4" />
                  <span>Open Scanner Web App</span>
                </button>
              </div>
            </div>
          </div>

          {/* Persistent Connectivity & Sync Status Bar */}
          <div className="pt-8 pb-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <ConnectivityStatus theme="dark" />
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Cross River Agricultural Cloud Node Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">Offline-Ready PWA</span>
            </div>
          </div>

          {/* Bottom attribution bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 AgriScan Cross River. All farmer data anonymous and privacy-protected.</p>
            <div className="flex items-center gap-4">
              <span>Cross River State Ministry of Agriculture Partner Initiative</span>
              <span>•</span>
              <span>Gemini 3.8 Flash Multimodal AI</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: Detailed PWA Install Guide with Frosted Glassmorphism
          ========================================================================= */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="text-base sm:text-lg font-bold text-white"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Install AgriScan on Your Device
                  </h3>
                  <p className="text-xs text-slate-300">Offline-capable PWA • Instant Launch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex rounded-xl bg-white/10 p-1 border border-white/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPwaPlatform('android')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  pwaPlatform === 'android' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => setPwaPlatform('ios')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  pwaPlatform === 'ios' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {/* Step content */}
            {pwaPlatform === 'android' ? (
              <div className="space-y-3 text-xs text-slate-200">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="block text-sm text-white">Tap the Three Dots Menu</strong>
                    <span>In Google Chrome on your Android phone, tap the three dots icon <strong>(&#8942;)</strong> at the top-right corner.</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="block text-sm text-white">Choose &quot;Install App&quot;</strong>
                    <span>Look for <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong> and tap it.</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="block text-sm text-white">Instant Field Access</strong>
                    <span>The AgriScan leaf icon will now sit on your phone screen just like WhatsApp or Facebook.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-200">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="block text-sm text-white">Tap the Share Icon</strong>
                    <span>In Safari, look at the bottom bar of your screen and tap the square icon with an upward arrow.</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="block text-sm text-white">Select &quot;Add to Home Screen&quot;</strong>
                    <span>Swipe down the menu options and tap <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="block text-sm text-white">Confirm &quot;Add&quot;</strong>
                    <span>Tap <strong>&quot;Add&quot;</strong> in the top-right corner. AgriScan is now ready!</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPwaModal(false);
                  handleSimulateInstall();
                }}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
              >
                I&apos;ve Added It to My Screen
              </button>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="px-4 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: For Cooperatives & Extension Outreach with Frosted Glassmorphism
          ========================================================================= */}
      {showCoopModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/20 space-y-4 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="text-base sm:text-lg font-bold text-white"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Farmer Cooperative Network
                  </h3>
                  <p className="text-xs text-slate-300">Cross River State Extension Support</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCoopModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {coopSubmitted ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Deployment Request Received!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you. Our agronomy technical lead will contact your cooperative coordinator with batch diagnostic cards and the offline PWA training package.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCoopModal(false);
                    setCoopSubmitted(false);
                  }}
                  className="font-bold text-xs px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  Return to Landing Page
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCoopSubmitted(true);
                }}
                className="space-y-3.5 text-xs text-slate-200"
              >
                <p className="leading-relaxed text-slate-300">
                  Deploy AgriScan to your cluster members across Cross River. We provide offline diagnostic tablets, printed Pidgin field charts, and cooperative disease heatmaps.
                </p>

                <div>
                  <label className="block font-bold text-white mb-1">Cooperative or Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ikom Central Cocoa Farmers Cooperative Union"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-950/60 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-white mb-1">Local Government Area</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Ikom LGA</option>
                      <option>Calabar Municipal</option>
                      <option>Odukpani LGA</option>
                      <option>Akamkpa LGA</option>
                      <option>Boki LGA</option>
                      <option>Other Cross River LGA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-white mb-1">Estimated Farmers</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>20 - 50 farmers</option>
                      <option>50 - 200 farmers</option>
                      <option>200 - 1,000 farmers</option>
                      <option>1,000+ farmers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Contact Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 80... / 080..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-950/60 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                  >
                    Submit Cooperative Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCoopModal(false)}
                    className="px-4 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
