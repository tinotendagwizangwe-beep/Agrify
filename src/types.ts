export type MaterialType = 
  | 'Flue-Cured Virginia' 
  | 'Burley Leaf' 
  | 'Dark Fire-Cured' 
  | 'Oriental / Sun-Cured' 
  | 'Dark Air-Cured' 
  | 'Lugs & Primings';

export type QualityGrade = 
  | 'Grade A1 (Choice Lemon)' 
  | 'Grade B1 (Fine Orange)' 
  | 'Grade C2 (Standard Cutter)' 
  | 'Grade X (Clean Lugs)' 
  | 'Export Premium';

export type WrapStatus = 'Intact' | 'Minor Surface Fray' | 'Tension Alert' | 'Ruptured / Wet Hessian Sheet';

export type StorageZone = 
  | 'Zone A (Flue-Cured Virginia)' 
  | 'Zone B (Burley & Air-Cured)' 
  | 'Zone C (Dark Fire-Cured & Oriental)' 
  | 'Zone D (Auction Floor & Staging)';

export interface ALTHessianTag {
  tagId: string;              // e.g. "ALT-HS-99482"
  rfidFrequency: string;       // e.g. "865.6 MHz UHF"
  weaveDensityGSM: number;     // e.g. 320 g/m²
  wrapIntegrity: WrapStatus;
  humiditySensorPct: number;   // e.g. 11.4%
  batchNumber: string;         // e.g. "BAT-2026-07-42"
  manufacturer: string;        // e.g. "EcoHessian Global Tech"
  lastScannedAt: string;       // ISO date string
}

export interface Bale {
  id: string;                  // e.g. "BAL-1002"
  altTag: ALTHessianTag;
  material: MaterialType;
  grade: QualityGrade;
  grossWeightKg: number;       // e.g. 238.5 kg
  tareWeightKg: number;        // e.g. 3.2 kg (hessian wrap + straps)
  netWeightKg: number;         // gross - tare
  targetWeightKg: number;      // e.g. 235.0 kg target
  weightVariancePct: number;   // e.g. +1.48%
  moistureContentPct: number;  // e.g. 9.8% (optimal < 12%)
  temperatureCelsius: number; // e.g. 22.4 C
  storageZone: StorageZone;
  bayLocation: string;         // e.g. "A-04-S3"
  weighedAtScaleId: string;    // e.g. "SC-01-INTAKE"
  status: 'In Stock' | 'Quarantined (High Moisture)' | 'Ready for Dispatch' | 'Dispatched';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightSensorScale {
  id: string;                  // e.g. "SC-01-INTAKE"
  name: string;                // "Primary Intake Weighbridge"
  location: string;            // "Inbound Dock 1"
  status: 'Active' | 'Measuring' | 'Calibrating' | 'Offline' | 'Overload Warning';
  currentReadingKg: number;
  tareZeroOffsetKg: number;
  accuracyMarginKg: number;    // e.g. +/- 0.1 kg
  maxCapacityKg: number;       // e.g. 1000 kg
  lastCalibrated: string;
  samplingRateHz: number;      // e.g. 20 Hz
}

export interface ScaleTelemetryPoint {
  timestamp: string;
  scaleId: string;
  weightKg: number;
  isStable: boolean;
  altTagDetected?: string;
}

export interface CloudSyncLog {
  id: string;
  timestamp: string;
  event: 'WEIGH_IN' | 'LOCATION_UPDATE' | 'DISPATCH' | 'CALIBRATION' | 'BULK_SYNC' | 'ALERT_TRIGGERED';
  baleId?: string;
  payloadSizeKb: number;
  syncLatencyMs: number;
  status: 'SUCCESS' | 'PENDING' | 'RETRY' | 'FAILED';
  cloudNode: string;
  details: string;
}

export interface SystemStats {
  totalBalesCount: number;
  totalNetTonnageMetric: number; // sum of netWeight / 1000
  avgMoisturePct: number;
  activeSensorsCount: number;
  quarantinedCount: number;
  lastCloudSyncAt: string;
  cloudSyncStatus: 'Connected' | 'Syncing' | 'Offline';
  activeAlertsCount: number;
}

export interface WeighInRequest {
  tagId?: string;
  material: MaterialType;
  grade: QualityGrade;
  grossWeightKg: number;
  tareWeightKg?: number;
  moistureContentPct: number;
  temperatureCelsius?: number;
  weaveDensityGSM?: number;
  wrapIntegrity?: WrapStatus;
  storageZone: StorageZone;
  bayLocation: string;
  scaleId: string;
  operatorNotes?: string;
}

export type StaffRole = 
  | 'Administrator'
  | 'Weighbridge Operator'
  | 'Quality & Moisture Inspector'
  | 'Auction Dispatch Supervisor'
  | 'Floor Operations Lead'
  | 'Scale Calibration Technician';

export interface StaffUser {
  id: string;
  staffId: string;
  name: string;
  role: StaffRole;
  email: string;
  assignedStation: string;
  shift: string;
  badgeNumber: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type NavTab = 'dashboard' | 'bales' | 'sensors' | 'analytics' | 'admin';

export const isAdmin = (user: StaffUser | null): boolean => {
  if (!user) return false;
  return user.role === 'Administrator' || user.name.toLowerCase() === 'tinotenda gwizangwe';
};

export interface TobaccoGradeScanRequest {
  imageBase64?: string;
  mimeType?: string;
  samplePresetId?: string;
  notes?: string;
}

export interface TobaccoGradeScanResult {
  grade: QualityGrade;
  gradeCode: string;
  materialVariety: MaterialType;
  confidenceScore: number; // 0 - 100
  curingMaturity: string;
  leafStalkPosition: string;
  colorDescription: string;
  colorHex: string;
  textureAndElasticity: string;
  estimatedMoisturePct: number;
  suggestedMarketPricingUsdPerKg: number;
  defectRatePct: number;
  justification: string;
  standardsCompliance: string;
  scannedAt: string;
}


