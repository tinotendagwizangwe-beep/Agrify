import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'W', description: 'Scale Ingest / Ingest Weigh-In Modal', category: 'Operations' },
    { key: 'S', description: 'Launch AI Tobacco Leaf Grade Scanner', category: 'Operations' },
    { key: 'P', description: 'Open Consignment Manifest & Print Clearance', category: 'Operations' },
    { key: 'D', description: 'Switch to Dashboard Overview', category: 'Navigation' },
    { key: 'B', description: 'Switch to Tobacco Bales Ledger', category: 'Navigation' },
    { key: 'L', description: 'Switch to Load Cell Scales & Sensors', category: 'Navigation' },
    { key: 'A', description: 'Switch to Analytics & Cloud Logs', category: 'Navigation' },
    { key: 'M', description: 'Toggle Off-Canvas Menu Drawer', category: 'Navigation' },
    { key: 'Esc', description: 'Close any active modal or drawer', category: 'System' },
    { key: '?', description: 'Show this keyboard shortcuts guide', category: 'System' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Warehouse Terminal Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Rapid floor entry hotkeys for industrial terminals & handhelds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="divide-y divide-slate-100">
            {shortcuts.map((sc, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">{sc.description}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-mono text-xs font-semibold border border-slate-300 shadow-2xs min-w-[28px] text-center">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
            <strong>Operator Tip:</strong> Hotkeys work globally anywhere across the terminal when you are not typing into a form input.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
