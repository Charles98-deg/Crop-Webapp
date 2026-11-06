import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AgronomyGuide: React.FC = () => {
  const guideItems = [
    {
      crop: 'Cassava (Manihot esculenta)',
      focusZones: 'Tropical Lowland Rainforest & Savanna Belts',
      prevalentIssues: 'Cassava Mosaic Disease (CMD), Bacterial Blight, Green Spider Mite',
      organicStandard:
        'Neem botanical extract boiled with potassium soap against whiteflies; rogueing diseased stands; IITA resistant varieties (TME 419, TMS 98/0505).',
      chemicalStandard: 'Lambda-cyhalothrin (Karate 5EC / Lamdex) at 30ml/15L for whitefly vector control.',
    },
    {
      crop: 'Cocoa (Theobroma cacao)',
      focusZones: 'Humid Tropical Forest & Equatorial Basins',
      prevalentIssues: 'Black Pod (Phytophthora megakarya), Mirids (Sahlbergella), Stem Borer',
      organicStandard:
        'Canopy pruning to increase aeration; sanitation harvest every 14 days during peak rains; burying infected pods 50cm deep with wood ash.',
      chemicalStandard:
        'Ridomil Gold 66 WP (Metalaxyl-M + Mancozeb) or Nordox 75WG / Kocide 2000; spray every 2-3 weeks in high humidity with PPE.',
    },
    {
      crop: 'Oil Palm (Elaeis guineensis)',
      focusZones: 'Equatorial Coastal & Palm Belts',
      prevalentIssues: 'Magnesium Deficiency (Orange Frond), Basal Stem Rot (Ganoderma), Anthracnose',
      organicStandard:
        'Empty fruit bunches (EFB) mulching; organic compost ring broadcast; clean weeding 1.5m circle around palm base.',
      chemicalStandard:
        'Kieserite (Magnesium Sulphate) 1.0–1.5kg/palm/year; Dolomite limestone for coastal acidic sands.',
    },
    {
      crop: 'Maize (Zea mays)',
      focusZones: 'Sub-Saharan Savanna & Sub-Tropical Grain Belts',
      prevalentIssues: 'Fall Armyworm (Spodoptera frugiperda), Southern Corn Rust, Stem Borers',
      organicStandard:
        'Dry wood ash + fine sand + hot pepper dust deposited inside the whorl; early season planting; intercropping with legumes.',
      chemicalStandard:
        'Ampligo 150 ZC (10ml/15L knapsack) or Emamectin Benzoate applied directly into whorl at dusk.',
    },
    {
      crop: 'Plantain (Musa paradisiaca)',
      focusZones: 'Humid Lowland Forest & Coastal Basins',
      prevalentIssues: 'Black Sigatoka (Pseudocercospora fijiensis), Banana Weevil, Bunchy Top',
      organicStandard:
        'De-leafing affected leaves every 10 days; turning leaves upside down on ground; wood ash at pseudostem base for potassium boost.',
      chemicalStandard:
        'Propiconazole (Tilt 250EC) or Mancozeb 80WP with plant-safe oil surfactant for rain-fastness.',
    },
    {
      crop: 'Yams (Dioscorea spp.)',
      focusZones: 'Savanna Transition & Montane Highlands',
      prevalentIssues: 'Yam Anthracnose / Scorch (Colletotrichum), Yam Mosaic Virus, Yam Nematodes',
      organicStandard:
        'Bamboo staking (3-4m) to elevate vines away from rain splash; dusting seed setts with dry wood ash before planting.',
      chemicalStandard:
        'Mancozeb 80WP (40g/15L) or Carbendazim alternate spray every 14 days during wet vegetative flush.',
    },
  ];

  return (
    <div className="rounded-xl p-6 sm:p-8 space-y-6 shadow-sm border border-border bg-card text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-primary" />
            Crop Pathology Reference
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Common pathologies and field treatment protocols
          </p>
        </div>
      </div>

      {/* Preparation Recipes for Smallholders & Agronomists */}
      <div className="bg-secondary/40 border border-border rounded-xl p-5 sm:p-6 space-y-3.5 shadow-sm text-foreground">
        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Standard Biological &amp; Cultural IPM Formulations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="bg-card p-4 rounded-xl border border-border">
            <strong className="text-primary block mb-1.5 text-sm font-bold">
              1. Neem Botanical Bio-Pesticide &amp; Repellent
            </strong>
            Pound 1kg of fresh mature neem leaves or crushed dried seeds in 5L of water. Soak for 24-48 hours. Squeeze out residue through clean cloth. Dissolve 2 tablespoons of potassium black soap (acting as surfactant/sticker). Dilute with 10L clean water and spray onto crop leaves in calm morning hours.
          </div>
          <div className="bg-card p-4 rounded-xl border border-border">
            <strong className="text-primary block mb-1.5 text-sm font-bold">
              2. Wood Ash Mineral Dusting Protocol
            </strong>
            Collect dry wood ash from clean hardwood hearths, sieve through wire mesh to remove char coals. Dust generously over yam mounds, around plantain bases, or mix 50:50 with dry sand to pour inside maize whorls. Wood ash deters chewing pests, desorbs slug slime, and delivers readily available potassium.
          </div>
        </div>
      </div>

      {/* Crops Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {guideItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl p-5 space-y-3.5 flex flex-col justify-between shadow-sm text-foreground"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-bold text-foreground">
                  {item.crop}
                </h4>
                <Badge variant="outline" className="text-xs font-semibold">
                  Field Guide
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Main Zones:</strong> {item.focusZones}
              </p>
              <div className="mt-3 text-xs sm:text-sm text-foreground bg-secondary/60 p-3 rounded-xl border border-border">
                <strong className="text-primary block text-xs uppercase font-bold mb-0.5">
                  Primary Diseases/Pests:
                </strong>
                {item.prevalentIssues}
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs text-muted-foreground">
              <div className="bg-secondary/50 p-3 rounded-xl border border-border">
                <strong className="text-primary block text-xs uppercase font-bold mb-0.5">
                  Organic Control:
                </strong>
                {item.organicStandard}
              </div>
              <div className="bg-secondary/50 p-3 rounded-xl border border-border">
                <strong className="text-muted-foreground block text-xs uppercase font-bold mb-0.5">
                  Standard Agrochemical:
                </strong>
                {item.chemicalStandard}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
