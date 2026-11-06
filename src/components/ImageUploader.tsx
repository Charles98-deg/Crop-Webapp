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

      {/* Mode Segmented Controls */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-secondary border border-border p-1 shadow-sm">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActiveTab('camera');
              if (!cameraActive && !selectedImage) startLiveCamera();
            }}
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Field Samples</span>
          </motion.button>
        </div>
      </div>

      {/* Camera Hardware Notice */}
      {cameraError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-4 text-amber-200 flex items-center justify-between gap-3 text-sm"
        >
          <span>{cameraError}</span>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shrink-0 hover:bg-primary/90 text-xs cursor-pointer"
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
          className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] rounded-xl overflow-hidden bg-card border ${
            dragOver ? 'border-primary ring-2 ring-primary/30' : 'border-border'
          } shadow-sm flex items-center justify-center`}
        >
          {cameraActive ? (
            /* State 1: Live Hardware Video Viewfinder */
            <div className="relative w-full h-full bg-background">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Corner Brackets */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg pointer-events-none" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-24 left-5 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-24 right-5 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg pointer-events-none" />

              {/* Center Target Box */}
              <div className="absolute inset-0 pb-16 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-xl border border-foreground/20 border-dashed flex items-center justify-center">
                  <span className="text-sm font-semibold tracking-wider text-primary bg-background/80 px-3.5 py-1.5 rounded-full border border-border">
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
                  className="px-4 py-2.5 rounded-full bg-background/80 text-foreground text-sm font-semibold border border-border hover:bg-secondary cursor-pointer min-h-[44px]"
                >
                  Close
                </motion.button>

                {/* Primary Floating Snap Photo Button */}
                <motion.button
                  id="btn-shutter-snap"
                  type="button"
                  whileTap={{ scale: 0.90 }}
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background flex items-center justify-center shadow-md cursor-pointer transition-transform"
                  title="Snap photo"
                >
                  <Camera className="w-7 h-7 stroke-[2.25]" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-full bg-background/80 text-foreground text-sm font-semibold border border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>Gallery</span>
                </motion.button>
              </div>
            </div>
          ) : selectedImage ? (
            /* State 2: Photo Captured / Preview Ready */
            <div className="relative w-full h-full flex items-center justify-center bg-background p-4">
              <img
                src={selectedImage}
                alt="Selected crop specimen"
                className="max-h-full max-w-full object-contain rounded-xl"
              />

              {/* Dismiss / retake button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.90 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 border border-border text-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm cursor-pointer"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-foreground bg-background/85 px-4 py-2.5 rounded-xl border border-border">
                <span className="flex items-center gap-2 text-primary font-bold">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Photo Ready
                </span>
                <span className="font-semibold text-muted-foreground">
                  {selectedCrop === 'Auto-detect' ? 'Auto-detect crop' : selectedCrop}
                </span>
              </div>
            </div>
          ) : (
            /* State 3: Primary Idle Hero Camera Canvas */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-5 bg-card">
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight leading-snug">
                  Photograph Crop Specimen
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hold leaf, stem, or fruit inside the frame. AgriScan detects crop disease and outputs your immediate 24-hour response plan.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm">
                <motion.button
                  id="btn-snap-with-camera"
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={startLiveCamera}
                  className="w-full py-4 min-h-[52px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base flex items-center justify-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Camera className="w-5 h-5 stroke-[2.25]" />
                  <span>Open Camera</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 min-h-[52px] rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
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
          <div className="bg-card rounded-xl p-3.5 border border-border shadow-sm">
            <input
              type="text"
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="Add optional notes (e.g. started after heavy rain, yellowing spreading)..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1"
            />
          </div>

          <motion.button
            id="btn-run-pathology-diagnosis"
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={triggerDiagnose}
            disabled={isLoading}
            className="w-full py-4 min-h-[52px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-sm cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-primary-foreground" />
                <span>Analyzing crop health...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-primary-foreground" />
                <span>Check Crop Health</span>
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Farm Location & Target Crop Accordion */}
      <div className="rounded-xl bg-card border border-border p-4 sm:p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvancedContext(!showAdvancedContext)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">
                Farm Location &amp; Target Crop
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {selectedZone === GENERAL_LOCATION_LABEL
                  ? 'Global / Auto-detect'
                  : selectedZone.split('(')[0].trim()}{' '}
                • Crop: {selectedCrop}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform ${
              showAdvancedContext ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showAdvancedContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-border space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Agro-Ecological Zone (Optional):
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-secondary border border-border text-foreground text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary"
              >
                {GLOBAL_AGRO_ZONES.map((zone) => (
                  <option key={zone} value={zone} className="bg-card text-foreground">
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Crop Type (Optional — Auto-detected if unspecified):
              </label>
              <div className="flex flex-wrap gap-2">
                {REGIONAL_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors border cursor-pointer ${
                      selectedCrop === crop
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'bg-secondary/60 text-muted-foreground border-border hover:border-primary hover:text-foreground'
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

      {/* Field Pathology Presets (when samples tab active) */}
      {activeTab === 'samples' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              Field Sample Presets
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">Tap to diagnose</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELD_SAMPLES.map((sample) => (
              <motion.button
                key={sample.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectSample(sample)}
                className="p-3.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-background mb-2 border border-border">
                  <img
                    src={sample.thumbnailUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-xs font-bold text-primary block truncate uppercase tracking-wider">
                  {sample.crop}
                </span>
                <p className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
                  {sample.title}
                </p>
                <span className="text-xs text-muted-foreground block truncate mt-0.5">
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
