import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Scan, ShieldCheck, Clock, Sprout } from 'lucide-react';

interface LandingPageProps {
  onStart?: () => void;
  onOpenPricing?: () => void;
}

const CROP_IMAGES = [
  { src: '/images/media_1788672011845.jpg', alt: 'Harvesting fresh field crops' },
  { src: '/images/media_1788672012877.jpg', alt: 'Golden maize corn field' },
  { src: '/images/media_1788672012365.jpg', alt: 'Farmland field irrigation' },
  { src: '/images/media_1788672013386.jpg', alt: 'Fresh bell pepper farm harvest' },
  { src: '/images/media_1788672013662.jpg', alt: 'Farmer cultivating fertile crop soil' },
  { src: '/hero-poster.jpg', alt: 'Global agricultural landscape' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenPricing }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  // Duplicate arrays for smooth marquee effect
  const row1Images = [...CROP_IMAGES, ...CROP_IMAGES];
  const row2Images = [
    ...CROP_IMAGES.slice(3),
    ...CROP_IMAGES.slice(0, 3),
    ...CROP_IMAGES.slice(3),
    ...CROP_IMAGES.slice(0, 3),
  ];

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Inline styles for marquee animation with reduced-motion support */}
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
          animation: marquee-scroll-left 40s linear infinite;
          will-change: transform;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-scroll-right 40s linear infinite;
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

      {/* 1. Muted Background Field Canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="marquee-container w-full h-full flex flex-col justify-around py-6 opacity-25">
          {/* Row 1: Left */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-left flex gap-5 py-2">
              {row1Images.map((img, idx) => (
                <div
                  key={`r1-${idx}`}
                  className="flex-shrink-0 w-60 sm:w-72 md:w-80 h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden border border-border bg-card"
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

          {/* Row 2: Right */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-right flex gap-5 py-2">
              {row2Images.map((img, idx) => (
                <div
                  key={`r2-${idx}`}
                  className="flex-shrink-0 w-60 sm:w-72 md:w-80 h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden border border-border bg-card"
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

        {/* Fallback for prefers-reduced-motion */}
        <div
          className="reduced-motion-fallback absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/hero-poster.jpg')" }}
        />

        {/* Grounding Vignette Overlay */}
        <div className="absolute inset-0 bg-background/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      </div>

      {/* 2. Main Hero Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          className="max-w-3xl w-full text-center space-y-8 sm:space-y-10 my-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Headline */}
          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]"
            >
              AgriScan
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed"
            >
              Photograph your sick crop and immediately get a 24-hour plan to save it.
            </motion.p>

            {/* Single Core Action Button */}
            <motion.div variants={itemVariants} className="pt-4 sm:pt-6 flex justify-center w-full">
              <button
                id="btn-start-crop-scan"
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 min-h-[56px] text-lg sm:text-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-xl shadow-md transition-all cursor-pointer touch-manipulation"
              >
                <Scan className="w-6 h-6 stroke-[2.25]" />
                <span>Scan your crop</span>
              </button>
            </motion.div>
          </div>

          {/* Three Quiet Trust Pillars */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left"
          >
            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-foreground font-bold text-base">Visual Diagnosis</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Identifies pathology and severity level directly from leaf photos.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-foreground font-bold text-base">24-Hour Plan</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Step-by-step timeline of actions for the first 2, 6, and 24 hours.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-foreground font-bold text-base">Organic First</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Safe, biological, and local remedies preferred over banned chemicals.
              </p>
            </div>
          </motion.div>

          {/* Quiet Footer Link to Pricing Preview */}
          {onOpenPricing && (
            <motion.div variants={itemVariants} className="pt-4 text-center">
              <button
                type="button"
                onClick={onOpenPricing}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
              >
                Pricing preview
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
