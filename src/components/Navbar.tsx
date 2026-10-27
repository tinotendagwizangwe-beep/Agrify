import React from 'react';
import { StaffUser, isAdmin } from '../types';
import { 
  Leaf, 
  Menu, 
  LogOut, 
  User, 
  MapPin, 
  ShieldCheck,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';

interface NavbarProps {
  currentUser: StaffUser | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onToggleSidebar,
  isAudioMuted = false,
  onToggleAudio,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Sidebar Toggle Menu Button + Brand Wordmark */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Sidebar Drawer Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
              title="Open Navigation & Features Sidebar"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo & Brand */}
            <div 
              onClick={onToggleSidebar}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-slate-900 whitespace-nowrap">
                    AGRI-FY
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap hidden sm:inline-block">
                    AgriLeaf Tobacco (ALT)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block whitespace-nowrap">
                  Harare Regional Leaf Facility
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sound FX Toggle, Keyboard Help, Staff Profile & Log Out */}
          {currentUser && (
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              
              {/* Sound Feedback Toggle */}
              {onToggleAudio && (
                <button
                  onClick={onToggleAudio}
                  className={`p-2 rounded-xl border text-xs transition-colors ${
                    isAudioMuted 
                      ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600' 
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100/80'
                  }`}
                  title={isAudioMuted ? 'Scale/Scanner Sound Effects: Muted (Click to Unmute)' : 'Scale/Scanner Sound Effects: Active (Click to Mute)'}
                  aria-label="Toggle Sound Effects"
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              {/* Keyboard Shortcuts Guide */}
              {onOpenShortcuts && (
                <button
                  onClick={onOpenShortcuts}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:flex items-center"
                  title="Warehouse Keyboard Shortcuts (?)"
                  aria-label="Keyboard Shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              )}

              {/* Staff Member Info Chip */}
              <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-[11px] font-bold shadow-2xs ${
                  isAdmin(currentUser) ? 'bg-emerald-700' : 'bg-slate-900'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-900 leading-tight flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    {isAdmin(currentUser) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {currentUser.role} · {currentUser.staffId}
                  </div>
                </div>
              </div>

              {/* Log Out Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
                title="Log Out of Terminal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};
