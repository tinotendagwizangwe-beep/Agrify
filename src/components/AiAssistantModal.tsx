import React, { useState } from 'react';
import { BrainCircuit, AlertTriangle, ShieldCheck, RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchAnalysis: () => Promise<{ summary: string; alerts: string[]; recommendations: string[] }>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onFetchAnalysis
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ summary: string; alerts: string[]; recommendations: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onFetchAnalysis();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to reach AI analysis engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 shadow-2xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900">Tobacco Leaf Telemetry & Hazard AI Engine</h3>
                <span className="flex items-center space-x-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Gemini 2.5</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Moisture anomaly detection, fermentation risk, & ALT hessian wrap safety</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          
          {!data && !loading && !error && (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 shadow-2xs">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Run Tobacco Telemetry & Leaf Risk Audit</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Gemini will inspect active weighbridge telemetry, ALT Hessian moisture sensor signals, and wrap tension ratings across all tobacco storage bays.
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all active:scale-95"
              >
                Start Tobacco Risk Analysis
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-medium text-slate-700">Auditing scale weight variance & ALT Hessian moisture streams...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <p className="font-semibold">AI Analysis Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-semibold text-xs text-slate-900 mb-1 flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Executive Technical Summary</span>
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs mt-1">
                  {data.summary}
                </p>
              </div>

              {/* Safety & Hazard Alerts */}
              {data.alerts && data.alerts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-semibold text-xs text-amber-900 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Identified Anomaly & Leaf Moisture Hazards</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {data.alerts.map((alt, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-amber-900">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-semibold text-xs text-emerald-900 mb-2 flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Actionable Warehouse & Auction Steps</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-run button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>Re-run Telemetry Audit</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
