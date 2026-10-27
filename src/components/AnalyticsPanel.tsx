import React from 'react';
import { Bale, CloudSyncLog } from '../types';
import { BarChart3, CloudCheck, Activity, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface AnalyticsPanelProps {
  bales: Bale[];
  cloudLogs: CloudSyncLog[];
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  bales,
  cloudLogs,
  onTriggerSync,
  isSyncing
}) => {
  // Aggregate Tobacco Variety distribution
  const materialCounts: Record<string, number> = {};
  const materialTonnage: Record<string, number> = {};

  bales.forEach((b) => {
    materialCounts[b.material] = (materialCounts[b.material] || 0) + 1;
    materialTonnage[b.material] = (materialTonnage[b.material] || 0) + (b.netWeightKg / 1000);
  });

  const materialData = Object.keys(materialCounts).map((mat) => ({
    name: mat.split(' ')[0], // short name for x-axis
    fullName: mat,
    count: materialCounts[mat],
    tonnage: Math.round(materialTonnage[mat] * 100) / 100,
  }));

  const COLORS = ['#059669', '#0d9488', '#d97706', '#6366f1', '#475569', '#ca8a04'];

  // Aggregate Zone Net Tonnage
  const zoneTonnage: Record<string, number> = {};
  bales.forEach((b) => {
    const shortZone = b.storageZone.split('(')[0].trim();
    zoneTonnage[shortZone] = (zoneTonnage[shortZone] || 0) + (b.netWeightKg / 1000);
  });

  const zoneData = Object.keys(zoneTonnage).map((z) => ({
    zone: z,
    tonnage: Math.round(zoneTonnage[z] * 100) / 100,
  }));

  return (
    <div className="space-y-6 my-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Tobacco Inventory Analytics & Cloud Sync Audit</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Variety tonnage distributions, storage bay allocations, and IoT cloud sync latency logs.
            </p>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs disabled:opacity-50"
          >
            <CloudCheck className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Force Cloud Sync'}</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Variety Tonnage Bar Chart */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Net Tonnage by Tobacco Variety (Metric Tonnes)</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: '12px' }}
                    formatter={(val: any, name: any, item: any) => [`${val} MT`, item?.payload?.fullName || 'Net Tonnage']}
                  />
                  <Bar dataKey="tonnage" radius={[4, 4, 0, 0]}>
                    {materialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Distribution Bar Chart */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Storage Zone Capacity & Tonnage (MT)</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="zone" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} MT`, 'Zone Net Tonnage']}
                  />
                  <Bar dataKey="tonnage" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Cloud Telemetry Sync Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <CloudCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Cloud Telemetry Sync Audit Stream</h3>
          </div>
          <span className="text-xs text-slate-400">Node: <strong className="text-slate-700 font-mono">us-east-cloud-1</strong></span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Event ID</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Bale Ref</th>
                <th className="py-2.5 px-3 font-semibold">Payload & Latency</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {cloudLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800 text-[11px]">{log.id}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {log.event}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 text-xs">{log.baleId || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {log.payloadSizeKb} KB • <span className="text-emerald-700 font-semibold">{log.syncLatencyMs}ms</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-xs truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
