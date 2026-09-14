import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  MapPin,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { WestAfricanCrop, FieldSample } from '../types';
import { FIELD_SAMPLES } from '../data/fieldSamples';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

const CROSS_RIVER_ZONES = [
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
  const [selectedZone, setSelectedZone] = useState<string>(CROSS_RIVER_ZONES[0]);
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
    setFieldNotes(`Field sample observation: ${sample.title} in ${sample.localZone}.`);
    onImageSelected(
      sample.thumbnailUrl,
      'image/svg+xml',
      sample.crop,
      sample.localZone,
      sample.description,
      sample.presetDiagnosis
    );
  };

  // Live Camera streaming helpers
  const startCamera = async () => {
    setCameraError(null);
    let stream: MediaStream | null = null;

    // First attempt: prefer rear-facing camera (works on mobile)
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
      console.error('[Camera] Preferred constraints failed:', primaryErr);
      // Fallback: any available camera (works on laptops without a rear camera)
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (fallbackErr) {
        const error = fallbackErr as Error;
        console.error('[Camera] All stream attempts failed:', error);
        setCameraError(
          `Camera unavailable: ${error.message || error.name}. Please use "Upload From Device" instead.`
        );
        return;
      }
    }

    streamRef.current = stream;
    // setCameraActive(true) triggers a re-render that mounts the <video> element.
    // The stream is wired to the video in the useEffect below, which runs *after*
    // React commits the DOM update and videoRef.current is populated.
    setCameraActive(true);
  };

  // ✅ Attach the MediaStream to the <video> element only after React has mounted it.
  // Previously this ran synchronously after setCameraActive(true) — at that point
  // videoRef.current was still null (the <video> hadn't been inserted yet), so the
  // srcObject assignment was silently skipped and the viewfinder stayed black.
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.error('[Camera] Video play error:', err));
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

  // Stop all tracks when the component unmounts to release the camera indicator light
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const triggerDiagnose = () => {
    if (!selectedImage) return;
    onImageSelected(
      selectedImage,
      mimeType,
      selectedCrop,
      selectedZone,
      fieldNotes
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper Control Bar: Region & Crop Selector */}
      <Card className="rounded-[28px] p-5 sm:p-7 shadow-xl border-emerald-500/30 bg-[#0D1C13]/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Location Selector */}
          <div className="flex-1 w-full">
            <label
              htmlFor="select-cross-river-zone"
              className="block text-sm font-bold text-emerald-400 mb-2.5 uppercase tracking-wider flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#22C55E]" />
              Cross River Agricultural Zone
            </label>
            <select
              id="select-cross-river-zone"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full min-h-[48px] h-12 bg-[#0A160F] border-2 border-emerald-500/50 text-white text-base font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/40 transition-colors cursor-pointer shadow-inner"
            >
              {CROSS_RIVER_ZONES.map((zone) => (
                <option key={zone} value={zone} className="bg-[#0A160F] text-white py-2">
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Selector */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-emerald-400 mb-2.5 uppercase tracking-wider">
              Target West African Crop
            </label>
            <div className="flex flex-wrap gap-2.5">
              {REGIONAL_CROPS.map((crop) => (
                <button
                  key={crop}
                  id={`btn-crop-select-${crop.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedCrop(crop)}
                  className={`min-h-[48px] px-5 py-3 rounded-2xl text-base font-bold transition-all border-2 active:scale-95 touch-manipulation cursor-pointer flex items-center justify-center ${
                    selectedCrop === crop
                      ? 'bg-[#22C55E] text-[#060D09] border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.5)] font-black'
                      : 'bg-[#0A160F]/90 text-white border-emerald-500/40 hover:border-[#22C55E] hover:text-[#22C55E] hover:bg-[#10281A]'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Zone / Live Viewfinder */}
      <div
        id="crop-photo-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-[32px] border-2 border-dashed transition-all p-6 sm:p-10 text-center bg-[#0D1C13]/70 backdrop-blur-md shadow-2xl min-h-[220px] flex flex-col items-center justify-center ${
          dragOver
            ? 'border-[#22C55E] bg-[#122A1C]/90 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
            : selectedImage
            ? 'border-[#22C55E]/70'
            : 'border-emerald-500/40 hover:border-[#22C55E]'
        }`}
      >
        {/* Hidden inputs */}
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

        {/* Live Video Camera Viewfinder Mode */}
        {cameraActive ? (
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="relative rounded-[24px] overflow-hidden aspect-video bg-black border-2 border-[#22C55E] shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ width: '100%', minHeight: '320px', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 border-2 border-[#22C55E]/60 rounded-[24px] pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/70 border-dashed rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
              <Button
                id="btn-shutter-snap"
                variant="default"
                onClick={capturePhoto}
                className="gap-2.5 px-7 py-3.5 min-h-[48px] text-base font-black w-full sm:w-auto shadow-lg shadow-emerald-950/60"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Leaf / Stem Photo</span>
              </Button>
              <Button
                id="btn-cancel-camera"
                variant="secondary"
                onClick={stopCamera}
                className="px-6 py-3.5 min-h-[48px] text-base font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Image Preview Mode */
          <div className="w-full max-w-lg mx-auto space-y-5">
            <div className="relative rounded-[28px] overflow-hidden max-h-84 mx-auto border-2 border-emerald-500/40 bg-[#0A160F] flex items-center justify-center shadow-2xl">
              <img
                src={selectedImage}
                alt="Selected crop preview"
                className="max-h-76 w-auto object-contain rounded-2xl"
              />
              <button
                id="btn-remove-selected-image"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field hand notes optional input */}
            <div className="text-left w-full">
              <label
                htmlFor="input-field-hand-notes"
                className="block text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider"
              >
                Field Hand Observations (Optional):
              </label>
              <input
                id="input-field-hand-notes"
                type="text"
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                placeholder="e.g. Started 5 days ago after heavy rainfall; yellowing spreads upwards"
                className="w-full min-h-[48px] bg-[#0A160F] border-2 border-emerald-500/40 text-white text-base rounded-xl px-4 py-3 focus:outline-none focus:border-[#22C55E] placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 pt-2 w-full">
              <Button
                id="btn-run-pathology-diagnosis"
                variant="default"
                onClick={triggerDiagnose}
                disabled={isLoading}
                className="gap-2.5 px-8 py-3.5 min-h-[52px] text-base sm:text-lg font-black shadow-[0_0_25px_rgba(34,197,94,0.5)] border-2 border-emerald-300/60 rounded-2xl w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#060D09]" />
                    <span>Analyzing Pathology with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#060D09]" />
                    <span>Diagnose Crop Health &amp; Generate Protocol</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <Button
                id="btn-choose-another-photo"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-6 py-3.5 min-h-[48px] text-base font-bold w-full sm:w-auto rounded-2xl"
              >
                Change Photo
              </Button>
            </div>
          </div>
        ) : (
          /* Empty Dropzone State */
          <div className="max-w-md mx-auto space-y-5 py-3 w-full">
            <div className="w-18 h-18 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 text-[#22C55E] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.25)]">
              <Upload className="w-9 h-9" />
            </div>

            <div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Upload or Snap Crop Photo
              </h3>
              <p className="text-sm sm:text-base text-slate-200 mt-2 leading-relaxed font-normal">
                Take a sharp, well-lit photo of the affected leaf, stem, pod, or tuber.
                Our agronomist will diagnose disease and provide Nigerian Pidgin audio guidance.
              </p>
            </div>

            {cameraError && (
              <Alert variant="destructive" className="text-left">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            {/* Mobile full-width action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2 w-full">
              <Button
                id="btn-upload-from-gallery"
                type="button"
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2.5 px-7 py-3.5 min-h-[48px] text-base font-black shadow-lg shadow-emerald-950/60 w-full sm:w-auto rounded-xl"
              >
                <ImageIcon className="w-5 h-5 text-[#060D09]" />
                <span>Upload From Device</span>
              </Button>

              <Button
                id="btn-snap-with-camera"
                type="button"
                variant="secondary"
                onClick={startCamera}
                className="gap-2.5 px-7 py-3.5 min-h-[48px] text-base font-bold border-2 border-emerald-500/40 hover:border-[#22C55E] shadow-sm w-full sm:w-auto rounded-xl"
              >
                <Camera className="w-5 h-5 text-[#22C55E]" />
                <span>Open Field Camera</span>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1">
              Drag &amp; drop photos here • Supports JPG, PNG, WebP up to 20MB
            </p>
          </div>
        )}
      </div>

      {/* Pre-loaded Field Samples for Quick Testing in Cross River State */}
      <Card className="rounded-[28px] p-5 sm:p-7 shadow-xl border-emerald-500/30 bg-[#0D1C13]/80 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-500/20">
          <div>
            <h4
              className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              Pre-loaded Cross River State Field Cases
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Select a real agricultural case study to test diagnosis and Nigerian Pidgin audio protocols instantly
            </p>
          </div>
          <Badge variant="default" className="self-start sm:self-auto text-xs py-1">
            6 Priority Crops + Rule #1 Test
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 pt-1">
          {FIELD_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-card-${sample.id}`}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="flex flex-col text-left p-3.5 rounded-[22px] bg-[#0A160F]/90 hover:bg-[#10281A] border-2 border-emerald-500/30 hover:border-[#22C55E] transition-all group active:scale-95 shadow-md hover:shadow-lg min-h-[48px] touch-manipulation cursor-pointer"
            >
              <div className="aspect-video w-full rounded-[14px] overflow-hidden bg-black/50 mb-2.5 border border-emerald-500/20 flex items-center justify-center">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#22C55E] truncate">
                {sample.crop}
              </span>
              <h5 className="text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-emerald-300 mt-0.5">
                {sample.title}
              </h5>
              <span className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                {sample.localZone}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
