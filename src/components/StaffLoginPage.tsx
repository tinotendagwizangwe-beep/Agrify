import React, { useState } from 'react';
import { StaffUser } from '../types';
import { INITIAL_STAFF_MEMBERS } from '../data/staffMembers';
import { 
  Leaf, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface StaffLoginPageProps {
  onLoginSuccess: (user: StaffUser) => void;
  staffList?: StaffUser[];
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({ onLoginSuccess, staffList }) => {
  const activeStaff = staffList && staffList.length > 0 ? staffList : INITIAL_STAFF_MEMBERS;
  
  // Login Form State
  const [username, setUsername] = useState('tinotenda');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username or email address.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    if (cleanPass.length < 4) {
      setError('Password must be at least 4 characters (default: 1234).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching staff member by username, staffId, email, or full name
      const matched = activeStaff.find((s) => {
        const staffIdMatch = s.staffId.toLowerCase() === cleanUser;
        const emailMatch = s.email.toLowerCase() === cleanUser;
        const nameMatch = s.name.toLowerCase() === cleanUser;
        const emailPrefix = s.email.split('@')[0].toLowerCase();
        const firstName = s.name.split(' ')[0].toLowerCase();
        const cleanName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Also allow 'admin' to log in as root administrator
        const isAdminAlias = cleanUser === 'admin' && (s.role === 'Administrator' || s.staffId === 'STF-4091');

        return staffIdMatch || emailMatch || nameMatch || emailPrefix === cleanUser || firstName === cleanUser || cleanName === cleanUser || isAdminAlias;
      });

      if (!matched) {
        setError('Invalid username or password. Please check your credentials or select a profile below.');
        setIsLoading(false);
        return;
      }

      // Successful login
      const updatedUser: StaffUser = {
        ...matched,
        lastLogin: new Date().toISOString(),
      };

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  const handleSelectQuickProfile = (staff: StaffUser) => {
    // Fill in a friendly username (e.g. first name or staff ID)
    const friendlyUsername = staff.name.split(' ')[0].toLowerCase();
    setUsername(friendlyUsername);
    setPassword('1234');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/20 mb-3 border border-emerald-400/30">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AgriLeaf Tobacco
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hessian Packaging & IoT Load Sensor Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your login credentials to access the facility dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username Input Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Default: 1234</span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 select-none">Remember this device</span>
              </label>

              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <KeyRound className="w-3 h-3 text-slate-400" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {/* Blue Log In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Quick Select Profile Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick One-Click Sign In
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeStaff.slice(0, 4).map((staff) => {
                const isSelected = username.toLowerCase() === staff.name.split(' ')[0].toLowerCase() || username.toLowerCase() === staff.staffId.toLowerCase();
                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleSelectQuickProfile(staff)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 shadow-2xs font-medium'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold truncate">{staff.name}</span>
                      {staff.role === 'Administrator' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white shrink-0 ml-1">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{staff.role}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">user: {staff.name.split(' ')[0].toLowerCase()}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Security & System Info Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Industrial IoT Weighbridge & Leaf Grading Access</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Authorized personnel only · Harare Central Tobacco Facility
          </p>
        </div>

      </div>

    </div>
  );
};
