import React, { useState } from 'react';
import { Bale, StorageZone } from '../types';
import { X, Scale, Tag, ShieldAlert, CheckCircle2, Printer, Edit2, Check } from 'lucide-react';

interface BaleDetailModalProps {
  bale: Bale | null;
  onClose: () => void;
  onUpdateBale: (updated: Partial<Bale>) => Promise<void>;
  onDispatchBale: (id: string) => Promise<void>;
}

export const BaleDetailModal: React.FC<BaleDetailModalProps> = ({
  bale,
  onClose,
  onUpdateBale,
  onDispatchBale
}) => {
  if (!bale) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(bale.status);
  const [zone, setZone] = useState<StorageZone>(bale.storageZone);
  const [bay, setBay] = useState(bale.bayLocation);
  const [notes, setNotes] = useState(bale.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const isQuarantine = bale.status.includes('Quarantined');
  const isHighMoisture = bale.moistureContentPct >= 15.5;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateBale({
        status,
        storageZone: zone,
        bayLocation: bay,
        notes,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-slate-900">{bale.id}</span>
                <span className="text-xs text-slate-400">| ALT Tag: <strong className="text-slate-700">{bale.altTag.tagId}</strong></span>
              </div>
              <p className="text-xs text-slate-500">{bale.material} • {bale.grade}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrintCertificate}
              title="Print Weighbridge Certificate"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Status & Location Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Inventory Status</span>
              <div className="flex items-center space-x-2 mt-1">
                {isQuarantine ? (
                  <span className="flex items-center space-x-1 font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Quarantined (High Moisture)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{bale.status}</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Warehouse Location</span>
              <p className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                {bale.storageZone.split('(')[0]} → Bay {bale.bayLocation}
              </p>
            </div>
          </div>

          {/* Weight Sensor Breakdown Grid */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 mb-2.5 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>IoT Load Cell Scale Telemetry</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Gross Scale Weight</span>
                <span className="font-semibold text-slate-900 text-sm">{bale.grossWeightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hessian Sheet Tare</span>
                <span className="font-medium text-slate-600 text-sm">{bale.tareWeightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Net Tobacco Weight</span>
                <span className="font-bold text-emerald-700 text-base">{bale.netWeightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Weight Variance</span>
                <span className={`font-semibold text-xs ${
                  bale.weightVariancePct > 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {bale.weightVariancePct > 0 ? `+${bale.weightVariancePct}%` : `${bale.weightVariancePct}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Tobacco Curing Quality & Wrap Dossier */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 mb-2.5">
              AgriLeaf Tobacco (ALT) Hessian Wrap & Leaf Conditioning Telemetry
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${
                isHighMoisture ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block">Leaf Moisture Content</span>
                <span className={`text-base font-bold ${isHighMoisture ? 'text-amber-800' : 'text-slate-900'}`}>
                  {bale.moistureContentPct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {isHighMoisture ? 'Exceeds 15.5% safe limit' : 'Safe curing tolerance'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Hessian Wrap Status</span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                  {bale.altTag.wrapIntegrity}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {bale.altTag.weaveDensityGSM} GSM Weave
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">RFID Frequency & Batch</span>
                <span className="text-xs font-mono font-semibold text-slate-800 block mt-0.5">
                  {bale.altTag.rfidFrequency}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Batch {bale.altTag.batchNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form or Read-only details */}
          {isEditing ? (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <h5 className="font-semibold text-xs text-slate-900">Update Tobacco Bale State</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Quarantined (High Moisture)">Quarantined (High Moisture)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Bay Location</label>
                  <input
                    type="text"
                    value={bay}
                    onChange={(e) => setBay(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Inspector Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Inspector & Ingest Notes</span>
                <p className="text-slate-700 text-xs mt-0.5">{bale.notes || 'No notes provided.'}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs font-medium px-2 py-1 rounded border border-slate-200 bg-white"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => onDispatchBale(bale.id)}
              className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
            >
              Dispatch / Remove from Floor
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all"
            >
              Close Dossier
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
