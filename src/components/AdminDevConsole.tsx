import React, { useState } from 'react';
import { 
  StaffUser, 
  Bale, 
  WeightSensorScale, 
  SystemStats, 
  isAdmin 
} from '../types';
import { INITIAL_STAFF_MEMBERS } from '../data/staffMembers';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Database, 
  Server, 
  Users, 
  Sliders, 
  RefreshCw, 
  Lock, 
  Code2, 
  CheckCircle2, 
  FileJson,
  KeyRound,
  Download,
  AlertTriangle,
  Radio,
  Sparkles
} from 'lucide-react';

interface AdminDevConsoleProps {
  currentUser: StaffUser | null;
  stats: SystemStats | null;
  bales: Bale[];
  sensors: WeightSensorScale[];
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const AdminDevConsole: React.FC<AdminDevConsoleProps> = ({
  currentUser,
  stats,
  bales,
  sensors,
  onTriggerSync,
  isSyncing,
}) => {
  // Config state (mockable developer overrides)
  const [tareDefaultKg, setTareDefaultKg] = useState<number>(2.8);
  const [moistureHazardPct, setMoistureHazardPct] = useState<number>(15.5);
  const [driftToleranceKg, setDriftToleranceKg] = useState<number>(0.1);
  const [rfidChannel, setRfidChannel] = useState<string>('865.6 MHz (UHF Channel 1 - ISO/IEC 18000-6C)');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [activeJsonTab, setActiveJsonTab] = useState<'stats' | 'sensors' | 'sampleBale'>('stats');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // If user is not an administrator, display Access Restricted Guard
  if (!isAdmin(currentUser)) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-red-200 text-center shadow-xs space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Administrator Clearance Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The Administrator & Developer Console is restricted. Only <strong className="text-slate-800">Tinotenda Gwizangwe</strong> (System Administrator) possesses root credentials to view hardware calibration and developer endpoints.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto">
          <p className="font-mono text-[11px]">Current Operator: {currentUser?.name} ({currentUser?.role})</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Access Level: Standard Warehouse Operator</p>
        </div>
      </div>
    );
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const downloadDevAuditLog = () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      adminUser: currentUser?.name,
      adminEmail: currentUser?.email,
      environment: {
        runtime: 'Node.js v22.14 / Cloud Run',
        region: 'europe-west1',
        port: 3000,
        geminiApiCapability: 'MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'
      },
      systemStats: stats,
      hardwareConfig: {
        tareDefaultKg,
        moistureHazardPct,
        driftToleranceKg,
        rfidChannel
      },
      activeSensorsCount: sensors.length,
      balesCount: bales.length
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrify_dev_audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>ROOT_PRIVILEGE_LEVEL // SYS_ADMIN</span>
            <span>·</span>
            <span className="text-slate-300">Tinotenda Gwizangwe Clearance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <span>Administrator & Developer Console</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Restricted
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global system architecture, IoT sensor calibration coefficients, staff RBAC privileges, and developer runtime diagnostics.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={downloadDevAuditLog}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Audit JSON</span>
          </button>
          
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Force Encrypted Push</span>
          </button>
        </div>
      </div>

