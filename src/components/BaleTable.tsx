import React, { useState } from 'react';
import { Bale, MaterialType, StorageZone, QualityGrade } from '../types';
import { 
  Search, 
  Boxes, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  ArrowUpDown, 
  Tag, 
  ChevronRight,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface BaleTableProps {
  bales: Bale[];
  onSelectBale: (bale: Bale) => void;
  onDispatchBale: (id: string) => void;
  onOpenWeighIn: () => void;
  onOpenManifest?: () => void;
}

export const BaleTable: React.FC<BaleTableProps> = ({
  bales,
  onSelectBale,
  onDispatchBale,
  onOpenWeighIn,
  onOpenManifest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'netWeightKg' | 'moistureContentPct'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const TOBACCO_MATERIALS = [
    'ALL',
    'Flue-Cured Virginia',
    'Burley Leaf',
    'Dark Fire-Cured',
    'Oriental / Sun-Cured',
    'Dark Air-Cured',
    'Lugs & Primings'
  ];

  const TOBACCO_GRADES = [
    'ALL',
    'Grade A1 (Choice Lemon)',
    'Grade B1 (Fine Orange)',
    'Grade C2 (Standard Cutter)',
    'Grade X (Clean Lugs)',
    'Export Premium'
  ];

  // Filter logic
  const filteredBales = bales.filter((bale) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      bale.id.toLowerCase().includes(query) ||
      bale.altTag.tagId.toLowerCase().includes(query) ||
      bale.material.toLowerCase().includes(query) ||
      bale.bayLocation.toLowerCase().includes(query) ||
      bale.altTag.batchNumber.toLowerCase().includes(query);

    const matchesMaterial = selectedMaterial === 'ALL' || bale.material === selectedMaterial;
    const matchesGrade = selectedGrade === 'ALL' || bale.grade === selectedGrade;
    const matchesZone = selectedZone === 'ALL' || bale.storageZone === selectedZone;
    const matchesStatus = selectedStatus === 'ALL' || bale.status === selectedStatus;

    return matchesSearch && matchesMaterial && matchesGrade && matchesZone && matchesStatus;
  });

  const isFiltered = searchQuery !== '' || selectedMaterial !== 'ALL' || selectedGrade !== 'ALL' || selectedStatus !== 'ALL' || selectedZone !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMaterial('ALL');
    setSelectedGrade('ALL');
    setSelectedZone('ALL');
    setSelectedStatus('ALL');
  };

  const filteredNetKg = filteredBales.reduce((acc, b) => acc + b.netWeightKg, 0);
  const filteredAvgMoisture = filteredBales.length > 0 
    ? (filteredBales.reduce((acc, b) => acc + b.moistureContentPct, 0) / filteredBales.length).toFixed(1)
    : '0.0';

  // Sort logic
  const sortedBales = [...filteredBales].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'createdAt') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'createdAt' | 'netWeightKg' | 'moistureContentPct') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = 'Bale_ID,ALT_Tag,Tobacco_Variety,Grade,Gross_Kg,Tare_Kg,Net_Kg,Moisture_Pct,Zone,Bay,Status\n';
    const rows = sortedBales.map(b => 
      `${b.id},${b.altTag.tagId},"${b.material}","${b.grade}",${b.grossWeightKg},${b.tareWeightKg},${b.netWeightKg},${b.moistureContentPct},"${b.storageZone}",${b.bayLocation},"${b.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tobacco_bales_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs my-6">
      
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Tobacco Bale Inventory Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered AgriLeaf Tobacco (ALT) hessian-wrapped bales across weighbridges and auction storage bays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bale ID, ALT Tag, Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Consignment Manifest Button */}
          {onOpenManifest && (
            <button
              onClick={onOpenManifest}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition-all shadow-2xs"
              title="Generate Official Consignment Manifest & Weighbridge Clearance"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Consignment Manifest</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Ingest Button */}
          <button
            onClick={onOpenWeighIn}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs"
          >
            + Ingest Scale Drop
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Tobacco Variety Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Variety:</span>
          {TOBACCO_MATERIALS.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap ${
                selectedMaterial === mat
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {mat === 'ALL' ? 'All Varieties' : mat}
            </button>
          ))}
        </div>

        {/* Quality Grade & Status Filter */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-medium">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
            >
              {TOBACCO_GRADES.map(g => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400 font-medium">Status:</span>
            {['ALL', 'In Stock', 'Ready for Dispatch', 'Quarantined (High Moisture)'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  selectedStatus === st
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'Quarantined (High Moisture)' ? 'Quarantine' : st}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Summary Metrics Bar for Filtered Results */}
      <div className="py-2.5 px-3 my-2 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-3">
          <span>Showing <strong className="text-slate-900 font-mono">{sortedBales.length}</strong> of {bales.length} bales</span>
          <span>·</span>
          <span>Filtered Net Tonnage: <strong className="text-emerald-800 font-mono">{(filteredNetKg / 1000).toFixed(3)} MT</strong></span>
          <span>·</span>
          <span>Avg Moisture: <strong className="text-slate-900 font-mono">{filteredAvgMoisture}%</strong></span>
        </div>

        {isFiltered && (
          <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Active Filter Applied
          </span>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-3 font-semibold">Bale ID & ALT Hessian</th>
              <th className="py-3 px-3 font-semibold">Tobacco Variety & Grade</th>
              <th 
                onClick={() => toggleSort('netWeightKg')}
                className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Net Weight (kg)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                onClick={() => toggleSort('moistureContentPct')}
                className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Moisture</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 font-semibold">Warehouse Bay</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedBales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No tobacco bales match current filters.
                </td>
              </tr>
            ) : (
              sortedBales.map((bale) => {
                const isQuarantine = bale.status.includes('Quarantined');
                const isHighMoisture = bale.moistureContentPct >= 15.5;

                return (
                  <tr 
                    key={bale.id}
                    onClick={() => onSelectBale(bale)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Bale ID & Tag */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-slate-900 text-xs">
                          {bale.id}
                        </span>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono">{bale.altTag.tagId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tobacco Material & Grade */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-medium text-slate-900">{bale.material}</span>
                        <span className="block text-[11px] text-slate-500">{bale.grade}</span>
                      </div>
                    </td>

                    {/* Weights */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm">{bale.netWeightKg} kg</span>
                        <span className="block text-[10px] text-slate-400">
                          Gross {bale.grossWeightKg}kg • Tare {bale.tareWeightKg}kg
                        </span>
                      </div>
                    </td>

                    {/* Moisture */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-medium ${isHighMoisture ? 'text-amber-700' : 'text-slate-700'}`}>
                          {bale.moistureContentPct}%
                        </span>
                        {isHighMoisture && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            High
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Storage Bay */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {bale.bayLocation}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
                          {bale.storageZone.split('(')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {isQuarantine ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>Quarantined</span>
                        </span>
                      ) : bale.status === 'Ready for Dispatch' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectBale(bale)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
