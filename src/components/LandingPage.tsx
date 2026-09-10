import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Scan, Volume2, MapPin, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStart?: () => void;
}

const CROP_IMAGES = [
  { src: '/images/media_1788672011845.jpg', alt: 'Harvesting fresh field crops' },
  { src: '/images/media_1788672012877.jpg', alt: 'Golden maize corn field' },
  { src: '/images/media_1788672012365.jpg', alt: 'Farmland field irrigation' },
  { src: '/images/media_1788672013386.jpg', alt: 'Fresh bell pepper farm harvest' },
  { src: '/images/media_1788672013662.jpg', alt: 'Farmer cultivating fertile crop soil' },
  { src: '/hero-poster.jpg', alt: 'Cross River agricultural landscape' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  // Duplicate arrays to create continuous infinite loops
  const row1Images = [...CROP_IMAGES, ...CROP_IMAGES];
  const row2Images = [
    ...CROP_IMAGES.slice(3),
    ...CROP_IMAGES.slice(0, 3),
    ...CROP_IMAGES.slice(3),
    ...CROP_IMAGES.slice(0, 3),
  ];

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto bg-[#060D09] text-white flex flex-col justify-between selection:bg-[#22C55E] selection:text-[#060D09]">
      {/* Inline styles for infinite marquee animation and reduced-motion media query */}
      <style>{`
        @keyframes marquee-scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-scroll-left 36s linear infinite;
          will-change: transform;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-scroll-right 36s linear infinite;
          will-change: transform;
        }
        .reduced-motion-fallback {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-container {
            display: none !important;
          }
          .reduced-motion-fallback {
            display: block !important;
          }
        }
      `}</style>

      {/* 1. Animated Background Marquee Showcase */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Double Marquee Rows */}
        <div className="marquee-container w-full h-full flex flex-col justify-around py-4 sm:py-8 opacity-45 sm:opacity-50">
          {/* Row 1: Sliding Left */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-left flex gap-4 sm:gap-6 py-2">
              {row1Images.map((img, idx) => (
                <div
                  key={`r1-${idx}`}
                  className="flex-shrink-0 w-52 sm:w-64 md:w-80 h-32 sm:h-40 md:h-48 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-lg bg-[#071F12]/80"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Sliding Right (Opposite Direction) */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-right flex gap-4 sm:gap-6 py-2">
              {row2Images.map((img, idx) => (
                <div
                  key={`r2-${idx}`}
                  className="flex-shrink-0 w-52 sm:w-64 md:w-80 h-32 sm:h-40 md:h-48 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-lg bg-[#071F12]/80"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fallback for prefers-reduced-motion: static blurred image */}
        <div
          className="reduced-motion-fallback absolute inset-0 bg-cover bg-center filter blur-md opacity-35"
          style={{ backgroundImage: "url('/hero-poster.jpg')" }}
        />

        {/* Dark Obsidian Glass Overlay: bg-[#060D09]/80 backdrop-blur-[2px] */}
        <div className="absolute inset-0 bg-[#060D09]/80 backdrop-blur-[2px] pointer-events-none" />

        {/* Radial Gradient: radial-gradient(ellipse at center, transparent 0%, rgba(6,13,9,0.70) 50%, #060D09 100%) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(6,13,9,0.70) 50%, #060D09 100%)',
          }}
        />

        {/* Vertical Vignette Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060D09]/75 via-transparent to-[#060D09] pointer-events-none" />
      </div>

      {/* 2. Foreground Content — Relative Z-10 */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <motion.div
          className="max-w-4xl w-full text-center space-y-10 sm:space-y-12 my-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Hero Header */}
          <div className="space-y-5">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-widest backdrop-blur-md shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              <span>Cross River State Smallholder Agrologist</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] [text-shadow:0_0_40px_rgba(34,197,94,0.45)]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              AgriScan{' '}
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-400 [text-shadow:0_0_30px_rgba(34,197,94,0.6)]">
                Cross River
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-2xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm px-2"
            >
              The AI that thinks for the farmer. Zero prompting required.
            </motion.p>

            {/* Glowing Unmissable CTA — Full-width on mobile, min 56px height */}
            <motion.div variants={itemVariants} className="pt-6 sm:pt-8 flex justify-center w-full">
              <div className="relative inline-flex group w-full sm:w-auto justify-center">
                {/* Glowing breathing aura */}
                <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#10B981] opacity-75 blur-lg group-hover:opacity-100 group-hover:blur-xl transition duration-500 group-hover:scale-105 animate-pulse" />

                <button
                  id="btn-start-crop-scan"
                  onClick={onStart}
                  className="relative inline-flex items-center justify-center gap-3.5 w-full sm:w-auto px-9 sm:px-12 py-5 sm:py-6 min-h-[56px] sm:min-h-[64px] text-xl sm:text-2xl font-black tracking-tight text-[#060D09] bg-[#22C55E] hover:bg-[#16A34A] active:bg-[#15803D] rounded-full border-2 border-emerald-300/80 shadow-[0_0_40px_rgba(34,197,94,0.7),0_0_80px_rgba(34,197,94,0.35)] hover:shadow-[0_0_60px_rgba(34,197,94,0.9),0_0_110px_rgba(34,197,94,0.5)] transition-all transform active:scale-95 cursor-pointer touch-manipulation"
                >
                  <Scan className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.75] text-[#060D09] group-hover:rotate-12 transition-transform duration-300" />
                  <span className="uppercase tracking-wider font-extrabold">Start Crop Scan</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bento Grid Features - Frosted Glass Cards (bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left"
          >
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col space-y-3 hover:border-emerald-400/40 hover:bg-white/10 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#22C55E]">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg">Visual Diagnostics</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                Instant crop leaf and stem pathology verification using regional West African AI models.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col space-y-3 hover:border-lime-400/40 hover:bg-white/10 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg">Pidgin Audio Output</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                Direct spoken voice instructions in authentic Nigerian Pidgin designed for field hands.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col space-y-3 hover:border-emerald-400/40 hover:bg-white/10 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg">Cross River Localized</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                Traditional recipes (wood ash, Dongoyaro neem) &amp; agro-store inputs mapped to Ikom, Calabar &amp; Ogoja.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
