import React, { useState } from 'react';
import { StaffUser } from '../types';
import { INITIAL_STAFF_MEMBERS } from '../data/staffMembers';
import { 
  Leaf, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Scale, 
  Cpu, 
  ArrowRight,
  AlertCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface StaffLoginPageProps {
  onLoginSuccess: (user: StaffUser) => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('STF-4091');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [station, setStation] = useState('Weighbridge Scale #1 (Intake Bay A)');
  const [shift, setShift] = useState('Shift A (06:00 - 14:00)');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Find matching staff member by staffId or email
      const matched = INITIAL_STAFF_MEMBERS.find(
        (s) => 
          s.staffId.toLowerCase() === identifier.trim().toLowerCase() ||
          s.email.toLowerCase() === identifier.trim().toLowerCase()
      );

      if (!matched) {
        setError('Staff identifier not found in the regional employee registry.');
        setIsLoading(false);
        return;
      }

      // In this system, default PIN is 1234 or any 4+ digit sequence
      if (pin.length < 4) {
        setError('Operator security PIN must be at least 4 digits.');
        setIsLoading(false);
        return;
      }

      // Successful login
      const updatedUser: StaffUser = {
        ...matched,
        assignedStation: station,
        shift: shift,
        lastLogin: new Date().toISOString(),
      };

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 450);
  };

  const handleSelectDemoProfile = (staff: StaffUser) => {
    setIdentifier(staff.staffId);
    setPin('1234');
    setStation(staff.assignedStation);
    setShift(staff.shift);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xs mb-3">
          <Leaf className="w-6 h-6 text-emerald-400" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          AGRI-FY
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tobacco ALT Hessian & IoT Load Cell Weighbridge System
        </p>
        
        <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] border border-slate-200">
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span>Harare Central Leaf Facility · Terminal Gate #4</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 shadow-xl rounded-2xl">
          
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-center">
              Operator Terminal Sign-In
            </h2>
            <p className="text-xs text-slate-500 text-center mt-0.5">
              Enter your Staff ID and security PIN to access the warehouse ledger.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Staff ID / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff ID or Internal Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. STF-4091"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-mono">
                  ID
                </span>
              </div>
            </div>

            {/* Security PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security PIN / Password
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Workstation / Weighbridge Station */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Terminal / Station
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="Executive Operations & Central Command">Executive Operations & Central Command (Root)</option>
                <option value="Weighbridge Scale #1 (Intake Bay A)">Weighbridge Scale #1 (Intake Bay A)</option>
                <option value="Floor Scale #2 (Burley Air-Cure)">Floor Scale #2 (Burley Air-Cure)</option>
                <option value="Platform Scale #3 (Fire-Cured Sector)">Platform Scale #3 (Fire-Cured Sector)</option>
                <option value="Auction Dispatch Scale #4">Auction Dispatch Scale #4</option>
                <option value="Quality & Moisture Lab Console">Quality & Moisture Lab Console</option>
                <option value="Central Warehouse Operations Hub">Central Warehouse Operations Hub</option>
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Operational Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="Full System & Developer Clearance">Full System & Developer Clearance (24/7)</option>
                <option value="Shift A (06:00 - 14:00)">Shift A (06:00 - 14:00) · Morning Ingest</option>
                <option value="Shift B (14:00 - 22:00)">Shift B (14:00 - 22:00) · Auction Floor</option>
                <option value="Shift C (22:00 - 06:00)">Shift C (22:00 - 06:00) · Conditioning Fans</option>
              </select>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
              >
                {isLoading ? (
                  <span>Verifying Operator Badge...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorize & Access Facility Console</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Quick Demo Profiles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Operator Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_STAFF_MEMBERS.slice(0, 4).map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => handleSelectDemoProfile(staff)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    identifier === staff.staffId
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-medium'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate">{staff.name}</span>
                    {staff.role === 'Administrator' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white shrink-0">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{staff.role}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{staff.staffId}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Security & System Info Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Industrial IoT Load Cell & RFID Terminal Gate</span>
          </p>
          <p className="text-[11px]">
            Default testing PIN is <code className="text-slate-600 font-mono bg-slate-200/60 px-1 py-0.5 rounded">1234</code> for all registered staff.
          </p>
        </div>

      </div>

    </div>
  );
};
