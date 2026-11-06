import React from 'react';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { PRICING_TIERS } from '../data/pricing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PricingViewProps {
  onBack: () => void;
  onStartScan?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onBack, onStartScan }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Header Bar */}
      <header className="w-full bg-background/95 border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-xs font-semibold text-muted-foreground">
            Pricing Preview
          </span>

          {onStartScan ? (
            <button
              type="button"
              onClick={onStartScan}
              className="text-xs font-bold text-primary hover:underline cursor-pointer min-h-[44px] flex items-center"
            >
              Scan your crop →
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Title & Preview Note */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="text-xs font-semibold py-1 px-3">
            Preview
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
            Simple, honest pricing for every farm
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From single-plot smallholders to regional cooperatives. All tiers include full 24-hour treatment plans.
          </p>
          <div className="pt-1">
            <p className="text-xs text-muted-foreground bg-secondary/60 border border-border inline-block px-3.5 py-1.5 rounded-full font-medium">
              Pricing preview. Payments aren&apos;t live yet. Prices in USD.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid (360px stackable -> 1 col mobile, 3 cols desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
          {PRICING_TIERS.map((tier) => {
            const isFeatured = tier.featured;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 bg-card transition-shadow ${
                  isFeatured
                    ? 'border-2 border-primary shadow-md'
                    : 'border border-border shadow-sm'
                }`}
              >
                {/* Featured Badge (using border-primary plus badge text, not color alone) */}
                {tier.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Tier Title & Description */}
                  <div>
                    <h2 className="text-xl font-serif font-bold text-foreground">
                      {tier.name}
                    </h2>
                    {tier.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 min-h-[36px] leading-relaxed">
                        {tier.description}
                      </p>
                    )}
                  </div>

                  {/* Price Tag (Prices live only in pricing.ts) */}
                  <div className="pt-2 pb-3 border-b border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
                        {tier.price}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        {tier.period}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary mt-1">
                      {tier.scans}
                    </p>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Included in this plan:
                    </span>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="flex-1 text-foreground leading-snug">
                            {feature.text}
                          </span>
                          {feature.planned && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-medium text-muted-foreground border-border shrink-0 ml-1"
                            >
                              Planned
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA: disabled button reading 'Coming soon' (aria-disabled) */}
                <div className="pt-6 mt-6 border-t border-border space-y-2">
                  <Button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full min-h-[48px] rounded-xl font-bold bg-secondary text-muted-foreground cursor-not-allowed opacity-80"
                  >
                    {tier.cta}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Available upon public launch
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiet Reassurance Banner */}
        <div className="bg-secondary/40 border border-border rounded-2xl p-5 sm:p-6 text-center max-w-3xl mx-auto space-y-2">
          <h3 className="text-base font-serif font-bold text-foreground">
            Grower promise
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Free diagnostic previews will always remain accessible for smallholders encountering urgent crop emergencies in the field.
          </p>
        </div>
      </main>
    </div>
  );
};
