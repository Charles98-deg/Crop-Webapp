import React from 'react';
import { motion, Variants } from 'framer-motion';
import ElasticMesh from './ElasticMesh';
import { Scan, Volume2, MapPin } from 'lucide-react';

interface LandingPageProps {
  onStart?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative w-full h-screen bg-[#0B150E] overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute inset-0 z-0">
        <ElasticMesh className="w-full h-full object-cover" />
      </div>
      
      {/* Gradient Overlay for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B150E] pointer-events-none z-[1]" />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl w-full text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Hero UI */}
          <div className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 drop-shadow-sm"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              AgriScan Cross River
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-2xl text-emerald-100/90 font-medium max-w-2xl mx-auto"
            >
              The AI that thinks for the farmer. Zero prompting required.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-4 flex justify-center">
              <button
                onClick={onStart}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 text-xl font-bold text-white bg-emerald-600 rounded-3xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  <Scan className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Start Crop Scan
                </span>
              </button>
            </motion.div>
          </div>

          {/* Bento Grid Features */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-black/40 transition-colors">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Scan className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-emerald-100 font-bold text-lg">Visual Diagnostics</h3>
              <p className="text-emerald-100/70 text-sm">Instant disease identification using advanced AI models.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-black/40 transition-colors">
              <div className="p-3 bg-lime-500/20 rounded-xl">
                <Volume2 className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-emerald-100 font-bold text-lg">Pidgin Audio Output</h3>
              <p className="text-emerald-100/70 text-sm">Clear spoken instructions tailored for local farmers.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-black/40 transition-colors">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <MapPin className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-emerald-100 font-bold text-lg">Cross River Localized</h3>
              <p className="text-emerald-100/70 text-sm">Remedies specific to the Cross River State agricultural ecosystem.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
