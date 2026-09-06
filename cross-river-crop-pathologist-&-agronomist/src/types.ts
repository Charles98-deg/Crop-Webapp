export type HealthStatus = 'Healthy' | 'Diseased' | 'Pest Infested' | 'Nutrient Deficient' | 'Unknown';
export type SeverityLevel = 'None' | 'Low' | 'Moderate' | 'Critical';

export interface PathologyDiagnosis {
  is_plant: boolean;
  crop_identified: string;
  health_status: HealthStatus;
  pathology_name: string | null;
  confidence_score: number;
  severity_level: SeverityLevel;
  observable_symptoms: string[];
  immediate_containment_step: string | null;
  organic_local_remedy: string | null;
  standard_chemical_treatment: string | null;
  prevention_future: string | null;
  pidgin_audio_script: string;
}

export type WestAfricanCrop =
  | 'Cassava'
  | 'Cocoa'
  | 'Oil Palm'
  | 'Maize'
  | 'Plantain'
  | 'Yams'
  | 'Auto-detect';

export interface FieldSample {
  id: string;
  title: string;
  crop: WestAfricanCrop;
  localZone: string;
  category: 'Disease' | 'Pest' | 'Deficiency' | 'Healthy' | 'Non-Plant';
  thumbnailUrl: string;
  description: string;
  presetDiagnosis?: PathologyDiagnosis;
}
