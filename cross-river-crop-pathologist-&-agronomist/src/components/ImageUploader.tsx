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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Direct camera stream error, falling back to input capture:', error);
      setCameraError('Camera stream unavailable. Using device camera shutter.');
      // Trigger native file input with camera capture
      cameraInputRef.current?.click();
    }
  };

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
      stopCamera();
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
      <Card className="rounded-[24px] p-5 md:p-6 shadow-sm border-border bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Location Selector */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              Cross River Agricultural Zone
            </label>
            <select
              id="select-cross-river-zone"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-muted border border-input text-foreground text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary transition-colors"
            >
              {CROSS_RIVER_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Selector */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">
              Target West African Crop
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REGIONAL_CROPS.map((crop) => (
                <Button
                  key={crop}
                  id={`btn-crop-select-${crop.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  variant={selectedCrop === crop ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCrop(crop)}
                  className="rounded-xl text-xs font-semibold h-8"
                >
                  {crop}
                </Button>
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
        className={`relative rounded-[32px] border-2 border-dashed transition-all p-6 md:p-8 text-center bg-card shadow-sm ${
          dragOver
            ? 'border-accent bg-muted'
            : selectedImage
            ? 'border-primary/60'
            : 'border-muted-foreground/40 hover:border-primary'
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
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative rounded-[24px] overflow-hidden aspect-video bg-black border-2 border-primary shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-accent/60 rounded-[24px] pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border border-white/60 border-dashed rounded-xl" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                id="btn-shutter-snap"
                variant="default"
                onClick={capturePhoto}
                className="gap-2 px-6 py-3 font-bold shadow-md"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Leaf / Stem Photo</span>
              </Button>
              <Button
                id="btn-cancel-camera"
                variant="secondary"
                onClick={stopCamera}
                className="px-4 py-3 font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Image Preview Mode */
          <div className="max-w-lg mx-auto space-y-4">
            <div className="relative rounded-[24px] overflow-hidden max-h-80 mx-auto border-2 border-border bg-muted flex items-center justify-center shadow-inner">
              <img
                src={selectedImage}
                alt="Selected crop preview"
                className="max-h-72 w-auto object-contain rounded-xl"
              />
              <button
                id="btn-remove-selected-image"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-accent text-white transition-colors shadow-sm"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field hand notes optional input */}
            <div className="text-left">
              <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                Field Hand Observations (Optional):
              </label>
              <input
                id="input-field-hand-notes"
                type="text"
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                placeholder="e.g. Started 5 days ago after heavy rainfall; yellowing spreads upwards"
                className="w-full bg-muted border border-input text-foreground text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                id="btn-run-pathology-diagnosis"
                variant="default"
                onClick={triggerDiagnose}
                disabled={isLoading}
                className="gap-2 px-7 py-3 font-bold text-sm shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-primary-foreground" />
                    <span>Analyzing Pathology with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Diagnose Crop Health & Generate Protocol</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Button
                id="btn-choose-another-photo"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-3 font-medium text-xs"
              >
                Change Photo
              </Button>
            </div>
          </div>
        ) : (
          /* Empty Dropzone State */
          <div className="max-w-md mx-auto space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border text-primary flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Upload or Snap Crop Photo
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Take a sharp, well-lit photo of the affected leaf, stem, pod, or tuber.
                Our agronomist will diagnose disease and provide Nigerian Pidgin audio guidance.
              </p>
            </div>

            {cameraError && (
              <Alert variant="destructive" className="text-left text-xs">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                id="btn-upload-from-gallery"
                type="button"
                variant="accent"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 px-5 py-2.5 text-xs font-bold shadow-sm"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload From Device</span>
              </Button>

              <Button
                id="btn-snap-with-camera"
                type="button"
                variant="secondary"
                onClick={startCamera}
                className="gap-2 px-5 py-2.5 text-xs font-bold border-border shadow-sm"
              >
                <Camera className="w-4 h-4 text-accent" />
                <span>Open Field Camera</span>
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Drag & drop photos here • Supports JPG, PNG, WebP up to 20MB
            </p>
          </div>
        )}
      </div>

      {/* Pre-loaded Field Samples for Quick Testing in Cross River State */}
      <Card className="rounded-[24px] p-5 shadow-sm border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
          <div>
            <h4
              className="text-base font-bold text-primary flex items-center gap-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              Pre-loaded Cross River State Field Cases
            </h4>
            <p className="text-xs text-muted-foreground">
              Select a real agricultural case study to test diagnosis and Nigerian Pidgin audio protocols instantly
            </p>
          </div>
          <Badge variant="default" className="self-start sm:self-auto text-[11px]">
            6 Priority Crops + Rule #1 Test
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-1">
          {FIELD_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-card-${sample.id}`}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="flex flex-col text-left p-3 rounded-[20px] bg-muted hover:bg-card border border-border hover:border-accent transition-all group active:scale-95 shadow-2xs hover:shadow-xs"
            >
              <div className="aspect-video w-full rounded-[14px] overflow-hidden bg-secondary mb-2 border border-border flex items-center justify-center">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent truncate">
                {sample.crop}
              </span>
              <h5 className="text-xs font-semibold text-foreground line-clamp-1 leading-snug group-hover:text-primary">
                {sample.title}
              </h5>
              <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                {sample.localZone}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
