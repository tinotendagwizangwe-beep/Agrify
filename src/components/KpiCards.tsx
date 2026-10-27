import React from 'react';
import { SystemStats } from '../types';
import { Scale, Boxes, Droplets, ShieldAlert, Cpu } from 'lucide-react';

interface KpiCardsProps {
  stats: SystemStats | null;
  onFilterQuarantine?: () => void;
  onFilterSensors?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats, onFilterQuarantine, onFilterSensors }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse border border-slate-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
      
      {/* Total Tonnage */}
      <div id="kpi-card-tonnage" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tobacco Net Weight</span>
          <div className="p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60">
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-light text-slate-900 tracking-tight">
            {stats.totalNetTonnageMetric} <span className="text-sm font-normal text-slate-400">MT</span>
          </span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Net (Ex. Tare)
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ALT Hessian Tare Auto-Deducted
        </p>
      </div>

      {/* Active Bales */}
      <div id="kpi-card-bales" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tobacco Bales</span>
          <div className="p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60">
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-light text-slate-900 tracking-tight">
            {stats.totalBalesCount} <span className="text-sm font-normal text-slate-400">bales</span>
          </span>
          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            RFID Active
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Flue-Cured, Burley & Fire-Cured
        </p>
      </div>

      {/* Moisture Content */}
      <div id="kpi-card-moisture" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Leaf Moisture</span>
          <div className="p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60">
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-light text-slate-900 tracking-tight">
            {stats.avgMoisturePct}%
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
            stats.avgMoisturePct > 15.5 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {stats.avgMoisturePct > 15.5 ? 'High Risk' : 'Optimal (12-15%)'}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ALT Hessian Weave Probe Telemetry
        </p>
      </div>

      {/* Active Weight Sensors */}
      <div 
        id="kpi-card-sensors" 
        onClick={onFilterSensors}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Load Cell Scales</span>
          <div className="p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/60 group-hover:bg-slate-100 transition-colors">
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-light text-slate-900 tracking-tight">
            {stats.activeSensorsCount} <span className="text-sm font-normal text-slate-400">scales</span>
          </span>
          <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            20 Hz Live
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 group-hover:text-slate-900 transition-colors flex items-center justify-between">
          <span>Manage Ingest Scales</span>
          <span>→</span>
        </p>
      </div>

      {/* Quarantined & Leaf Hazard Alerts */}
      <div 
        id="kpi-card-alerts" 
        onClick={onFilterQuarantine}
        className={`rounded-xl p-5 border shadow-xs transition-all cursor-pointer group ${
          stats.activeAlertsCount > 0 
            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conditioning Alert</span>
          <div className={`p-2 rounded-lg ${
            stats.activeAlertsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-emerald-600 border border-slate-200/60'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-light text-slate-900 tracking-tight">
            {stats.quarantinedCount} <span className="text-sm font-normal text-slate-400">bales</span>
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
            stats.activeAlertsCount > 0 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {stats.activeAlertsCount > 0 ? `${stats.activeAlertsCount} Action Req.` : 'All Optimal'}
          </span>
        </div>
        <p className={`mt-2 text-xs flex items-center justify-between ${
          stats.activeAlertsCount > 0 ? 'text-amber-800 font-medium' : 'text-slate-500'
        }`}>
          <span>{stats.activeAlertsCount > 0 ? 'View High Moisture Bales' : 'Zero Moisture Hazard'}</span>
          <span>→</span>
        </p>
      </div>

    </div>
  );
};
