import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Image as ImageIcon,
  X,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Scan,
  Layers,
  Leaf,
} from 'lucide-react';
import { WestAfricanCrop, FieldSample } from '../types';
import { FIELD_SAMPLES } from '../data/fieldSamples';

interface ImageUploaderProps {
  onImageSelected: (
    imageData: string,
    mimeType: string,
    cropHint: WestAfricanCrop,
    location: string,
    fieldNotes: string,
    samplePreset?: FieldSample['presetDiagnosis']
  ) => void;
  isLoading: boolean;
}

const REGIONAL_CROPS: WestAfricanCrop[] = [
  'Auto-detect',
  'Cassava',
  'Cocoa',
  'Oil Palm',
  'Maize',
  'Plantain',
  'Yams',
];

const GENERAL_LOCATION_LABEL = 'Global / Auto-detect';

const GLOBAL_AGRO_ZONES = [
  GENERAL_LOCATION_LABEL,
  'Tropical Rainforest Agro-Zone',
  'Sub-Saharan Savanna Belt',
  'Humid Subtropical Basin',
  'Semi-Arid Dryland Cropping Zone',
  'Highland & Plateau Agro-Zone',
  'Coastal Agro-Ecological Basin',
  'Central Lowland Alluvial Zone',
  'Continental Grain & Tuber Belt',
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [selectedCrop, setSelectedCrop] = useState<WestAfricanCrop>('Auto-detect');
  const [selectedZone, setSelectedZone] = useState<string>(GENERAL_LOCATION_LABEL);
  const [showAdvancedContext, setShowAdvancedContext] = useState<boolean>(false);
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery' | 'samples'>('camera');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Client-side downscaling to max 1280px (light mobile payload)
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedData = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedData);
          setMimeType('image/jpeg');
        } else {
          setSelectedImage(rawData);
          setMimeType(file.type || 'image/jpeg');
        }
      };
      img.onerror = () => {
        setSelectedImage(rawData);
        setMimeType(file.type || 'image/jpeg');
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Hardware camera stream with progressive constraint relaxation
  const startLiveCamera = async () => {
    setCameraError(null);

    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera access requires HTTPS in production. You can use the device file picker.');
      cameraInputRef.current?.click();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live browser camera API unavailable on this browser. Use native device camera.');
      cameraInputRef.current?.click();
      return;
    }

    let stream: MediaStream | null = null;
    const constraintTiers = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    for (const constraints of constraintTiers) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError('Camera access was denied. Please allow permissions or pick a photo from your gallery.');
          return;
        }
      }
    }

    if (!stream) {
      setCameraError('Unable to open live hardware stream. Opening native camera trigger.');
      cameraInputRef.current?.click();
      return;
    }

    streamRef.current = stream;
    setCameraActive(true);
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.error('[Camera] Play error:', err));
      };
    }
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const triggerDiagnose = () => {
    if (!selectedImage) return;
    onImageSelected(selectedImage, mimeType, selectedCrop, selectedZone, fieldNotes);
  };

  const handleSelectSample = (sample: FieldSample) => {
    setSelectedImage(sample.thumbnailUrl);
    setMimeType('image/jpeg');
    setSelectedCrop(sample.crop);
    setSelectedZone(sample.localZone);
    onImageSelected(
      sample.thumbnailUrl,
      'image/jpeg',
      sample.crop,
      sample.localZone,
      `Field sample: ${sample.title} (${sample.category})`,
      sample.presetDiagnosis
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Hidden native input elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {/* Mode Segmented Controls (Eco-Glass Pills) */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-1.5 shadow-lg">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActiveTab('camera');
              if (!cameraActive && !selectedImage) startLiveCamera();
            }}
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActiveTab('gallery');
              stopCamera();
              fileInputRef.current?.click();
            }}
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActiveTab('samples');
              stopCamera();
            }}
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-emerald-500/80 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Field Presets</span>
          </motion.button>
        </div>
      </div>

      {/* Camera Hardware Notice */}
      {cameraError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-4 text-amber-200 backdrop-blur-xl flex items-center justify-between gap-3 text-sm"
        >
          <span>{cameraError}</span>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/80 text-slate-950 font-bold shrink-0 hover:bg-emerald-500 text-xs cursor-pointer"
          >
            Native Shutter
          </button>
        </motion.div>
      )}

      {/* =========================================================================
          HERO VIEWFINDER & CAPTURED PREVIEW WITH layoutId="specimen-image"
          ========================================================================= */}
      <div className="relative">
        <motion.div
          layoutId="specimen-image"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] rounded-3xl overflow-hidden bg-emerald-950/20 backdrop-blur-2xl border ${
            dragOver ? 'border-emerald-400 ring-4 ring-emerald-500/30' : 'border-white/10'
          } shadow-2xl flex items-center justify-center`}
        >
          {cameraActive ? (
            /* State 1: Live Hardware Video Viewfinder */
            <div className="relative w-full h-full bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Corner Brackets in Sage Green */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-24 left-5 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-24 right-5 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-xl pointer-events-none" />

              {/* Animated Laser Scanning Line (Sage Green Glow) */}
              <motion.div
                className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)] pointer-events-none"
                animate={{ top: ['15%', '70%', '15%'] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              />

              {/* Center Target Box */}
              <div className="absolute inset-0 pb-16 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-3xl border border-white/20 border-dashed flex items-center justify-center">
                  <span className="text-sm font-bold uppercase tracking-wider text-emerald-300 bg-slate-950/80 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    Hold crop steady
                  </span>
                </div>
              </div>

              {/* Native Floating Shutter Bar cleanly over bottom center of feed */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-20">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 text-sm font-bold border border-white/15 hover:bg-slate-900 cursor-pointer"
                >
                  Close
                </motion.button>

                {/* Primary Floating Snap Photo Button (Native Camera Feel) */}
                <motion.button
                  id="btn-shutter-snap"
                  type="button"
                  whileTap={{ scale: 0.90 }}
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border-4 border-slate-950/80 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.5)] cursor-pointer group transition-all"
                  title="Snap photo"
                >
                  <Camera className="w-9 h-9 text-slate-950 stroke-[2.5]" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 text-sm font-bold border border-white/15 hover:bg-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Gallery</span>
                </motion.button>
              </div>
            </div>
          ) : selectedImage ? (
            /* State 2: Photo Captured / Preview Ready */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950/90 p-4">
              <img
                src={selectedImage}
                alt="Selected crop specimen"
                className="max-h-full max-w-full object-contain rounded-2xl"
              />

              {/* Dismiss / retake button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.90 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/80 border border-white/20 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-white bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Specimen Ready
                </span>
                <span className="font-semibold text-slate-200">
                  {selectedCrop === 'Auto-detect' ? 'AI Auto-detect' : selectedCrop}
                </span>
              </div>
            </div>
          ) : (
            /* State 3: Primary Idle Hero Camera Canvas (Eco-Glass Subtle Slate) */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-5 bg-gradient-to-b from-slate-900/60 via-slate-950/70 to-slate-950">
              <div className="space-y-2 max-w-md">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-sm font-bold text-emerald-300">
                  <Scan className="w-4 h-4 text-emerald-400" />
                  Point &amp; Diagnose Field AI
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Photograph Crop Specimen
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Hold leaf, stem, or fruit inside the frame. AgriScan auto-detects pathology and outputs your immediate 24-hour response plan.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm">
                <motion.button
                  id="btn-snap-with-camera"
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={startLiveCamera}
                  className="w-full py-4 min-h-[56px] rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.35)] cursor-pointer transition-colors"
                >
                  <Camera className="w-5 h-5 stroke-[2.5]" />
                  <span>OPEN LIVE CAMERA</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 min-h-[56px] rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Choose Photo</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Primary Action Button when an image is ready */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Optional Field Observation Input */}
          <div className="bg-slate-900/70 backdrop-blur-2xl rounded-2xl p-3.5 border border-white/10 shadow-lg">
            <input
              type="text"
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="Add optional notes (e.g. started after heavy rain, yellowing spreading)..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none px-2 py-1"
            />
          </div>

          <motion.button
            id="btn-run-pathology-diagnosis"
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={triggerDiagnose}
            disabled={isLoading}
            className="w-full py-4 min-h-[58px] rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.4)] cursor-pointer transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>Processing Pathology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>CHECK CROP HEALTH NOW</span>
                <ChevronRight className="w-5 h-5 text-slate-950" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Farm Location & Target Crop Accordion (Eco-Glass) */}
      <div className="rounded-3xl bg-emerald-900/10 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 shadow-lg">
        <button
          type="button"
          onClick={() => setShowAdvancedContext(!showAdvancedContext)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">
                Farm Location &amp; Target Crop
              </span>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {selectedZone === GENERAL_LOCATION_LABEL
                  ? 'Global / Auto-detect'
                  : selectedZone.split('(')[0].trim()}{' '}
                • Crop: {selectedCrop}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-emerald-400 transition-transform ${
              showAdvancedContext ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showAdvancedContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Agro-Ecological Zone (Optional):
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-emerald-400"
              >
                {GLOBAL_AGRO_ZONES.map((zone) => (
                  <option key={zone} value={zone} className="bg-slate-900 text-white">
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Crop Type (Optional — Auto-detected if unspecified):
              </label>
              <div className="flex flex-wrap gap-2">
                {REGIONAL_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                      selectedCrop === crop
                        ? 'bg-emerald-500/80 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-emerald-400/50'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enterprise Pathology Presets (when samples tab active) */}
      {activeTab === 'samples' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Enterprise Pathology Presets
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Tap to diagnose</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELD_SAMPLES.map((sample) => (
              <motion.button
                key={sample.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectSample(sample)}
                className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 text-left transition-all group cursor-pointer shadow-md"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 mb-2 border border-white/10">
                  <img
                    src={sample.thumbnailUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-xs font-black text-emerald-400 block truncate uppercase tracking-wider">
                  {sample.crop}
                </span>
                <p className="text-sm font-bold text-white line-clamp-1 mt-0.5 group-hover:text-emerald-300 transition-colors">
                  {sample.title}
                </p>
                <span className="text-xs text-slate-400 block truncate mt-0.5">
                  {sample.localZone}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
