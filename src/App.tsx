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
import { 
  INITIAL_WEIGHT_SENSORS, 
  INITIAL_BALES, 
  INITIAL_CLOUD_LOGS, 
  GENERATE_INITIAL_TELEMETRY 
} from './data/mockData';
import { INITIAL_STAFF_MEMBERS } from './data/staffMembers';

const computeStatsFromBales = (bList: Bale[], sList: WeightSensorScale[]): SystemStats => {
  const totalCount = bList.length;
  const totalNetTonnage = bList.reduce((acc, b) => acc + (b.netWeightKg / 1000), 0);
  const avgMoisture = totalCount > 0 
    ? bList.reduce((acc, b) => acc + b.moistureContentPct, 0) / totalCount 
    : 0;
  const activeSensors = sList.filter(s => s.status === 'Active' || s.status === 'Measuring').length;
  const quarantined = bList.filter(b => b.status === 'Quarantined (High Moisture)').length;
  const alerts = quarantined + bList.filter(b => b.altTag.wrapIntegrity !== 'Intact').length;

  return {
    totalBalesCount: totalCount,
    totalNetTonnageMetric: Math.round(totalNetTonnage * 1000) / 1000,
    avgMoisturePct: Math.round(avgMoisture * 10) / 10,
    activeSensorsCount: activeSensors,
    quarantinedCount: quarantined,
    lastCloudSyncAt: new Date().toISOString(),
    cloudSyncStatus: 'Connected',
    activeAlertsCount: alerts,
  };
};

