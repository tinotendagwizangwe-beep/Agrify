import React, { useState, useEffect } from 'react';
import { WeighInRequest, MaterialType, QualityGrade, StorageZone, WeightSensorScale } from '../types';
import { Scale, X, Cpu, CheckCircle2, AlertTriangle, ArrowRight, Camera, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audioFeedback';

interface WeighInModalProps {
  isOpen: boolean;
  onClose: () => void;
  scales: WeightSensorScale[];
  initialZone?: StorageZone;
  prefillGrade?: QualityGrade;
  prefillMaterial?: MaterialType;
  prefillMoisture?: number;
  onOpenLeafScanner?: () => void;
  onSubmitWeighIn: (req: WeighInRequest) => Promise<void>;
}

export const WeighInModal: React.FC<WeighInModalProps> = ({
  isOpen,
  onClose,
  scales,
  initialZone,
  prefillGrade,
  prefillMaterial,
  prefillMoisture,
  onOpenLeafScanner,
  onSubmitWeighIn
}) => {
  if (!isOpen) return null;

  const [selectedScaleId, setSelectedScaleId] = useState<string>(scales[0]?.id || 'SC-01-INTAKE');
  const [material, setMaterial] = useState<MaterialType>(prefillMaterial || 'Flue-Cured Virginia');
  const [grade, setGrade] = useState<QualityGrade>(prefillGrade || 'Grade A1 (Choice Lemon)');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(104.5);
  const [tareWeightKg, setTareWeightKg] = useState<number>(2.8);
  const [moistureContentPct, setMoistureContentPct] = useState<number>(prefillMoisture || 13.8);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(22.4);
  const [storageZone, setStorageZone] = useState<StorageZone>(initialZone || 'Zone A (Flue-Cured Virginia)');
  const [bayLocation, setBayLocation] = useState<string>('A-02-S3');
  const [operatorNotes, setOperatorNotes] = useState<string>('AgriLeaf Tobacco (ALT) intake drop. Hessian wrap verified.');

  useEffect(() => {
    if (prefillGrade) setGrade(prefillGrade);
    if (prefillMaterial) setMaterial(prefillMaterial);
    if (prefillMoisture) setMoistureContentPct(prefillMoisture);
  }, [prefillGrade, prefillMaterial, prefillMoisture]);

  // Animation states for scale drop simulation
  const [isSimulatingDrop, setIsSimulatingDrop] = useState<boolean>(false);
  const [liveScaleReading, setLiveScaleReading] = useState<number>(0);
  const [rfidScanned, setRfidScanned] = useState<boolean>(false);
  const [generatedTagId, setGeneratedTagId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const randomTag = `ALT-TB-${Math.floor(90000 + Math.random() * 9999)}`;
    setGeneratedTagId(randomTag);
  }, [isOpen]);

  // Handle Material auto defaults for tobacco
  useEffect(() => {
    const weightDefaults: Record<MaterialType, { gross: number; tare: number; zone: StorageZone }> = {
      'Flue-Cured Virginia': { gross: 104.5, tare: 2.8, zone: 'Zone A (Flue-Cured Virginia)' },
      'Burley Leaf': { gross: 112.0, tare: 2.9, zone: 'Zone B (Burley & Air-Cured)' },
      'Dark Fire-Cured': { gross: 110.5, tare: 2.8, zone: 'Zone C (Dark Fire-Cured & Oriental)' },
      'Oriental / Sun-Cured': { gross: 91.5, tare: 2.6, zone: 'Zone C (Dark Fire-Cured & Oriental)' },
      'Dark Air-Cured': { gross: 106.0, tare: 2.8, zone: 'Zone B (Burley & Air-Cured)' },
      'Lugs & Primings': { gross: 101.5, tare: 2.8, zone: 'Zone D (Auction Floor & Staging)' },
    };

    if (weightDefaults[material]) {
      setGrossWeightKg(weightDefaults[material].gross);
      setTareWeightKg(weightDefaults[material].tare);
      if (!initialZone) {
        setStorageZone(weightDefaults[material].zone);
      }
    }
  }, [material]);

  const handleSimulateDrop = () => {
    soundFx.playScaleTare();
    setIsSimulatingDrop(true);
    setLiveScaleReading(0);
    setRfidScanned(false);

    let current = 0;
    const target = grossWeightKg;
    const step = target / 15;

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
        setLiveScaleReading(Math.round(target * 10) / 10);
        setRfidScanned(true);
        setIsSimulatingDrop(false);
        soundFx.playWeightLock();
      } else {
        setLiveScaleReading(Math.round(current * 10) / 10);
      }
    }, 45);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmitWeighIn({
        tagId: generatedTagId,
        material,
        grade,
        grossWeightKg,
        tareWeightKg,
        moistureContentPct,
        temperatureCelsius,
        storageZone,
        bayLocation,
        scaleId: selectedScaleId,
        operatorNotes,
      });

      soundFx.playWeightLock();
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const netCalculated = Math.max(0, Math.round((grossWeightKg - tareWeightKg) * 10) / 10);
  const isHighMoisture = moistureContentPct >= 15.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tobacco Scale Intake & ALT Tag Ingest</h3>
              <p className="text-xs text-slate-500">Digital load cell weigh-in, ALT hessian tare deduction, & cloud ledger sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Active Scale & Load Sensor Selection */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Select Intake Weighbridge / Scale Sensor
            </label>
            <select
              value={selectedScaleId}
              onChange={(e) => setSelectedScaleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
            >
              {scales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Scale Drop Simulator Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IoT Scale Simulation</span>
                <p className="text-xs text-slate-600 mt-0.5">Test live load cell drop & ALT RFID antenna handshake</p>
              </div>
              <button
                type="button"
                onClick={handleSimulateDrop}
                disabled={isSimulatingDrop}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-2xs transition-all disabled:opacity-50"
              >
                {isSimulatingDrop ? 'Reading Load Cells...' : 'Drop Bale on Scale'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Live Digital Readout</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {liveScaleReading > 0 ? liveScaleReading.toFixed(1) : grossWeightKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">ALT Hessian RFID Tag</span>
                <span className="font-mono text-xs font-semibold text-emerald-700 truncate block">
                  {generatedTagId}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Handshake Status</span>
                  <span className="text-xs font-medium text-slate-700">
                    {rfidScanned ? 'RFID Locked' : 'Ready'}
                  </span>
                </div>
                <CheckCircle2 className={`w-4 h-4 ${rfidScanned ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>

          {/* Tobacco Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Tobacco Variety
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              >
                <option value="Flue-Cured Virginia">Flue-Cured Virginia</option>
                <option value="Burley Leaf">Burley Leaf</option>
                <option value="Dark Fire-Cured">Dark Fire-Cured</option>
                <option value="Oriental / Sun-Cured">Oriental / Sun-Cured</option>
                <option value="Dark Air-Cured">Dark Air-Cured</option>
                <option value="Lugs & Primings">Lugs & Primings</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">
                  Auction Grade
                </label>
                {onOpenLeafScanner && (
                  <button
                    type="button"
                    onClick={onOpenLeafScanner}
                    className="text-[10px] font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors inline-flex items-center space-x-1"
                    title="Scan tobacco leaf image with AI to auto-determine grade"
                  >
                    <Camera className="w-3 h-3 text-amber-600" />
                    <span>Scan Leaf with AI</span>
                  </button>
                )}
              </div>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as QualityGrade)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              >
                <option value="Grade A1 (Choice Lemon)">Grade A1 (Choice Lemon)</option>
                <option value="Grade B1 (Fine Orange)">Grade B1 (Fine Orange)</option>
                <option value="Grade C2 (Standard Cutter)">Grade C2 (Standard Cutter)</option>
                <option value="Grade X (Clean Lugs)">Grade X (Clean Lugs)</option>
                <option value="Export Premium">Export Premium</option>
              </select>
            </div>
          </div>

          {/* Scale Weight Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Gross Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">
                  Hessian Sheet Tare (kg)
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setTareWeightKg(2.8)}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200"
                    title="AgriLeaf Tobacco Standard Tare"
                  >
                    ALT 2.8kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setTareWeightKg(3.2)}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200"
                    title="Heavy Strapped Hessian"
                  >
                    3.2kg
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                value={tareWeightKg}
                onChange={(e) => setTareWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Calculated Net Weight (kg)
              </label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-emerald-800 text-xs font-bold">
                {netCalculated} kg
              </div>
            </div>
          </div>

          {/* Leaf Moisture & Ambient Temp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-medium">
                  Leaf Moisture Content (%)
                </label>
                <span className={`text-[10px] font-semibold ${isHighMoisture ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {isHighMoisture ? 'High Risk (>15.5%)' : 'Optimal (12-15%)'}
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={moistureContentPct}
                onChange={(e) => setMoistureContentPct(parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                  isHighMoisture 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Ambient Leaf Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={temperatureCelsius}
                onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Destination Zone & Bay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Destination Storage Zone
              </label>
              <select
                value={storageZone}
                onChange={(e) => setStorageZone(e.target.value as StorageZone)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              >
                <option value="Zone A (Flue-Cured Virginia)">Zone A (Flue-Cured Virginia)</option>
                <option value="Zone B (Burley & Air-Cured)">Zone B (Burley & Air-Cured)</option>
                <option value="Zone C (Dark Fire-Cured & Oriental)">Zone C (Dark Fire-Cured & Oriental)</option>
                <option value="Zone D (Auction Floor & Staging)">Zone D (Auction Floor & Staging)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Floor Slot / Bay Location
              </label>
              <input
                type="text"
                value={bayLocation}
                onChange={(e) => setBayLocation(e.target.value)}
                placeholder="e.g. A-02-S3"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Operator Notes */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Inspection & Ingest Notes
            </label>
            <input
              type="text"
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Ingesting to Ledger...' : 'Confirm Weigh-In & Register Bale'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
