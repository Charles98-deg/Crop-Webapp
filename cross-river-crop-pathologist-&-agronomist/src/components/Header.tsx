import React from 'react';
import { Sprout, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  return (
    <header
      id="main-app-header"
      className="bg-primary text-primary-foreground shadow-md border-b border-primary/80 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground shrink-0 border-2 border-primary-foreground/20 shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight text-primary-foreground"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AgriScan <span className="font-light italic text-primary-foreground/70">Cross River</span>
                </h1>
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Specialist Edition
                </Badge>
              </div>
              <p className="text-xs text-primary-foreground/80 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-primary-foreground/60 shrink-0" />
                <span>Cross River State Tropical Pathology • Local Agronomist AI</span>
              </p>
            </div>
          </div>

          {/* Regional focus crops list */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-primary-foreground py-1">
            <span className="text-primary-foreground/60 font-semibold uppercase text-[10px] tracking-wider pr-1">
              Priority Crops:
            </span>
            {['Cassava', 'Cocoa', 'Oil Palm', 'Maize', 'Plantain', 'Yams'].map((crop) => (
              <Badge
                key={crop}
                variant="outline"
                className="bg-primary/60 border-primary-foreground/30 text-primary-foreground shrink-0"
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
