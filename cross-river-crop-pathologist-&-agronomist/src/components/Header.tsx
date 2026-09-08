import React from 'react';
import { Sprout, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  return (
    <header
      id="main-app-header"
      className="bg-[#060D09]/90 backdrop-blur-md text-white shadow-xl shadow-black/40 border-b border-emerald-500/30 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-[#22C55E] shrink-0 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight text-white"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AgriScan <span className="font-light italic text-emerald-300">Cross River</span>
                </h1>
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  Specialist Edition
                </Badge>
              </div>
              <p className="text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span>Cross River State Tropical Pathology • Local Agronomist AI</span>
              </p>
            </div>
          </div>

          {/* Regional focus crops list */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs text-white py-1">
            <span className="text-emerald-400 font-bold uppercase text-[11px] tracking-wider pr-1 shrink-0">
              Priority Crops:
            </span>
            {['Cassava', 'Cocoa', 'Oil Palm', 'Maize', 'Plantain', 'Yams'].map((crop) => (
              <Badge
                key={crop}
                variant="outline"
                className="bg-[#0D1C13]/80 border-emerald-500/35 text-slate-100 font-medium shrink-0 px-2.5 py-1"
              >
                {crop}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
