import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  X,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { WestAfricanCrop, FieldSample } from '../types';
import { FIELD_SAMPLES } from '../data/fieldSamples';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const GENERAL_LOCATION_LABEL = 'General Guidance (No LGA required)';

const CROSS_RIVER_ZONES = [
  GENERAL_LOCATION_LABEL,
  'Ikom (Central Cocoa Belt)',
  'Etung / Boki (Cocoa & Rainforest Zone)',
  'Ogoja (Northern Grain & Yam Belt)',
  'Yala (Savanna Yam & Cassava Zone)',
  'Obudu (Plateau & Grain Zone)',
  'Akamkpa (Oil Palm & Rubber Belt)',
  'Calabar / Odukpani (Coastal Agro-Zone)',
  'Obubra (Cassava & Mixed Cropping)',
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [selectedCrop, setSelectedCrop] = useState<WestAfricanCrop>('Auto-detect');
  const [selectedZone, setSelectedZone] = useState<string>(GENERAL_LOCATION_LABEL);
  const [showAdvancedContext, setShowAdvancedContext] = useState<boolean>(false);
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: FieldSample) => {
    setSelectedImage(sample.thumbnailUrl);
    setMimeType('image/svg+xml');
    setSelectedCrop(sample.crop);
    const sampleLoc = sample.localZone || '';
    setSelectedZone(sampleLoc || GENERAL_LOCATION_LABEL);
    setFieldNotes(`Field sample observation: ${sample.title} in ${sample.localZone}.`);
    onImageSelected(
      sample.thumbnailUrl,
      'image/svg+xml',
      sample.crop,
      sampleLoc,
      sample.description,
      sample.presetDiagnosis
    );
  };

  // Live Camera streaming helpers
  const startCamera = async () => {
    setCameraError(null);
    let stream: MediaStream | null = null;

    // Prefer rear-facing camera on mobile devices
    const preferredConstraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(preferredConstraints);
    } catch (primaryErr) {
      console.warn('[Camera] Environment camera unavailable, trying default camera:', primaryErr);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (fallbackErr) {
        const error = fallbackErr as Error;
        console.warn('[Camera] Live stream failed, triggering direct camera capture input:', error);
        // Direct native mobile camera fallback
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
          return;
        }
        setCameraError(
          `Camera unavailable: ${error.message || error.name}. Please tap "Choose From Phone" instead.`
        );
        return;
      }
    }

    streamRef.current = stream;
    setCameraActive(true);
  };

  // Attach stream once <video> is mounted
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
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const triggerDiagnose = () => {
    if (!selectedImage) return;
    // Pass empty string for location if General Guidance is selected
    const effectiveLocation = selectedZone === GENERAL_LOCATION_LABEL ? '' : selectedZone;
    onImageSelected(
      selectedImage,
      mimeType,
      selectedCrop,
      effectiveLocation,
      fieldNotes
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        id="file-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <input
        ref={cameraInputRef}
        id="camera-capture-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* =========================================================================
          HERO STEP 1: CAMERA FIRST (ONE OBVIOUS PRIMARY ACTION)
          ========================================================================= */}
      <Card
        id="crop-photo-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-[32px] p-6 sm:p-10 border-2 transition-all shadow-2xl backdrop-blur-md bg-[#0D1C13]/85 text-center ${
          dragOver
            ? 'border-[#22C55E] bg-[#122A1C] shadow-[0_0_35px_rgba(34,197,94,0.4)]'
            : selectedImage
            ? 'border-[#22C55E]/70'
            : 'border-emerald-500/40 hover:border-[#22C55E]/60'
        }`}
      >
        {/* State A: Live Camera Active Viewfinder */}
        {cameraActive ? (
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="relative rounded-[24px] overflow-hidden aspect-video bg-black border-2 border-[#22C55E] shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: '320px', width: '100%' }}
              />
              <div className="absolute inset-0 border-2 border-[#22C55E]/60 rounded-[24px] pointer-events-none flex items-center justify-center">
                <div className="w-52 h-52 border-2 border-white/80 border-dashed rounded-2xl animate-pulse flex items-center justify-center">
                  <span className="text-white/80 text-xs font-bold uppercase tracking-wider bg-black/60 px-2 py-1 rounded">
                    Hold crop here
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
              <Button
                id="btn-shutter-snap"
                type="button"
                variant="default"
                onClick={capturePhoto}
                className="gap-3 px-8 py-4 min-h-[56px] text-lg font-black bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A] rounded-2xl shadow-[0_0_25px_rgba(34,197,94,0.5)] w-full sm:w-auto"
              >
                <Camera className="w-6 h-6 stroke-[2.5]" />
                <span>SNAP CROP PHOTO</span>
              </Button>
              <Button
                id="btn-cancel-camera"
                type="button"
                variant="secondary"
                onClick={stopCamera}
                className="px-6 py-4 min-h-[56px] text-base font-bold w-full sm:w-auto rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : selectedImage ? (
          /* State B: Image Captured / Preview Ready */
          <div className="w-full max-w-lg mx-auto space-y-5">
            <div className="relative rounded-[28px] overflow-hidden max-h-84 mx-auto border-2 border-emerald-500/40 bg-[#0A160F] flex items-center justify-center shadow-2xl">
              <img
                src={selectedImage}
                alt="Selected crop specimen"
                className="max-h-76 w-auto object-contain rounded-2xl"
              />
              <button
                id="btn-remove-selected-image"
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs text-emerald-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" />
              <span>
                {selectedCrop === 'Auto-detect'
                  ? 'AI will automatically detect crop'
                  : `Target crop: ${selectedCrop}`}
              </span>
              <span>•</span>
              <span>
                {selectedZone === GENERAL_LOCATION_LABEL
                  ? 'General guidance'
                  : selectedZone.split('(')[0].trim()}
              </span>
            </div>

            {/* Field Notes (Optional) */}
            <div className="text-left w-full">
              <label
                htmlFor="input-field-hand-notes"
                className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider"
              >
                Anything else to note? (Optional):
              </label>
              <input
                id="input-field-hand-notes"
                type="text"
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                placeholder="e.g. Started after heavy rainfall; spots spreading to young pods"
                className="w-full min-h-[48px] bg-[#0A160F] border-2 border-emerald-500/40 text-white text-base rounded-xl px-4 py-3 focus:outline-none focus:border-[#22C55E] placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* PRIMARY CALL TO ACTION: Check Crop & Get 24-Hour Action Plan */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 pt-2 w-full">
              <Button
                id="btn-run-pathology-diagnosis"
                type="button"
                variant="default"
                onClick={triggerDiagnose}
                disabled={isLoading}
                className="gap-3 px-9 py-4 min-h-[58px] text-lg font-black shadow-[0_0_30px_rgba(34,197,94,0.6)] bg-[#22C55E] text-[#060D09] hover:bg-[#16A34A] rounded-2xl w-full sm:w-auto active:scale-95 transition-transform cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#060D09]" />
                    <span>Checking Your Crop Health...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#060D09]" />
                    <span>Check Crop &amp; Get 24-Hour Action Plan</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <Button
                id="btn-choose-another-photo"
                type="button"
                variant="secondary"
                onClick={() => {
                  if (cameraInputRef.current) {
                    cameraInputRef.current.click();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={isLoading}
                className="px-6 py-4 min-h-[52px] text-base font-bold w-full sm:w-auto rounded-2xl border border-emerald-500/30"
              >
                Change Photo
              </Button>
            </div>
          </div>
        ) : (
          /* State C: Primary Empty State (CAMERA FIRST) */
          <div className="max-w-lg mx-auto space-y-6 py-4 w-full">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>AI Crop Health Triage • Zero Setup Required</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Take a Photo of Your Crop
              </h2>

              <p className="text-base sm:text-lg text-slate-200 max-w-md mx-auto leading-relaxed">
                Snap the affected leaf, stem, fruit, or pod. AgriScan will identify the crop, diagnose what may be happening, and give you an immediate 24-hour action plan.
              </p>
            </div>

            {cameraError && (
              <Alert variant="destructive" className="text-left">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            {/* UNMISSABLE GIANT CAMERA PRIMARY CTA */}
            <div className="space-y-3 pt-2">
              <Button
                id="btn-snap-with-camera"
                type="button"
                variant="default"
                onClick={startCamera}
                className="relative group w-full py-5 sm:py-6 min-h-[64px] sm:min-h-[72px] text-xl sm:text-2xl font-black tracking-wide text-[#060D09] bg-[#22C55E] hover:bg-[#16A34A] rounded-2xl border-2 border-emerald-300/80 shadow-[0_0_35px_rgba(34,197,94,0.65)] hover:shadow-[0_0_55px_rgba(34,197,94,0.85)] transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-3.5"
              >
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.75] text-[#060D09] group-hover:scale-110 transition-transform" />
                <span className="uppercase font-extrabold">TAKE PHOTO / SHOW CROP</span>
              </Button>

              {/* SECONDARY ACTION: Upload from gallery/phone */}
              <Button
                id="btn-upload-from-gallery"
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 min-h-[50px] text-base font-bold bg-[#0A160F] text-slate-200 hover:text-white hover:bg-[#10281A] border-2 border-emerald-500/40 hover:border-[#22C55E] rounded-xl transition-colors flex items-center justify-center gap-2.5"
              >
                <ImageIcon className="w-5 h-5 text-[#22C55E]" />
                <span>Or Choose Photo From Phone / Gallery</span>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Works on all Android &amp; smartphones • AI automatically detects the crop
            </p>
          </div>
        )}
      </Card>

      {/* =========================================================================
          OPTIONAL CONTEXT: LOCATION & CROP (NOT A GATEKEEPER)
          ========================================================================= */}
      <Card className="rounded-[24px] p-4 sm:p-5 shadow-lg border border-emerald-500/25 bg-[#0A160F]/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#22C55E] shrink-0" />
            <div>
              <span className="text-sm font-bold text-white">
                Farm Location &amp; Crop Context
              </span>
              <span className="text-xs text-emerald-400 font-semibold ml-2">
                (Optional)
              </span>
              <p className="text-xs text-slate-300">
                {selectedZone === GENERAL_LOCATION_LABEL
                  ? 'General Guidance active • AI auto-detects crop'
                  : `${selectedZone} • Crop: ${selectedCrop}`}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedContext(!showAdvancedContext)}
            className="text-xs text-emerald-300 hover:text-white font-bold gap-1 min-h-[40px]"
          >
            <span>{showAdvancedContext ? 'Hide Context' : 'Add Farm Location'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showAdvancedContext ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>

        {/* Collapsible details for optional context */}
        {showAdvancedContext && (
          <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-2 text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-emerald-500/20">
              <Info className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <p>
                <strong>Location is completely optional:</strong> If you do not know your Local Government or farm in multiple places, keep <em>General Guidance</em>. AgriScan provides full diagnostic accuracy regardless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Optional LGA Selector */}
              <div>
                <label
                  htmlFor="select-cross-river-zone"
                  className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider"
                >
                  Farm Location (Optional):
                </label>
                <select
                  id="select-cross-river-zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full min-h-[46px] bg-[#060D09] border-2 border-emerald-500/40 text-white text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#22C55E] cursor-pointer"
                >
                  {CROSS_RIVER_ZONES.map((zone) => (
                    <option key={zone} value={zone} className="bg-[#0A160F] text-white">
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Crop Override */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                  Target Crop (Optional — AI auto-detects):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONAL_CROPS.map((crop) => (
                    <button
                      key={crop}
                      id={`btn-crop-select-${crop.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => setSelectedCrop(crop)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedCrop === crop
                          ? 'bg-[#22C55E] text-[#060D09] border-[#22C55E] font-black'
                          : 'bg-[#060D09] text-slate-200 border-emerald-500/30 hover:border-[#22C55E]'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* =========================================================================
          PRE-LOADED DEMO CASES FOR EVALUATION
          ========================================================================= */}
      <Card className="rounded-[28px] p-5 sm:p-6 shadow-xl border border-emerald-500/25 bg-[#0D1C13]/70 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-emerald-500/20">
          <div>
            <h4
              className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              Test with Real Cross River Cases
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant evaluation samples: tap to see immediate triage, 24-hour action plan, and Pidgin audio
            </p>
          </div>
          <Badge variant="default" className="self-start sm:self-auto text-xs py-0.5">
            Instant Test Cases
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-1">
          {FIELD_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-card-${sample.id}`}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="flex flex-col text-left p-3 rounded-[20px] bg-[#0A160F]/90 hover:bg-[#10281A] border border-emerald-500/30 hover:border-[#22C55E] transition-all group active:scale-95 shadow-sm hover:shadow-md touch-manipulation cursor-pointer"
            >
              <div className="aspect-video w-full rounded-[12px] overflow-hidden bg-black/50 mb-2 border border-emerald-500/20 flex items-center justify-center">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E] truncate">
                {sample.crop}
              </span>
              <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 mt-0.5">
                {sample.title}
              </h5>
              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                {sample.localZone}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

