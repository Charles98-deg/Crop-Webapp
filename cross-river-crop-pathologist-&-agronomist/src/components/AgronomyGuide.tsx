import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const AgronomyGuide: React.FC = () => {
  const guideItems = [
    {
      crop: 'Cassava (Manihot esculenta)',
      focusZones: 'Ikom, Obubra, Odukpani, Biase',
      prevalentIssues: 'Cassava Mosaic Disease (CMD), Bacterial Blight, Green Spider Mite',
      organicStandard:
        'Dongoyaro (Neem) leaf extract boiled with black soap against whiteflies; rogueing diseased stands; IITA resistant varieties (TME 419, TMS 98/0505).',
      chemicalStandard: 'Lambda-cyhalothrin (Karate 5EC / Lamdex) at 30ml/15L for whitefly vector control.',
    },
    {
      crop: 'Cocoa (Theobroma cacao)',
      focusZones: 'Etung, Ikom, Boki Cocoa Belt',
      prevalentIssues: 'Black Pod (Phytophthora megakarya), Mirids (Sahlbergella), Stem Borer',
      organicStandard:
        'Canopy pruning to increase aeration; sanitation harvest every 14 days during peak rains; burying infected pods 50cm deep with wood ash.',
      chemicalStandard:
        'Ridomil Gold 66 WP (Metalaxyl-M + Mancozeb) or Nordox 75WG / Kocide 2000; spray every 2-3 weeks in July-October with PPE.',
    },
    {
      crop: 'Oil Palm (Elaeis guineensis)',
      focusZones: 'Akamkpa, Biase, Calabar Estates',
      prevalentIssues: 'Magnesium Deficiency (Orange Frond), Basal Stem Rot (Ganoderma), Anthracnose',
      organicStandard:
        'Empty fruit bunches (EFB) mulching; oil mill decanter cake ring broadcast; weeding clean 1.5m circle around palm base.',
      chemicalStandard:
        'Kieserite (Magnesium Sulphate) 1.0–1.5kg/palm/year; Dolomite limestone for coastal acidic sands.',
    },
    {
      crop: 'Maize (Zea mays)',
      focusZones: 'Ogoja, Yala, Bekwarra, Obudu',
      prevalentIssues: 'Fall Armyworm (Spodoptera frugiperda), Southern Corn Rust, Stem Borers',
      organicStandard:
        'Dry wood ash + fine sand + pinch of hot pepper deposited inside the whorl; early season planting; intercropping with cowpea.',
      chemicalStandard:
        'Ampligo 150 ZC (10ml/15L knapsack) or Emamectin Benzoate applied directly into whorl at dusk.',
    },
    {
      crop: 'Plantain (Musa paradisiaca)',
      focusZones: 'Akamkpa, Yakurr, Ikom, Biase',
      prevalentIssues: 'Black Sigatoka (Pseudocercospora fijiensis), Banana Weevil, Bunchy Top',
      organicStandard:
        'De-leafing affected leaves every 10 days; turning leaves upside down on ground; wood ash at pseudostem base for potassium boost.',
      chemicalStandard:
        'Propiconazole (Tilt 250EC) or Mancozeb 80WP with vegetable oil surfactant for rain-fastness.',
    },
    {
      crop: 'Yams (Dioscorea spp.)',
      focusZones: 'Ogoja, Yala, Obudu Yam Hubs',
      prevalentIssues: 'Yam Anthracnose / Scorch (Colletotrichum), Yam Mosaic Virus, Yam Nematodes',
      organicStandard:
        'Bamboo staking (3-4m) to elevate vines away from rain splash; dusting seed setts with dry wood ash before planting.',
      chemicalStandard:
        'Mancozeb 80WP (40g/15L) or Carbendazim alternate spray every 14 days during wet vegetative flush.',
    },
  ];

  return (
    <Card className="rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm border-border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3
            className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <BookOpen className="w-5 h-5 text-accent" />
            Cross River Tropical Crops Pathology Reference
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Key agronomic profiles, prevalent pathologies, and Nigerian treatment protocols
          </p>
        </div>
        <Badge variant="default" className="self-start text-xs font-semibold py-1">
          Nigeria Tropical Agriculture
        </Badge>
      </div>

      {/* Preparation Recipes for Rural Smallholders */}
      <Card className="bg-muted border-border rounded-[24px] p-5 space-y-3 shadow-2xs">
        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Standard Local Organic Recipes (Accessible in Nigerian Villages)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-foreground/80">
          <div className="bg-background p-3.5 rounded-2xl border border-border">
            <strong className="text-primary block mb-1">
              1. Neem (Dongoyaro) Leaf/Seed Insecticide & Fungicide
            </strong>
            Pound 1kg of fresh mature Dongoyaro leaves or crushed dried seeds in 5L of water. Soak for 24-48 hours. Squeeze out residue through clean cloth. Dissolve 2 tablespoons of grated local black soap (acting as surfactant/sticker). Dilute with 10L clean water and spray onto crop leaves early in the morning.
          </div>
          <div className="bg-background p-3.5 rounded-2xl border border-border">
            <strong className="text-primary block mb-1">
              2. Wood Ash Protective Dusting Protocol
            </strong>
            Collect dry wood ash from domestic cooking hearths, sieve through wire mesh to remove char coals. Dust generously over yam mounds, around plantain bases, or mix 50:50 with dry sand to pour inside maize whorls. Wood ash deters chewing pests, desorbs slug/snail slime, and supplies soluble potassium.
          </div>
        </div>
      </Card>

      {/* Crops Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {guideItems.map((item, idx) => (
          <Card
            key={idx}
            className="bg-muted border-border rounded-[24px] p-4.5 space-y-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4
                  className="text-sm font-bold text-foreground"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {item.crop}
                </h4>
                <Badge variant="outline" className="text-[10px] font-medium text-primary border-primary/20 bg-primary/10">
                  Cross River
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                <strong>Main Zones:</strong> {item.focusZones}
              </p>
              <div className="mt-2.5 text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                <strong className="text-destructive block text-[10px] uppercase font-bold">
                  Primary Diseases/Pests:
                </strong>
                {item.prevalentIssues}
              </div>
            </div>

            <div className="space-y-2 pt-1 text-[11px] text-foreground/80">
              <div className="bg-background p-2.5 rounded-xl border border-border">
                <strong className="text-primary block text-[10px] uppercase font-bold">
                  Organic Control:
                </strong>
                {item.organicStandard}
              </div>
              <div className="bg-background p-2.5 rounded-xl border border-border">
                <strong className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Standard Agrochemical:
                </strong>
                {item.chemicalStandard}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
