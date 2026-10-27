import React, { useState, useRef, useEffect } from 'react';
import { 
  TobaccoGradeScanResult, 
  MaterialType, 
  QualityGrade 
} from '../types';
import { soundFx } from '../utils/audioFeedback';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  Droplets, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';

interface TobaccoLeafScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGradeToWeighIn?: (grade: QualityGrade, material: MaterialType, moisture: number) => void;
}

// Visual preset leaf items
interface LeafPreset {
  id: string;
  name: string;
  subtitle: string;
  variety: MaterialType;
  expectedGrade: string;
  colorSwatch: string;
  accentBg: string;
  thumbnailSvg: React.ReactNode;
}

const LEAF_PRESETS: LeafPreset[] = [
  {
    id: 'preset-virginia-lemon',
    name: 'Prime Golden Virginia',
    subtitle: 'Bright Flue-Cured Lemon Leaf',
    variety: 'Flue-Cured Virginia',
    expectedGrade: 'Grade A1 (Choice Lemon)',
    colorSwatch: '#EAB308',
    accentBg: 'bg-amber-50 border-amber-200',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 10 C30 30, 20 60, 50 90 C80 60, 70 30, 50 10 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
        <path d="M50 15 L50 88" stroke="#CA8A04" strokeWidth="2" strokeDasharray="3 2" />
        <path d="M50 35 Q35 45, 30 52" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
        <path d="M50 45 Q65 55, 70 62" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
        <path d="M50 58 Q35 68, 32 74" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
      </svg>
    )
  },
  {
    id: 'preset-virginia-orange',
    name: 'Amber Cured Virginia',
    subtitle: 'Upper Stalk Deep Orange Cutter',
    variety: 'Flue-Cured Virginia',
    expectedGrade: 'Grade B1 (Fine Orange)',
    colorSwatch: '#D97706',
    accentBg: 'bg-orange-50 border-orange-200',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 12 C28 32, 22 62, 50 88 C78 62, 72 32, 50 12 Z" fill="#D97706" stroke="#B45309" strokeWidth="2" />
        <path d="M50 16 L50 86" stroke="#9A3412" strokeWidth="2" />
        <path d="M50 38 Q32 48, 28 56" stroke="#9A3412" strokeWidth="1.5" fill="none" />
        <path d="M50 50 Q68 60, 72 68" stroke="#9A3412" strokeWidth="1.5" fill="none" />
      </svg>
    )
  },
  {
    id: 'preset-burley-cutter',
    name: 'Standard Burley Cutter',
    subtitle: 'Air-Cured Walnut Brown Leaf',
    variety: 'Burley Leaf',
    expectedGrade: 'Grade C2 (Standard Cutter)',
    colorSwatch: '#92400E',
    accentBg: 'bg-stone-50 border-stone-200',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 15 C25 35, 18 65, 50 88 C82 65, 75 35, 50 15 Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
        <path d="M50 18 L50 86" stroke="#78350F" strokeWidth="2.5" />
        <path d="M50 36 Q30 46, 26 54" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M50 48 Q70 58, 74 66" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <circle cx="42" cy="52" r="3" fill="#78350F" opacity="0.6" />
        <circle cx="62" cy="64" r="2.5" fill="#78350F" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 'preset-fire-cured',
    name: 'Dark Fire-Cured Class 1',
    subtitle: 'Smoky Dark Mahogany Wrapper',
    variety: 'Dark Fire-Cured',
    expectedGrade: 'Export Premium',
    colorSwatch: '#451A03',
    accentBg: 'bg-amber-950/10 border-amber-900/30',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 10 C22 30, 16 65, 50 92 C84 65, 78 30, 50 10 Z" fill="#451A03" stroke="#290E02" strokeWidth="2" />
        <path d="M50 14 L50 90" stroke="#78350F" strokeWidth="2" />
        <path d="M50 32 Q28 42, 24 50" stroke="#78350F" strokeWidth="1.5" fill="none" />
        <path d="M50 46 Q72 56, 76 64" stroke="#78350F" strokeWidth="1.5" fill="none" />
      </svg>
    )
  },
  {
    id: 'preset-clean-lugs',
    name: 'Clean Sand Lugs',
    subtitle: 'Lower Stalk Pale Tan Priming',
    variety: 'Lugs & Primings',
    expectedGrade: 'Grade X (Clean Lugs)',
    colorSwatch: '#CA8A04',
    accentBg: 'bg-yellow-50/80 border-yellow-200',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 18 C32 36, 26 62, 50 84 C74 62, 68 36, 50 18 Z" fill="#CA8A04" stroke="#A16207" strokeWidth="2" />
        <path d="M50 20 L50 82" stroke="#A16207" strokeWidth="1.5" />
        <path d="M50 40 Q34 48, 30 55" stroke="#A16207" strokeWidth="1.2" fill="none" />
        <path d="M50 52 Q66 60, 70 66" stroke="#A16207" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'preset-high-moisture-risk',
    name: 'Uncured Wet Burley Leaf',
    subtitle: 'High Moisture Hazard Alert (17.8%)',
    variety: 'Burley Leaf',
    expectedGrade: 'Grade C2 (Standard Cutter) [Quarantine]',
    colorSwatch: '#65A30D',
    accentBg: 'bg-lime-50 border-lime-300',
    thumbnailSvg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 12 C26 30, 18 64, 50 90 C82 64, 74 30, 50 12 Z" fill="#65A30D" stroke="#4D7C0F" strokeWidth="2" />
        <path d="M50 15 L50 88" stroke="#365314" strokeWidth="2.5" />
        <path d="M50 34 Q28 44, 24 52" stroke="#365314" strokeWidth="2" fill="none" />
        <path d="M50 46 Q72 56, 76 64" stroke="#365314" strokeWidth="2" fill="none" />
        <circle cx="36" cy="46" r="3.5" fill="#4D7C0F" />
        <circle cx="64" cy="58" r="4" fill="#4D7C0F" />
        <circle cx="48" cy="70" r="3" fill="#4D7C0F" />
      </svg>
    )
  }
];

