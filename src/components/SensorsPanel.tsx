import React, { useState } from 'react';
import { WeightSensorScale, ScaleTelemetryPoint } from '../types';
import { Cpu, RefreshCw, Power, Activity, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SensorsPanelProps {
  sensors: WeightSensorScale[];
  telemetry: ScaleTelemetryPoint[];
  onCalibrateSensor: (id: string) => Promise<void>;
  onToggleSensor: (id: string) => Promise<void>;
}

export const SensorsPanel: React.FC<SensorsPanelProps> = ({
  sensors,
  telemetry,
  onCalibrateSensor,
  onToggleSensor
}) => {
  const [calibratingId, setCalibratingId] = useState<string | null>(null);

  const handleCalibrate = async (id: string) => {
    setCalibratingId(id);
    try {
      await onCalibrateSensor(id);
    } finally {
      setTimeout(() => setCalibratingId(null), 1000);
    }
  };

  const chartData = telemetry.map((pt) => ({
    time: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    weightKg: pt.weightKg,
    tag: pt.altTagDetected || 'N/A',
  }));

  return (
    <div className="space-y-6 my-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Tobacco Scale & Digital Load Cell Telemetry</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calibrated auction floor weighbridges, pack scale load cells, and AgriLeaf Tobacco (ALT) RFID readers.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Sampling Rate: <strong className="text-slate-900">20 Hz</strong></span>
            <span className="text-slate-300">|</span>
            <span>Tare Precision: <strong className="text-slate-900">+/- 0.05 kg</strong></span>
          </div>
        </div>

        {/* Live Telemetry Streaming Chart */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Load Cell Stream (kg)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Live Stream
            </span>
          </div>

          <div className="h-60 w-full bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`${val} kg`, 'Load Cell Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#059669' }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of Active Weight Sensors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensors.map((sensor) => {
          const isOffline = sensor.status === 'Offline';
          const isCalibrating = calibratingId === sensor.id || sensor.status === 'Calibrating';

          return (
            <div
              key={sensor.id}
              className={`p-5 rounded-xl border transition-all bg-white shadow-xs ${
                isOffline 
                  ? 'border-slate-200 opacity-60' 
                  : isCalibrating 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Sensor Info */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {sensor.id}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">{sensor.name}</h3>
                  <p className="text-xs text-slate-500">{sensor.location}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                    isOffline
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : isCalibrating
                      ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
              </div>

              {/* Sensor Spec & Metrics */}
              <div className="grid grid-cols-2 gap-2.5 my-3.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Max Scale Capacity</span>
                  <span className="font-bold text-slate-900 text-xs">{sensor.maxCapacityKg} kg</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Current Live Reading</span>
                  <span className="font-bold text-emerald-700 text-xs">{sensor.currentReadingKg} kg</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Tare Offset Margin</span>
                  <span className="font-mono text-slate-800 text-xs">+/- {sensor.accuracyMarginKg} kg</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Last Calibrated</span>
                  <span className="text-slate-600 text-[11px]">
                    {new Date(sensor.lastCalibrated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleCalibrate(sensor.id)}
                  disabled={isCalibrating || isOffline}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isCalibrating ? 'Calibrating...' : 'Re-Zero Scale'}</span>
                </button>

                <button
                  onClick={() => onToggleSensor(sensor.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isOffline 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOffline ? 'Activate Scale' : 'Set Offline'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