const safeFetchJson = async <T,>(url: string, options?: RequestInit): Promise<T | null> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

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

  const [bales, setBales] = useState<Bale[]>(() => INITIAL_BALES);
  const [sensors, setSensors] = useState<WeightSensorScale[]>(() => INITIAL_WEIGHT_SENSORS);
  const [stats, setStats] = useState<SystemStats | null>(() => computeStatsFromBales(INITIAL_BALES, INITIAL_WEIGHT_SENSORS));
  const [telemetry, setTelemetry] = useState<ScaleTelemetryPoint[]>(() => GENERATE_INITIAL_TELEMETRY());
  const [cloudLogs, setCloudLogs] = useState<CloudSyncLog[]>(() => INITIAL_CLOUD_LOGS);
  const [staffList, setStaffList] = useState<StaffUser[]>(() => INITIAL_STAFF_MEMBERS);

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

  // Fetch all system data from API or keep offline state
  const fetchAllData = async () => {
    try {
      const [resStats, resBales, resSensors, resTelem, resLogs, resUsers] = await Promise.all([
        safeFetchJson<SystemStats>('/api/stats'),
        safeFetchJson<Bale[]>('/api/bales'),
        safeFetchJson<WeightSensorScale[]>('/api/sensors'),
        safeFetchJson<ScaleTelemetryPoint[]>('/api/telemetry'),
        safeFetchJson<CloudSyncLog[]>('/api/sync-logs'),
        safeFetchJson<StaffUser[]>('/api/users'),
      ]);

      if (resBales && Array.isArray(resBales)) {
        setBales(resBales);
      }
      if (resSensors && Array.isArray(resSensors)) {
        setSensors(resSensors);
      }
      if (resStats && typeof resStats === 'object') {
        setStats(resStats);
      } else {
        setStats(prev => prev || computeStatsFromBales(resBales || bales, resSensors || sensors));
      }
      if (resTelem && Array.isArray(resTelem)) {
        setTelemetry(resTelem);
      }
      if (resLogs && Array.isArray(resLogs)) {
        setCloudLogs(resLogs);
      }
      if (resUsers && Array.isArray(resUsers)) {
        setStaffList(resUsers);
      }
    } catch (err) {
      console.warn('Backend server unreachable, maintaining local offline database:', err);
    }
  };

  // Add new staff user (Admin only)
  const handleAddStaffUser = async (user: Partial<StaffUser>) => {
    try {
      const serverResult = await safeFetchJson<StaffUser>('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (serverResult) {
        await fetchAllData();
        return { success: true };
      } else {
        // Fallback for static hosts (e.g. Netlify)
        const newStaff: StaffUser = {
          id: `user-${Date.now().toString(36)}`,
          staffId: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
          name: (user.name || '').trim(),
          role: user.role || 'Weighbridge Operator',
          email: (user.email || '').trim(),
          assignedStation: user.assignedStation || 'Weighbridge Scale #1 (Intake Bay A)',
          shift: user.shift || 'Shift A (06:00 - 14:00)',
          badgeNumber: `BDG-${Math.floor(1000 + Math.random() * 9000)}`,
          lastLogin: new Date().toISOString(),
        };
        setStaffList(prev => [...prev, newStaff]);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Error adding user:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Remove staff user (Admin only)
  const handleRemoveStaffUser = async (userId: string) => {
    try {
      const serverResult = await safeFetchJson<{ message: string }>(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (serverResult) {
        await fetchAllData();
        return { success: true };
      } else {
        // Fallback for static hosts (e.g. Netlify)
        setStaffList(prev => prev.filter(u => u.id !== userId && u.staffId !== userId));
        return { success: true };
      }
    } catch (err: any) {
      console.error('Error removing user:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Initial fetch for login page demo profiles
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setStaffList(data);
      })
      .catch(() => {});
  }, []);

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
      const serverResult = await safeFetchJson<Bale>('/api/bales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (serverResult) {
        await fetchAllData();
      } else {
        // Fallback for static Netlify deploy
        const tareKg = req.tareWeightKg ?? 2.8;
        const netKg = Math.round((req.grossWeightKg - tareKg) * 10) / 10;
        const targetKg = 100.0;
        const variancePct = Math.round(((netKg - targetKg) / targetKg) * 10000) / 100;
        const newBale: Bale = {
          id: `TOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          altTag: {
            tagId: (req.tagId || `ALT-TB-${Math.floor(10000 + Math.random() * 89999)}`).toUpperCase(),
            rfidFrequency: '865.6 MHz UHF',
            weaveDensityGSM: req.weaveDensityGSM || 320,
            wrapIntegrity: req.wrapIntegrity || 'Intact',
            humiditySensorPct: req.moistureContentPct,
            batchNumber: `BAT-${new Date().getFullYear()}-ALT-${Math.floor(100 + Math.random() * 900)}`,
            manufacturer: 'AgriLeaf Packaging',
            lastScannedAt: new Date().toISOString(),
          },
          material: req.material,
          grade: req.grade,
          grossWeightKg: Math.round(req.grossWeightKg * 10) / 10,
          tareWeightKg: Math.round(tareKg * 10) / 10,
          netWeightKg: netKg,
          targetWeightKg: targetKg,
          weightVariancePct: variancePct,
          moistureContentPct: Math.round(req.moistureContentPct * 10) / 10,
          temperatureCelsius: req.temperatureCelsius || 22.0,
          storageZone: req.storageZone,
          bayLocation: req.bayLocation || 'A-01-S1',
          weighedAtScaleId: req.scaleId || 'SC-01-INTAKE',
          status: req.moistureContentPct >= 15.5 ? 'Quarantined (High Moisture)' : 'In Stock',
          notes: req.operatorNotes || 'Recorded at weighbridge terminal.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setBales(prev => {
          const next = [newBale, ...prev];
          setStats(computeStatsFromBales(next, sensors));
          return next;
        });

        const newLog: CloudSyncLog = {
          id: `LOG-${Math.floor(8000 + Math.random() * 1999)}`,
          timestamp: new Date().toISOString(),
          event: 'WEIGH_IN',
          baleId: newBale.id,
          payloadSizeKb: 1.2,
          syncLatencyMs: 16,
          status: 'SUCCESS',
          cloudNode: 'offline-local-cache',
          details: `Weigh-in recorded for ${newBale.id} (${newBale.netWeightKg} kg net).`,
        };
        setCloudLogs(prev => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting weigh in:', err);
    }
  };

  // Update Bale
  const handleUpdateBale = async (updated: Partial<Bale>) => {
    if (!selectedBale) return;
    try {
      const serverResult = await safeFetchJson<Bale>(`/api/bales/${selectedBale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (serverResult) {
        setSelectedBale(serverResult);
        await fetchAllData();
      } else {
        const merged = { ...selectedBale, ...updated, updatedAt: new Date().toISOString() };
        setSelectedBale(merged);
        setBales(prev => {
          const next = prev.map(b => b.id === merged.id ? merged : b);
          setStats(computeStatsFromBales(next, sensors));
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating bale:', err);
    }
  };

  // Dispatch Bale
  const handleDispatchBale = async (id: string) => {
    try {
      const serverResult = await safeFetchJson(`/api/bales/${id}`, {
        method: 'DELETE',
      });

      if (serverResult) {
        if (selectedBale?.id === id) {
          setSelectedBale(null);
        }
        await fetchAllData();
      } else {
        if (selectedBale?.id === id) {
          setSelectedBale(null);
        }
        setBales(prev => {
          const next = prev.filter(b => b.id !== id);
          setStats(computeStatsFromBales(next, sensors));
          return next;
        });
      }
    } catch (err) {
      console.error('Error dispatching bale:', err);
    }
  };

  // Calibrate Sensor
  const handleCalibrateSensor = async (id: string) => {
    try {
      const serverResult = await safeFetchJson(`/api/sensors/${id}/calibrate`, { method: 'POST' });
      if (serverResult) {
        await fetchAllData();
      } else {
        setSensors(prev => prev.map(s => s.id === id ? { ...s, lastCalibrated: new Date().toISOString(), tareZeroOffsetKg: 0 } : s));
      }
    } catch (err) {
      console.error('Error calibrating sensor:', err);
    }
  };

  // Toggle Sensor
  const handleToggleSensor = async (id: string) => {
    try {
      const serverResult = await safeFetchJson(`/api/sensors/${id}/toggle`, { method: 'POST' });
      if (serverResult) {
        await fetchAllData();
      } else {
        setSensors(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Standby' : 'Active' } : s));
      }
    } catch (err) {
      console.error('Error toggling sensor:', err);
    }
  };

  // Trigger Manual Cloud Sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const serverResult = await safeFetchJson('/api/cloud-sync', { method: 'POST' });
      if (serverResult) {
        await fetchAllData();
      } else {
        setStats(prev => prev ? { ...prev, lastCloudSyncAt: new Date().toISOString() } : null);
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // Fetch Telemetry Diagnostics Analysis
  const handleFetchAiAnalysis = async () => {
    const res = await fetch('/api/ai/analyze', { method: 'POST' });
    if (!res.ok) throw new Error('Diagnostic audit service error');
    return await res.json();
  };

  // If staff is not logged in, display the Staff Login Page
  if (!currentUser) {
    return (
      <StaffLoginPage 
        onLoginSuccess={handleLoginSuccess} 
        staffList={staffList.length > 0 ? staffList : undefined}
      />
    );
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
            staffList={staffList}
            onAddUser={handleAddStaffUser}
            onRemoveUser={handleRemoveStaffUser}
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