export const TobaccoLeafScannerModal: React.FC<TobaccoLeafScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyGradeToWeighIn
}) => {
  if (!isOpen) return null;

  const [activeInputMode, setActiveInputMode] = useState<'camera' | 'upload' | 'preset'>('preset');
  
  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Captured or selected image
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<LeafPreset>(LEAF_PRESETS[0]);
  
  // Grading & analysis state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<TobaccoGradeScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Stop camera when modal closes or unmounts
  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    setCapturedImageData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access not available or permission denied. Please use the Sample Presets or File Upload.');
      setCameraActive(false);
    }
  };

  // Switch modes safely
  const handleSelectMode = (mode: 'camera' | 'upload' | 'preset') => {
    setActiveInputMode(mode);
    setScanResult(null);
    setScanError(null);
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCameraStream();
    }
  };

  // Capture snapshot from video stream
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImageData(dataUrl);
    stopCameraStream();

    // Auto trigger scanning
    triggerGradeAnalysis(dataUrl, undefined);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setCapturedImageData(resultStr);
      triggerGradeAnalysis(resultStr, undefined);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI Grading API call to server.ts
  const triggerGradeAnalysis = async (imageBase64?: string, presetId?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/ai/scan-leaf-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64,
          samplePresetId: presetId || (!imageBase64 ? selectedPreset.id : undefined),
          mimeType: imageBase64?.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
        })
      });

      if (!res.ok) {
        throw new Error('Tobacco leaf grading service returned an error status.');
      }

      const result: TobaccoGradeScanResult = await res.json();
      setScanResult(result);
      if (result.estimatedMoisturePct >= 15.5) {
        soundFx.playHazardWarning();
      } else {
        soundFx.playScanComplete();
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Unable to complete AI tobacco leaf grading analysis.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyToWeighIn = () => {
    if (!scanResult) return;
    if (onApplyGradeToWeighIn) {
      onApplyGradeToWeighIn(
        scanResult.grade,
        scanResult.materialVariety,
        scanResult.estimatedMoisturePct
      );
    }
    stopCameraStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Tobacco Leaf Grade Scanner
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  AgriLeaf AI Vision
                </span>
              </div>
              <p className="text-xs text-slate-300">
                AgriLeaf Tobacco (ALT) Automated Leaf Colorimetry & Quality Grading
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleSelectMode('preset')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeInputMode === 'preset'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sample Leaf Presets</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectMode('camera')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeInputMode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Camera Scan</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectMode('upload')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeInputMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>Upload Leaf Image</span>
              </div>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Gemini 3.8 Flash Vision</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">

          {/* Active Mode View: Presets */}
          {activeInputMode === 'preset' && !scanResult && !isScanning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Select a Cured Tobacco Leaf Specimen to Scan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choose from standard AgriLeaf Tobacco reference cured leaf lots to immediately test classification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LEAF_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                        isSelected 
                          ? `${preset.accentBg} ring-2 ring-emerald-500 shadow-xs` 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="w-full h-24 rounded-lg bg-white/80 p-2 flex items-center justify-center border border-slate-200/60 mb-2">
                        {preset.thumbnailSvg}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {preset.name}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-black/10 ml-1"
                            style={{ backgroundColor: preset.colorSwatch }}
                            title={`Color: ${preset.colorSwatch}`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {preset.subtitle}
                        </p>
                        <div className="pt-1 text-[10px] font-semibold text-emerald-700">
                          {preset.expectedGrade}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => triggerGradeAnalysis(undefined, selectedPreset.id)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Scan {selectedPreset.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            </div>
          )}

          {/* Active Mode View: Live Camera */}
          {activeInputMode === 'camera' && !scanResult && !isScanning && (
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-black overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle / Viewfinder Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-72 border-2 border-dashed border-emerald-400/80 rounded-3xl flex flex-col items-center justify-between p-3 bg-emerald-500/5">
                    <span className="text-[10px] font-mono uppercase bg-slate-900/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Align Tobacco Leaf
                    </span>
                    <div className="text-[9px] text-white/70 font-mono text-center">
                      Fill frame · Ensure good light
                    </div>
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                    <button
                      onClick={() => handleSelectMode('preset')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
                    >
                      Switch to Sample Presets
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden canvas for snapshot rendering */}
              <canvas ref={canvasRef} className="hidden" />

              {cameraActive && (
                <div className="flex items-center justify-center space-x-3 pt-1">
                  <button
                    onClick={handleCaptureSnapshot}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Analyze Leaf</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Mode View: File Upload */}
          {activeInputMode === 'upload' && !scanResult && !isScanning && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-2xs mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Click or drag photo of tobacco leaf here
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Supports JPG, PNG, WEBP high-resolution cured leaf photos (max 10MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {capturedImageData && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                  <img
                    src={capturedImageData}
                    alt="Uploaded leaf preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-xs">Image Loaded</p>
                    <p className="text-[10px] text-slate-500">Ready for automated AI leaf grade classification</p>
                  </div>
                  <button
                    onClick={() => triggerGradeAnalysis(capturedImageData, undefined)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs shadow-xs"
                  >
                    Scan Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scanning Animation In Progress */}
          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs overflow-hidden">
                <RefreshCw className="w-9 h-9 text-emerald-600 animate-spin" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  AI Leaf Vision In Progress...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Evaluating carotenoid color spectrum, lamina grain elasticity, curing maturity, and AgriLeaf Tobacco (ALT) grading criteria.
                </p>
              </div>
            </div>
          )}

          {/* Scan Error Message */}
          {scanError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Grading Scan Failed</span>
              </div>
              <p className="text-[11px]">{scanError}</p>
              <button
                onClick={() => setScanError(null)}
                className="text-[11px] underline font-semibold text-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Scan Result Report */}
          {scanResult && !isScanning && (
            <div className="space-y-4">
              
              {/* Primary Grade Header Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-mono uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Grading Verdict // {scanResult.standardsCompliance}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
                    <span>{scanResult.grade}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {scanResult.materialVariety} · Stalk: {scanResult.leafStalkPosition}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Confidence Badge */}
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Confidence</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {scanResult.confidenceScore}%
                    </div>
                  </div>

                  {/* Market Value Badge */}
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Est. Price</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      ${scanResult.suggestedMarketPricingUsdPerKg.toFixed(2)}/kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Color Spectrum */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase">
                    <span>Color Spectrum</span>
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10 inline-block"
                      style={{ backgroundColor: scanResult.colorHex }}
                    />
                  </div>
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {scanResult.colorDescription}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Hex: {scanResult.colorHex}
                  </div>
                </div>

                {/* Estimated Moisture */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  scanResult.estimatedMoisturePct >= 15.5 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase">
                    <span className="text-slate-500">Moisture Content</span>
                    <Droplets className="w-3 h-3 text-blue-500" />
                  </div>
                  <div className="font-bold text-slate-900 text-xs font-mono">
                    {scanResult.estimatedMoisturePct}%
                  </div>
                  <div className="text-[10px]">
                    {scanResult.estimatedMoisturePct >= 15.5 ? (
                      <span className="text-amber-700 font-bold">Quarantine Risk (&gt;15.5%)</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Safe Baling Level</span>
                    )}
                  </div>
                </div>

                {/* Curing Maturity */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px] font-semibold uppercase">
                    Curing Maturity
                  </div>
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {scanResult.curingMaturity}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Uniform barn cure
                  </div>
                </div>

                {/* Defect Rate */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px] font-semibold uppercase">
                    Defect / Spotting
                  </div>
                  <div className="font-bold text-slate-900 text-xs font-mono">
                    {scanResult.defectRatePct}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Sand speck & tear rate
                  </div>
                </div>

              </div>

              {/* Lamina Texture & Elasticity */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lamina Grain & Elasticity</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {scanResult.textureAndElasticity}
                </p>
              </div>

              {/* Justification & Standards Note */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
                <div className="font-semibold text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Grading Inspector Justification</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  {scanResult.justification}
                </p>
              </div>

              {/* Primary Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setScanResult(null);
                    setCapturedImageData(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors font-medium text-xs flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Leaf</span>
                </button>

                {onApplyGradeToWeighIn && (
                  <button
                    onClick={handleApplyToWeighIn}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Use This Grade in Weigh-In Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">AgriLeaf Tobacco (ALT)</span>
            <span>·</span>
            <span>Auction Quality Standard ISO 9001</span>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
