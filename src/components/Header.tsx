import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, BookOpen, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenGuide?: () => void;
  onOpenPricing?: () => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onOpenPricing }) => {
  return (
    <header
      id="main-app-header"
      className="w-full bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
              AgriScan
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Crop Pathology &amp; 24h Triage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary cursor-pointer min-h-[44px] flex items-center"
            >
              Pricing
            </button>
          )}

          {onOpenGuide && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-semibold text-foreground transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Guide</span>
            </motion.button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-secondary border border-border text-xs font-semibold text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
