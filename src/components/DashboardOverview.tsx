import React, { useMemo } from 'react';
import { 
  Bale, 
  SystemStats, 
  WeightSensorScale, 
  ScaleTelemetryPoint, 
  StorageZone,
  NavTab
} from '../types';
import { 
  Scale, 
  Boxes, 
  Droplets, 
  ShieldAlert, 
  Cpu, 
  ArrowUpRight, 
  Clock, 
  PlusCircle, 
  BrainCircuit, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Camera,
  Tag,
  FileCheck
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: SystemStats | null;
  bales: Bale[];
  sensors: WeightSensorScale[];
  telemetry: ScaleTelemetryPoint[];
  onSelectBale: (bale: Bale) => void;
  onOpenWeighIn: (zone?: StorageZone) => void;
  onOpenLeafScanner: () => void;
  onOpenAiAnalysis: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onCalibrateSensor: (id: string) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenManifest?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  bales,
  sensors,
  telemetry,
  onSelectBale,
  onOpenWeighIn,
  onOpenLeafScanner,
  onOpenAiAnalysis,
  onNavigateTab,
  onCalibrateSensor,
  onTriggerSync,
  isSyncing,
  onOpenManifest,
}) => {
  // Aggregate Zone breakdown
  const zoneBreakdown = useMemo(() => {
    const zones: Record<StorageZone, { count: number; totalNetKg: number; avgMoisture: number; maxCapacity: number }> = {
      'Zone A (Flue-Cured Virginia)': { count: 0, totalNetKg: 0, avgMoisture: 0, maxCapacity: 40 },
      'Zone B (Burley & Air-Cured)': { count: 0, totalNetKg: 0, avgMoisture: 0, maxCapacity: 30 },
      'Zone C (Dark Fire-Cured & Oriental)': { count: 0, totalNetKg: 0, avgMoisture: 0, maxCapacity: 25 },
      'Zone D (Auction Floor & Staging)': { count: 0, totalNetKg: 0, avgMoisture: 0, maxCapacity: 20 },
    };

    bales.forEach((b) => {
      if (zones[b.storageZone]) {
        zones[b.storageZone].count += 1;
        zones[b.storageZone].totalNetKg += b.netWeightKg;
        zones[b.storageZone].avgMoisture += b.moistureContentPct;
      }
    });

    Object.keys(zones).forEach((key) => {
      const z = zones[key as StorageZone];
      if (z.count > 0) {
        z.avgMoisture = Number((z.avgMoisture / z.count).toFixed(1));
      }
    });

    return zones;
  }, [bales]);

  // Leaf Moisture safety categories
  const moistureCategories = useMemo(() => {
    let optimal = 0; // 10% - 13.9%
    let stable = 0;  // 14% - 15.4%
    let critical = 0; // >= 15.5%

    bales.forEach((b) => {
      if (b.moistureContentPct >= 15.5) {
        critical++;
      } else if (b.moistureContentPct >= 14.0) {
        stable++;
      } else {
        optimal++;
      }
    });

    const total = bales.length || 1;
    return {
      optimal,
      stable,
      critical,
      optimalPct: Math.round((optimal / total) * 100),
      stablePct: Math.round((stable / total) * 100),
      criticalPct: Math.round((critical / total) * 100),
    };
  }, [bales]);

  // Recent weigh-ins & dispatches (sorted newest first)
  const recentBales = useMemo(() => {
    return [...bales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [bales]);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      'Bale ID',
      'ALT Hessian Tag',
      'Material Variety',
      'Quality Grade',
      'Gross Wt (kg)',
      'Tare Wt (kg)',
      'Net Wt (kg)',
      'Moisture (%)',
      'Storage Zone',
      'Bay',
      'Status',
      'Created At'
    ];
    const rows = bales.map(b => [
      b.id,
      b.altTag.tagId,
      `"${b.material}"`,
      `"${b.grade}"`,
      b.grossWeightKg.toFixed(1),
      b.tareWeightKg.toFixed(1),
      b.netWeightKg.toFixed(1),
      b.moistureContentPct.toFixed(1),
      `"${b.storageZone}"`,
      b.bayLocation,
      `"${b.status}"`,
      b.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tobacco_bales_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800">AgriLeaf Tobacco (ALT)</span>
            <span>·</span>
            <span>Harare Regional Facility</span>
            <span>·</span>
            <span className="font-mono tabular-nums text-slate-700">Zone A–D Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            AgriLeaf Tobacco (ALT) Hessian & Weight Sensor Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track company-issued hessian wraps, detect bale gross/tare/net weights via digital load cells, and scan tobacco leaves to determine quality grades.
          </p>
        </div>

        {/* Quick Executive Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* AI Leaf Grade Scanner Action */}
          <button
            onClick={onOpenLeafScanner}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            title="Scan tobacco leaf to determine quality grade"
          >
            <Camera className="w-4 h-4 text-amber-100" />
            <span>Scan Leaf Grade</span>
          </button>

          {onOpenManifest && (
            <button
              onClick={onOpenManifest}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors shadow-2xs"
              title="Official TIMB Consignment Manifest & Clearance"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Consignment Manifest</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAiAnalysis}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 text-xs font-medium transition-colors shadow-2xs"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-600" />
            <span>AI Risk Audit</span>
          </button>

          <button
            onClick={() => onOpenWeighIn()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Scale Ingest</span>
          </button>
        </div>
      </div>

      {/* Operational Workstations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hessian Tracking & Digital Scale Station */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 shadow-2xs flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                Intake Station
              </span>
              <span className="text-xs font-bold text-slate-800">Hessian Packaging & Digital Scales</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Tracks AgriLeaf Tobacco's RFID-tagged hessian wraps, monitors weave density GSM, and calculates gross, tare, and net weights with digital load cells.
            </p>
            <div className="mt-2.5 flex items-center space-x-3 text-[11px]">
              <button
                onClick={() => onOpenWeighIn()}
                className="font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center space-x-1"
              >
                <span>Weigh-In Bale</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono">Tare Deduction: ~2.8 kg</span>
            </div>
          </div>
        </div>

        {/* Tobacco Leaf Grade Inspection Station */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/50 border border-amber-200/80 shadow-2xs flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
                Quality Station
              </span>
              <span className="text-xs font-bold text-slate-800">Tobacco Leaf Grade Scanner</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Scan leaf specimens with camera or image upload to evaluate color spectra, lamina maturity, and determine its official tobacco grade.
            </p>
            <div className="mt-2.5 flex items-center space-x-3 text-[11px]">
              <button
                onClick={onOpenLeafScanner}
                className="font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center space-x-1"
              >
                <span>Launch Leaf Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono">Gemini Vision</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Tonnage */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Total Net Tonnage</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-light tracking-tight text-slate-900 tabular-nums">
                {stats ? stats.totalNetTonnageMetric : '0.00'}
              </span>
              <span className="text-xs font-medium text-slate-500">Metric Tonnes</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1.5">
              <span>Hessian tare auto-deducted (~2.8 kg/bale)</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Gross Inventory</span>
            <span className="font-mono tabular-nums text-slate-700">
              {stats ? (stats.totalNetTonnageMetric + (stats.totalBalesCount * 0.0028)).toFixed(2) : '0.00'} MT
            </span>
          </div>
        </div>

        {/* Total Bales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Total Tobacco Bales</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-light tracking-tight text-slate-900 tabular-nums">
                {stats ? stats.totalBalesCount : 0}
              </span>
              <span className="text-xs font-medium text-slate-500">bales in warehouse</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              100% UHF RFID scanned & indexed
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button 
              onClick={() => onNavigateTab('bales')}
              className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center space-x-1"
            >
              <span>View Inventory Ledger</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Avg Leaf Moisture */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Avg Leaf Moisture</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-light tracking-tight text-slate-900 tabular-nums">
                {stats ? stats.avgMoisturePct : 0}%
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                (stats?.avgMoisturePct || 0) > 15.5
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {(stats?.avgMoisturePct || 0) > 15.5 ? 'Ferment Alert' : 'Optimal Band'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Safe curing window: 12.0% – 15.0%
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Critical (&gt;15.5%)</span>
            <span className="font-mono tabular-nums text-amber-700 font-semibold">
              {moistureCategories.critical} bales
            </span>
          </div>
        </div>

        {/* Active Load Cell Scales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Digital Scale Sensors</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-light tracking-tight text-slate-900 tabular-nums">
                {sensors.filter(s => s.status === 'Active' || s.status === 'Measuring').length}
                <span className="text-slate-300 font-normal">/{sensors.length}</span>
              </span>
              <span className="text-xs font-medium text-slate-500">scales online</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Strain gauge load cells at 20 Hz
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button 
              onClick={() => onNavigateTab('sensors')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
            >
              <span>Manage Weight Sensors</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Middle Grid: Storage Zones Capacity & Leaf Moisture Surveillance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Storage Zones & Auction Staging Capacity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Tobacco Storage & Auction Staging Capacity
              </h2>
              <p className="text-xs text-slate-500">
                Floor bay occupancy, tonnage distribution, and variety segregation.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bales')}
              className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>View Bales Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {(Object.entries(zoneBreakdown) as [StorageZone, { count: number; totalNetKg: number; avgMoisture: number; maxCapacity: number }][]).map(([zoneName, z]) => {
              const occupancyPct = Math.min(100, Math.round((z.count / z.maxCapacity) * 100));
              const isAuction = zoneName.includes('Auction');

              return (
                <div key={zoneName} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{zoneName}</span>
                      {isAuction && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Active Auction
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span className="font-mono tabular-nums text-slate-700 font-medium">
                        {(z.totalNetKg / 1000).toFixed(2)} MT Net
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-900 font-bold">
                        {z.count} / {z.maxCapacity} bays ({occupancyPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        occupancyPct > 85 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <div className="flex items-center space-x-2">
                      <span>Avg Moisture:</span>
                      <span className={`font-mono tabular-nums font-semibold ${
                        z.avgMoisture > 15.5 ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {z.count > 0 ? `${z.avgMoisture}%` : 'N/A'}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenWeighIn(zoneName as StorageZone)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1"
                    >
                      <span>Ingest to this Zone</span>
                      <span>+</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moisture Risk & Quality Integrity Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Leaf Moisture & Fermentation Risk
              </h2>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous probe monitoring via ALT Hessian fabric weave sensors.
            </p>

            {/* Visual Risk Segmented Bar */}
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${moistureCategories.optimalPct}%` }} 
                  className="bg-emerald-500 h-full" 
                  title={`Optimal: ${moistureCategories.optimal} bales`}
                />
                <div 
                  style={{ width: `${moistureCategories.stablePct}%` }} 
                  className="bg-sky-500 h-full" 
                  title={`Stable: ${moistureCategories.stable} bales`}
                />
                <div 
                  style={{ width: `${moistureCategories.criticalPct}%` }} 
                  className="bg-amber-500 h-full" 
                  title={`Critical Hazard: ${moistureCategories.critical} bales`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>10% Low</span>
                <span>12-15% Optimal</span>
                <span>&gt;15.5% High Risk</span>
              </div>
            </div>

            {/* Categories breakdown */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-emerald-950">Optimal Curing (10.0–13.9%)</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-emerald-900">
                  {moistureCategories.optimal} ({moistureCategories.optimalPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50/50 border border-sky-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-medium text-sky-950">Conditioning Watch (14.0–15.4%)</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-sky-900">
                  {moistureCategories.stable} ({moistureCategories.stablePct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-amber-950">Critical Moisture Hazard (&gt;15.5%)</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-amber-900">
                  {moistureCategories.critical} ({moistureCategories.criticalPct}%)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>AI Curing Protocol</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tobacco bales above 15.5% moisture must be moved to conditioning fans within 4 hours to eliminate mould and leaf darkening risks.
            </p>
          </div>
        </div>

      </div>

      {/* Live Scale Sensors Telemetry Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Live Load Cell Scales & Weighbridges
              </h2>
              <p className="text-xs text-slate-500">
                Calibrated industrial platform scales streaming gross weight, tare deduction, and RFID tag handshake.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('sensors')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center space-x-1"
          >
            <span>Scale Diagnostics & Drift Rates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {sensors.map((scale) => {
            const isMeasuring = scale.status === 'Measuring';
            const isActive = scale.status === 'Active';

            return (
              <div 
                key={scale.id} 
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-900">{scale.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isMeasuring 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {scale.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{scale.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{scale.location}</p>

                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-500">Live Reading</span>
                      <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                        {scale.currentReadingKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Tare Offset:</span>
                      <span className="font-mono tabular-nums">{scale.tareZeroOffsetKg.toFixed(2)} kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {scale.samplingRateHz} Hz
                  </span>
                  <button
                    onClick={() => onCalibrateSensor(scale.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Zero / Tare
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Ingest Activity & Cloud Sync Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Ingested / Weighed Bales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Scale Ingest & Weigh-In Activity
              </h2>
              <p className="text-xs text-slate-500">
                Live stream of automated scale drop events and ALT RFID identifications.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center space-x-1"
            >
              <span>View All ({bales.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Bale ID & Tag</th>
                  <th className="py-2.5 px-3">Variety & Grade</th>
                  <th className="py-2.5 px-3 text-right">Net Wt</th>
                  <th className="py-2.5 px-3 text-right">Moisture</th>
                  <th className="py-2.5 px-3">Zone / Bay</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBales.map((bale) => (
                  <tr 
                    key={bale.id}
                    onClick={() => onSelectBale(bale)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{bale.id}</div>
                      <div className="text-[10px] font-mono text-slate-400">{bale.altTag.tagId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{bale.material}</div>
                      <div className="text-[10px] text-slate-500">{bale.grade}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {bale.netWeightKg.toFixed(1)} kg
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-mono font-bold tabular-nums ${
                        bale.moistureContentPct > 15.5 ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {bale.moistureContentPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-700">{bale.bayLocation}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {bale.storageZone.split('(')[0].trim()}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        bale.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : bale.status.includes('Quarantined')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {bale.status === 'In Stock' ? 'In Stock' : bale.status.includes('Quarantined') ? 'Quarantined' : 'Staged'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cloud Sync & Facility Telemetry Health */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Cloud Telemetry Sync
              </h2>
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center space-x-1"
                title="Force Cloud Sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted ledger sync to Cloud Run European Hub.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Gateway Status</span>
                  <p className="font-semibold text-emerald-700 mt-0.5 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Connected (Active)</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Latency</span>
                  <p className="font-mono tabular-nums text-slate-800 font-bold mt-0.5">18 ms</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Last Cloud Snapshot:</span>
                  <span className="font-mono tabular-nums text-slate-800 font-medium">
                    {stats?.lastCloudSyncAt ? new Date(stats.lastCloudSyncAt).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>ALT Tag Read Reliability:</span>
                  <span className="font-mono tabular-nums text-emerald-700 font-bold">99.94%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Active Scale Zero Drift:</span>
                  <span className="font-mono tabular-nums text-slate-800">&plusmn;0.04 kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('analytics')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors flex items-center justify-center space-x-1"
            >
              <span>View Full Cloud Sync & Audit Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
