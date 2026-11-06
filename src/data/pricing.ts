export interface PricingFeature {
  text: string;
  planned?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  scans: string;
  features: PricingFeature[];
  featured?: boolean;
  badge?: string;
  cta: string;
  description?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'farmer',
    name: 'Farmer',
    price: '$3',
    period: '/month',
    scans: '40 scans / month',
    description: 'Essential crop diagnostics for individual smallholders and growers.',
    featured: false,
    cta: 'Coming soon',
    features: [
      { text: '40 crop scans every month' },
      { text: 'Immediate 24-hour triage plan' },
      { text: 'Biological & cultural field remedies' },
      { text: 'Spoken audio guidance' },
      { text: 'Banned chemical safety warnings' },
      { text: 'Scan history', planned: true },
    ],
  },
  {
    id: 'grower-cooperative',
    name: 'Grower / Cooperative',
    price: '$19',
    period: '/month',
    scans: '300 scans / month',
    description: 'Shared field diagnostics for farm groups, clusters, and cooperatives.',
    featured: true,
    badge: 'Best value',
    cta: 'Coming soon',
    features: [
      { text: '300 crop scans every month' },
      { text: '5 team members', planned: true },
      { text: 'Immediate 24-hour triage plan' },
      { text: 'Offline agronomy pathology guide' },
      { text: 'Biological & chemical IPM protocols' },
      { text: 'Spoken audio guidance' },
      { text: 'Shared scan history & export', planned: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'from $199',
    period: '/month',
    scans: '3,000+ scans / month',
    description: 'High-throughput diagnostics for commercial farms, ag-retailers, and programs.',
    featured: false,
    cta: 'Coming soon',
    features: [
      { text: '3,000+ crop scans every month' },
      { text: 'Custom regions and crops' },
      { text: 'Immediate 24-hour triage plan' },
      { text: 'High-volume field processing' },
      { text: 'Unlimited team members', planned: true },
      { text: 'API access', planned: true },
    ],
  },
];
