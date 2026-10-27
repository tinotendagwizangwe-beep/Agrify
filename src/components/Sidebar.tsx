import React, { useEffect } from 'react';
import { 
  Bale, 
  SystemStats, 
  WeightSensorScale, 
  StorageZone,
  NavTab,
  StaffUser,
  isAdmin
} from '../types';
import { 
  X, 
  LayoutDashboard, 
  Boxes, 
  Scale, 
  BarChart3, 
  Leaf, 
  PlusCircle, 
  BrainCircuit, 
  FileSpreadsheet, 
  RefreshCw, 
  Cpu, 
  Radio, 
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Clock,
  LogOut,
  UserCheck,
  Terminal,
  ShieldCheck,
  Camera,
  FileCheck,
  Keyboard
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats: SystemStats | null;
  bales: Bale[];
  sensors: WeightSensorScale[];
  onOpenWeighIn: (zone?: StorageZone) => void;
  onOpenLeafScanner: () => void;
  onOpenAiAnalysis: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  currentUser: StaffUser | null;
  onLogout: () => void;
  onOpenManifest?: () => void;
  onOpenShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  stats,
  bales,
  sensors,
  onOpenWeighIn,
  onOpenLeafScanner,
  onOpenAiAnalysis,
  onTriggerSync,
  isSyncing,
  currentUser,
  onLogout,
  onOpenManifest,
  onOpenShortcuts
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Export CSV handler directly from sidebar
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
    link.setAttribute('download', `tobacco_inventory_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Overview', 
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: 'Main'
    },
    { 
      id: 'bales', 
      label: 'Tobacco Bales Ledger', 
      icon: <Boxes className="w-4 h-4" />,
      badge: `${bales.length}`
    },
    { 
      id: 'sensors', 
      label: 'Weight Sensors & Scales', 
      icon: <Scale className="w-4 h-4" />,
      badge: `${sensors.length} online`
    },
    { 
      id: 'analytics', 
      label: 'Analytics & Cloud Logs', 
      icon: <BarChart3 className="w-4 h-4" />
    },
  ];

  // Strictly restricted to Tinotenda Gwizangwe / System Administrator
  if (isAdmin(currentUser)) {
    navItems.push({
      id: 'admin',
      label: 'Admin & Dev Console',
      icon: <Terminal className="w-4 h-4 text-emerald-500" />,
      badge: 'ROOT'
    });
  }

  const zones: { name: StorageZone; label: string; variety: string }[] = [
    { name: 'Zone A (Flue-Cured Virginia)', label: 'Zone A', variety: 'Flue-Cured Virginia' },
    { name: 'Zone B (Burley & Air-Cured)', label: 'Zone B', variety: 'Burley & Air-Cured' },
    { name: 'Zone C (Dark Fire-Cured & Oriental)', label: 'Zone C', variety: 'Fire-Cured & Oriental' },
    { name: 'Zone D (Auction Floor & Staging)', label: 'Zone D', variety: 'Auction Floor Staging' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Off-canvas Left Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-84 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main Navigation Menu"
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  AGRI-FY
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IoT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                AgriLeaf Tobacco (ALT) System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Sidebar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
          
          {/* Authenticated Staff Operator Context */}
          {currentUser && (
            <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
              isAdmin(currentUser) ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {isAdmin(currentUser) ? 'Root Administrator' : 'Active Operator'}
                </span>
                <span className="flex items-center space-x-1 text-emerald-700 font-medium text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{isAdmin(currentUser) ? 'Full System Dev' : 'Terminal Active'}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2.5 pt-0.5">
                <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isAdmin(currentUser) ? 'bg-emerald-700 shadow-2xs' : 'bg-slate-900'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-900 truncate flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    {isAdmin(currentUser) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {currentUser.role} · {currentUser.staffId}
                  </div>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200/60 flex items-center justify-between">
                <span className="truncate">{currentUser.assignedStation}</span>
              </div>
            </div>
          )}

          {/* Primary Navigation Sections */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Views & Consoles
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono tabular-nums ${
                        isActive
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Operational Quick Actions Panel */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operational Actions
            </div>
            <div className="space-y-1.5">
              
              {/* AI Leaf Grade Scanner */}
              <button
                onClick={() => {
                  onClose();
                  onOpenLeafScanner();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-amber-950 border border-amber-200/90 font-semibold transition-colors"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <div className="text-left flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span>AI Leaf Grade Scanner</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full">
                      Vision
                    </span>
                  </div>
                  <div className="text-[10px] font-normal text-amber-800">Scan leaf photo to determine quality grade</div>
                </div>
              </button>

              {/* Scale Drop Weigh In */}
              <button
                onClick={() => {
                  onClose();
                  onOpenWeighIn();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <div className="text-left flex-1">
                  <div>Scale Ingest (Weigh-In)</div>
                  <div className="text-[10px] font-normal text-emerald-700">Detect weight & auto tare ALT wrap</div>
                </div>
              </button>

              {/* Gemini AI Moisture Audit */}
              <button
                onClick={() => {
                  onClose();
                  onOpenAiAnalysis();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors"
              >
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <div className="text-left flex-1">
                  <div className="font-medium">AI Leaf Hazard Audit</div>
                  <div className="text-[10px] text-slate-500">Gemini moisture & fermentation check</div>
                </div>
              </button>

              {/* Official Consignment Manifest */}
              {onOpenManifest && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenManifest();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <div className="text-left flex-1">
                    <span className="font-medium">Consignment Manifest</span>
                    <span className="text-[10px] text-slate-400 block">TIMB clearance & print dispatch</span>
                  </div>
                </button>
              )}

              {/* Keyboard Shortcuts */}
              {onOpenShortcuts && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-slate-500" />
                  <div className="text-left flex-1">
                    <span className="font-medium">Keyboard Shortcuts</span>
                    <span className="text-[10px] text-slate-400 block">Quick hotkeys cheat-sheet (?)</span>
                  </div>
                </button>
              )}

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span>Export Inventory CSV</span>
              </button>

              {/* Cloud Sync */}
              <button
                onClick={() => {
                  onTriggerSync();
                  onClose();
                }}
                disabled={isSyncing}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Sync Cloud Snapshot</span>
                </div>
                <span className="text-[10px] text-slate-400">18ms</span>
              </button>

            </div>
          </div>

          {/* Quick Sector / Storage Zone Shortcuts */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Sector Jumps
            </div>
            <div className="space-y-1">
              {zones.map((zone) => {
                const zoneCount = bales.filter(b => b.storageZone === zone.name).length;
                return (
                  <button
                    key={zone.name}
                    onClick={() => {
                      onSelectTab('bales');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <div className="text-left truncate">
                      <span className="font-semibold text-slate-800">{zone.label}: </span>
                      <span className="text-[11px] text-slate-500">{zone.variety}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums shrink-0 ml-2">
                      {zoneCount} bales
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hardware & ALT Hessian Telemetry Specs */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-500">
            <div className="font-semibold text-slate-700 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>AgriLeaf Tobacco (ALT) Specs</span>
            </div>
            <div className="flex justify-between">
              <span>RFID UHF Protocol:</span>
              <span className="font-mono text-slate-700">865.6 MHz ISO</span>
            </div>
            <div className="flex justify-between">
              <span>Sampling Frequency:</span>
              <span className="font-mono text-slate-700">20 Hz Load Cells</span>
            </div>
            <div className="flex justify-between">
              <span>Calibrated Tare:</span>
              <span className="font-mono text-slate-700">~2.8 kg / wrap</span>
            </div>
            <div className="flex justify-between">
              <span>Moisture Danger:</span>
              <span className="font-mono text-amber-700 font-semibold">&gt; 15.5%</span>
            </div>
          </div>

        </div>

        {/* Sidebar Footer with Log Out Action */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">AGRI-FY v2.4.0</span>
            <span className="text-[10px] text-slate-400">Harare Facility · 99.8% Online</span>
          </div>

          {currentUser && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors font-medium text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
