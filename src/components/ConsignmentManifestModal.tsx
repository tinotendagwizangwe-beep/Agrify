import React, { useState } from 'react';
import { Bale } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Leaf, 
  FileCheck, 
  Scale, 
  QrCode, 
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

interface ConsignmentManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bales: Bale[];
}

export const ConsignmentManifestModal: React.FC<ConsignmentManifestModalProps> = ({
  isOpen,
  onClose,
  bales,
}) => {
  if (!isOpen) return null;

  const [destination, setDestination] = useState<string>('Harare Central Auction Floor — Bidding Row Lot #4');
  const [copied, setCopied] = useState<boolean>(false);

  const manifestId = 'ALT-MNF-2026-8942';
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const issueTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalNetKg = bales.reduce((sum, b) => sum + b.netWeightKg, 0);
  const totalGrossKg = bales.reduce((sum, b) => sum + b.grossWeightKg, 0);
  const totalTareKg = bales.reduce((sum, b) => sum + b.tareWeightKg, 0);
  const avgMoisture = bales.length > 0
    ? (bales.reduce((sum, b) => sum + b.moistureContentPct, 0) / bales.length).toFixed(1)
    : '0.0';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Manifest_ID',
      'Bale_ID',
      'ALT_Hessian_Tag',
      'Tobacco_Variety',
      'Quality_Grade',
      'Gross_Weight_Kg',
      'Tare_Deduction_Kg',
      'Net_Weight_Kg',
      'Moisture_Pct',
      'Warehouse_Bay',
      'Status'
    ];
    const rows = bales.map(b => [
      manifestId,
      b.id,
      b.altTag.tagId,
      `"${b.material}"`,
      `"${b.grade}"`,
      b.grossWeightKg.toFixed(1),
      b.tareWeightKg.toFixed(1),
      b.netWeightKg.toFixed(1),
      b.moistureContentPct.toFixed(1),
      b.bayLocation,
      `"${b.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALT_Consignment_Manifest_${manifestId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:my-0 print:rounded-none">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">Official Consignment Manifest & Clearance</span>
              <span className="text-[10px] text-slate-400 block">AgriLeaf Tobacco (ALT) TIMB Export Standard</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Manifest Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs flex-1 bg-white print:p-0">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  AgriLeaf Tobacco (ALT)
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  Harare Regional Tobacco Logistics & Leaf Conditioning Hub
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  TIMB License #ALT-ZW-2026 · Registered Consignor
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold">
                <span>{manifestId}</span>
                <button
                  onClick={handleCopyManifest}
                  className="p-0.5 text-emerald-700 hover:text-emerald-950 print:hidden"
                  title="Copy Manifest ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Date: <strong className="text-slate-800">{issueDate}</strong> · <span className="font-mono">{issueTime}</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Weighbridge Certified & Sealed</span>
              </p>
            </div>
          </div>

          {/* Consignment Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Consignor Facility</span>
              <p className="font-semibold text-slate-900 text-xs mt-0.5">AgriLeaf Tobacco (ALT) HQ</p>
              <p className="text-[11px] text-slate-500">Intake Weighbridge Terminal A</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination Terminal</span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 mt-0.5 print:border-none print:p-0 print:bg-transparent font-medium"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Wrap & Tare Standard</span>
              <p className="font-semibold text-slate-900 text-xs mt-0.5">ALT Jute Hessian (325 GSM)</p>
              <p className="text-[11px] text-slate-500">Tare Offset: 2.80 kg / bale deducted</p>
            </div>
          </div>

          {/* Certified Weight & Quality Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block">Certified Net Tonnage</span>
              <span className="font-mono text-lg font-bold text-slate-900 block mt-0.5">
                {(totalNetKg / 1000).toFixed(3)} <span className="text-xs font-normal text-slate-500">MT</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{totalNetKg.toFixed(1)} kg net</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block">Bale Count</span>
              <span className="font-mono text-lg font-bold text-slate-900 block mt-0.5">
                {bales.length} <span className="text-xs font-normal text-slate-500">bales</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">100% ALT RFID tagged</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block">Tare Wrap Deduction</span>
              <span className="font-mono text-lg font-bold text-slate-900 block mt-0.5">
                {totalTareKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Gross: {totalGrossKg.toFixed(1)} kg</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block">Average Moisture</span>
              <span className={`font-mono text-lg font-bold block mt-0.5 ${
                Number(avgMoisture) > 15.5 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {avgMoisture}%
              </span>
              <span className="text-[10px] text-slate-500">Optimal Band (&lt;15.5%)</span>
            </div>
          </div>

          {/* Consignment Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Bale ID</th>
                  <th className="py-2 px-3">ALT Hessian Tag</th>
                  <th className="py-2 px-3">Tobacco Variety</th>
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3 text-right">Gross (kg)</th>
                  <th className="py-2 px-3 text-right">Tare (kg)</th>
                  <th className="py-2 px-3 text-right">Net Wt (kg)</th>
                  <th className="py-2 px-3 text-right">Moisture</th>
                  <th className="py-2 px-3">Bay Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bales.map((b, i) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="py-2 px-3 font-mono text-emerald-800">{b.altTag.tagId}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{b.material}</td>
                    <td className="py-2 px-3 font-semibold text-slate-700">{b.grade}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">{b.grossWeightKg.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">{b.tareWeightKg.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{b.netWeightKg.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{b.moistureContentPct.toFixed(1)}%</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{b.bayLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Signatures & Verification Seal */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center p-2">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <span className="font-mono font-semibold text-slate-800 block">QR AUDIT VALIDATION</span>
                <span>Scan for encrypted cloud ledger verification.</span>
                <span className="block font-mono text-[9px] text-slate-400">HASH: SHA-256 #ALT-9042-78F9</span>
              </div>
            </div>

            <div className="flex items-center space-x-8 text-center text-[10px] text-slate-500">
              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 pb-4 font-mono font-semibold text-slate-800 text-xs">
                  T. Gwizangwe
                </div>
                <span>Weighbridge Officer</span>
              </div>

              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 pb-4 font-mono font-semibold text-slate-800 text-xs">
                  M. Ndlovu
                </div>
                <span>TIMB Chief Inspector</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar (Hidden in Print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <span>AgriLeaf Tobacco (ALT) System · Ready for official distribution</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Close Manifest
          </button>
        </div>

      </div>
    </div>
  );
};
