import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ShieldCheck, CloudSun, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenGuide?: () => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  return (
    <header
      id="main-app-header"
      className="w-full bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand & Node Identity */}
        <div className="flex items-center gap-3.5">
          <motion.div
            whileTap={{ scale: 0.94 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                AgriScan <span className="text-emerald-400 font-semibold">Global</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Enterprise 24H
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Global Diagnostic Node • Active</span>
            </p>
          </div>
        </div>

        {/* Environmental Context & Guide Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 font-medium">
            <CloudSun className="w-4 h-4 text-emerald-400" />
            <span>Field Telemetry • 24°C / 65% Humidity</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGuide && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onOpenGuide}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Agronomy</span> Guide
              </motion.button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-sm font-bold text-emerald-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
