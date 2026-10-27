import React, { useState, useEffect } from 'react';
import { 
  Bale, 
  SystemStats, 
  WeightSensorScale, 
  ScaleTelemetryPoint, 
  CloudSyncLog, 
  WeighInRequest, 
  StorageZone,
  NavTab,
  StaffUser,
  isAdmin,
  QualityGrade,
  MaterialType
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StaffLoginPage } from './components/StaffLoginPage';
import { DashboardOverview } from './components/DashboardOverview';
import { BaleTable } from './components/BaleTable';
import { SensorsPanel } from './components/SensorsPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AdminDevConsole } from './components/AdminDevConsole';
import { WeighInModal } from './components/WeighInModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { BaleDetailModal } from './components/BaleDetailModal';
import { TobaccoLeafScannerModal } from './components/TobaccoLeafScannerModal';
import { ConsignmentManifestModal } from './components/ConsignmentManifestModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { soundFx } from './utils/audioFeedback';

export default function App() {
  // Staff authentication state
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem('agrify_current_staff') || localStorage.getItem('baletrack_current_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.toLowerCase() === 'tinotenda gwizangwe') {
          parsed.role = 'Administrator';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved staff session:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [bales, setBales] = useState<Bale[]>([]);
  const [sensors, setSensors] = useState<WeightSensorScale[]>([]);
  const [telemetry, setTelemetry] = useState<ScaleTelemetryPoint[]>([]);
  const [cloudLogs, setCloudLogs] = useState<CloudSyncLog[]>([]);

  // Modals state
  const [isWeighInOpen, setIsWeighInOpen] = useState(false);
  const [weighInZone, setWeighInZone] = useState<StorageZone | undefined>(undefined);
  const [isLeafScannerOpen, setIsLeafScannerOpen] = useState(false);
  const [scannedPrefill, setScannedPrefill] = useState<{ grade: QualityGrade; material: MaterialType; moisture: number } | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedBale, setSelectedBale] = useState<Bale | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => soundFx.getMuted());

  const handleToggleAudio = () => {
    const next = soundFx.toggleMuted();
    setIsAudioMuted(next);
  };

  // Keyboard hotkeys for fast warehouse operation
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when operator is typing into an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'w') {
        e.preventDefault();
        setIsWeighInOpen(true);
      } else if (key === 's') {
        e.preventDefault();
        setIsLeafScannerOpen(true);
      } else if (key === 'p') {
        e.preventDefault();
        setIsManifestOpen(true);
      } else if (key === 'd') {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (key === 'b') {
        e.preventDefault();
        setActiveTab('bales');
      } else if (key === 'l') {
        e.preventDefault();
        setActiveTab('sensors');
      } else if (key === 'a') {
        e.preventDefault();
        setActiveTab('analytics');
      } else if (key === 'm') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // Fetch all system data from Express API
  const fetchAllData = async () => {
    try {
      const [resStats, resBales, resSensors, resTelem, resLogs] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/bales').then(r => r.json()),
        fetch('/api/sensors').then(r => r.json()),
        fetch('/api/telemetry').then(r => r.json()),
        fetch('/api/sync-logs').then(r => r.json()),
      ]);

      setStats(resStats);
      setBales(resBales);
      setSensors(resSensors);
      setTelemetry(resTelem);
      setCloudLogs(resLogs);
    } catch (err) {
      console.error('Error fetching data from server:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    fetchAllData();

    // Setup periodic polling to simulate live IoT cloud telemetry streaming
    const interval = setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle staff login
  const handleLoginSuccess = (user: StaffUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('agrify_current_staff', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist staff session:', e);
    }
  };

  // Handle staff logout
  const handleLogout = () => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
    try {
      localStorage.removeItem('agrify_current_staff');
      localStorage.removeItem('baletrack_current_staff');
    } catch (e) {
      console.error('Failed to clear staff session:', e);
    }
  };

  // Submit new Weigh-In / Scale Drop
  const handleSubmitWeighIn = async (req: WeighInRequest) => {
    try {
      const res = await fetch('/api/bales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (res.ok) {
        await fetchAllData();
      } else {
        console.error('Failed to submit weigh-in');
      }
    } catch (err) {
      console.error('Error submitting weigh in:', err);
    }
  };

  // Update Bale
  const handleUpdateBale = async (updated: Partial<Bale>) => {
    if (!selectedBale) return;
    try {
      const res = await fetch(`/api/bales/${selectedBale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const saved = await res.json();
        setSelectedBale(saved);
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error updating bale:', err);
    }
  };

  // Dispatch Bale
  const handleDispatchBale = async (id: string) => {
    try {
      const res = await fetch(`/api/bales/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (selectedBale?.id === id) {
          setSelectedBale(null);
        }
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error dispatching bale:', err);
    }
  };

  // Calibrate Sensor
  const handleCalibrateSensor = async (id: string) => {
    try {
      await fetch(`/api/sensors/${id}/calibrate`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Error calibrating sensor:', err);
    }
  };

  // Toggle Sensor
  const handleToggleSensor = async (id: string) => {
    try {
      await fetch(`/api/sensors/${id}/toggle`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Error toggling sensor:', err);
    }
  };

  // Trigger Manual Cloud Sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/cloud-sync', { method: 'POST' });
      await fetchAllData();
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // Fetch AI Analysis from Gemini Server API
  const handleFetchAiAnalysis = async () => {
    const res = await fetch('/api/ai/analyze', { method: 'POST' });
    if (!res.ok) throw new Error('AI Server analysis error');
    return await res.json();
  };

  // If staff is not logged in, display the Staff Login Page
  if (!currentUser) {
    return <StaffLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Off-canvas Left Side Bar containing all features and actions */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        bales={bales}
        sensors={sensors}
        onOpenWeighIn={(zone) => {
          setWeighInZone(zone);
          setIsWeighInOpen(true);
        }}
        onOpenLeafScanner={() => setIsLeafScannerOpen(true)}
        onOpenAiAnalysis={() => setIsAiOpen(true)}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenManifest={() => setIsManifestOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Clean Minimalist Top Navigation without clutter */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dedicated Dashboard Overview Tab */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            bales={bales}
            sensors={sensors}
            telemetry={telemetry}
            onSelectBale={(bale) => setSelectedBale(bale)}
            onOpenWeighIn={(zone) => {
              setWeighInZone(zone);
              setIsWeighInOpen(true);
            }}
            onOpenLeafScanner={() => setIsLeafScannerOpen(true)}
            onOpenAiAnalysis={() => setIsAiOpen(true)}
            onNavigateTab={setActiveTab}
            onCalibrateSensor={handleCalibrateSensor}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onOpenManifest={() => setIsManifestOpen(true)}
          />
        )}

        {/* Tobacco Bales Ledger Tab */}
        {activeTab === 'bales' && (
          <BaleTable
            bales={bales}
            onSelectBale={(bale) => setSelectedBale(bale)}
            onDispatchBale={handleDispatchBale}
            onOpenWeighIn={() => {
              setWeighInZone(undefined);
              setIsWeighInOpen(true);
            }}
            onOpenManifest={() => setIsManifestOpen(true)}
          />
        )}

        {/* Weight Sensors & Scales Tab */}
        {activeTab === 'sensors' && (
          <SensorsPanel
            sensors={sensors}
            telemetry={telemetry}
            onCalibrateSensor={handleCalibrateSensor}
            onToggleSensor={handleToggleSensor}
          />
        )}

        {/* Analytics & Cloud Sync Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            bales={bales}
            cloudLogs={cloudLogs}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}

        {/* Administrator & Developer Console (Restricted to Tinotenda Gwizangwe) */}
        {activeTab === 'admin' && (
          <AdminDevConsole
            currentUser={currentUser}
            stats={stats}
            bales={bales}
            sensors={sensors}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}

      </main>

      {/* Modals */}
      <WeighInModal
        isOpen={isWeighInOpen}
        onClose={() => {
          setIsWeighInOpen(false);
          setScannedPrefill(null);
        }}
        scales={sensors}
        initialZone={weighInZone}
        prefillGrade={scannedPrefill?.grade}
        prefillMaterial={scannedPrefill?.material}
        prefillMoisture={scannedPrefill?.moisture}
        onOpenLeafScanner={() => setIsLeafScannerOpen(true)}
        onSubmitWeighIn={handleSubmitWeighIn}
      />

      <TobaccoLeafScannerModal
        isOpen={isLeafScannerOpen}
        onClose={() => setIsLeafScannerOpen(false)}
        onApplyGradeToWeighIn={(grade, material, moisture) => {
          setScannedPrefill({ grade, material, moisture });
          setIsWeighInOpen(true);
        }}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onFetchAnalysis={handleFetchAiAnalysis}
      />

      <BaleDetailModal
        bale={selectedBale}
        onClose={() => setSelectedBale(null)}
        onUpdateBale={handleUpdateBale}
        onDispatchBale={handleDispatchBale}
      />

      {/* Official Consignment Clearance Manifest Modal */}
      <ConsignmentManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        bales={bales}
      />

      {/* Warehouse Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

    </div>
  );
}