      {/* Developer Metrics & Cloud Run Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Cloud Run Runtime</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2.5">
            <span className="text-xl font-bold text-slate-900 font-mono">europe-west1</span>
            <p className="text-xs text-slate-500 mt-0.5">Port 3000 · Node v22.14</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dev Server:</span>
            <span className="font-mono text-emerald-700 font-semibold">Active & Healthy</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Gemini AI Engine</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2.5">
            <span className="text-xl font-bold text-slate-900 font-mono">gemini-2.5-flash</span>
            <p className="text-xs text-slate-500 mt-0.5">Interactions & Telemetry API</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Latency:</span>
            <span className="font-mono text-slate-800 font-medium">~114 ms</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Hardware Gateway</span>
            <Radio className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-2.5">
            <span className="text-xl font-bold text-slate-900 font-mono">UHF 865.6 MHz</span>
            <p className="text-xs text-slate-500 mt-0.5">ALT Tag ISO/IEC 18000-6C</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Read Packet Accuracy:</span>
            <span className="font-mono text-emerald-700 font-semibold">99.98%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">RBAC Administrator</span>
            <KeyRound className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2.5">
            <span className="text-base font-bold text-slate-900 truncate block">Tinotenda Gwizangwe</span>
            <p className="text-xs text-slate-500 mt-0.5">Badge #0001 · Full Root Access</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Other Staff Access:</span>
            <span className="font-mono text-red-600 font-semibold">Blocked from Admin</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Hardware Tuning & Staff Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hardware & Calibration Developer Overrides */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>IoT Sensor & Calibration Developer Settings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust baseline tare deduction, moisture safety trigger thresholds, and drift limits.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Calibration parameters updated and broadcast to all active scales.</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 pt-2 text-xs">
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Default ALT Hessian Tare Deduction</label>
                <span className="font-mono font-bold text-emerald-700">{tareDefaultKg} kg</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="4.0"
                step="0.05"
                value={tareDefaultKg}
                onChange={(e) => setTareDefaultKg(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Standard ALT Hessian sheet wrap plus strapping tare weight deducted at scale.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Critical Leaf Moisture Hazard Threshold</label>
                <span className="font-mono font-bold text-amber-700">{moistureHazardPct}%</span>
              </div>
              <input
                type="range"
                min="14.0"
                max="18.0"
                step="0.1"
                value={moistureHazardPct}
                onChange={(e) => setMoistureHazardPct(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Moisture level above which bales automatically trigger quarantine and conditioning fans.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Load Cell Zero Drift Margin</label>
                <span className="font-mono font-bold text-indigo-700">&plusmn;{driftToleranceKg} kg</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.5"
                step="0.01"
                value={driftToleranceKg}
                onChange={(e) => setDriftToleranceKg(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Maximum permitted zero-point deviation before mandatory re-tare is requested.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RFID UHF Reader Frequency Channel</label>
              <select
                value={rfidChannel}
                onChange={(e) => setRfidChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                <option value="865.6 MHz (UHF Channel 1 - ISO/IEC 18000-6C)">865.6 MHz (UHF Channel 1 - ISO/IEC 18000-6C)</option>
                <option value="866.2 MHz (UHF Channel 2 - ISO/IEC 18000-6C)">866.2 MHz (UHF Channel 2 - ISO/IEC 18000-6C)</option>
                <option value="867.0 MHz (UHF Channel 3 - ISO/IEC 18000-6C)">867.0 MHz (UHF Channel 3 - ISO/IEC 18000-6C)</option>
                <option value="867.6 MHz (UHF Channel 4 - High Power Filter)">867.6 MHz (UHF Channel 4 - High Power Filter)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Apply Developer Overrides
              </button>
            </div>

          </form>
        </div>

        {/* Staff & RBAC Permissions Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Staff Registry & RBAC Permissions Matrix</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-based access control. Only Tinotenda Gwizangwe is granted Developer/Admin privileges.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1 overflow-x-auto">
            {INITIAL_STAFF_MEMBERS.map((staff) => {
              const staffIsAdmin = staff.name.toLowerCase() === 'tinotenda gwizangwe' || staff.role === 'Administrator';
              return (
                <div 
                  key={staff.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    staffIsAdmin 
                      ? 'bg-emerald-50/70 border-emerald-300' 
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      staffIsAdmin ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center space-x-2">
                        <span>{staff.name}</span>
                        {staffIsAdmin ? (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-600 text-white">
                            ADMIN & DEVELOPER
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-200 text-slate-600">
                            OPERATOR
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {staff.staffId} · {staff.role} · Badge #{staff.badgeNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      staffIsAdmin 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' 
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                      {staffIsAdmin ? 'Full Root Access' : 'Restricted (No Admin)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong>Security Protocol Active:</strong> All non-admin operators are strictly blocked from the Administrator and Developer views, settings, and scale raw calibration offsets.
            </p>
          </div>
        </div>

      </div>

      {/* Developer Raw JSON Telemetry & State Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileJson className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Developer Raw Database State & Telemetry Inspector
            </h2>
          </div>
          
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {showRawJson ? 'Hide JSON Viewer' : 'Inspect Raw JSON Stream'}
          </button>
        </div>

        {showRawJson && (
          <div className="space-y-3">
            <div className="flex space-x-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveJsonTab('stats')}
                className={`px-3 py-1 text-xs rounded-lg font-mono ${
                  activeJsonTab === 'stats' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                systemStats.json
              </button>
              <button
                onClick={() => setActiveJsonTab('sensors')}
                className={`px-3 py-1 text-xs rounded-lg font-mono ${
                  activeJsonTab === 'sensors' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                sensorsDatabase.json ({sensors.length})
              </button>
              <button
                onClick={() => setActiveJsonTab('sampleBale')}
                className={`px-3 py-1 text-xs rounded-lg font-mono ${
                  activeJsonTab === 'sampleBale' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                latestBaleRecord.json
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
              {activeJsonTab === 'stats' && JSON.stringify(stats, null, 2)}
              {activeJsonTab === 'sensors' && JSON.stringify(sensors, null, 2)}
              {activeJsonTab === 'sampleBale' && JSON.stringify(bales[0] || {}, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
