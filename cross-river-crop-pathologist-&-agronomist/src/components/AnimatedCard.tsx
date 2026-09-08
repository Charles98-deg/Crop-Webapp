import React, { useState } from 'react';
import ElasticMesh from './ElasticMesh';
import { Sparkles, Image as ImageIcon, Move, MousePointer } from 'lucide-react';

export interface AnimatedCardProps {
  /** Optional image URL to warp. When omitted, gradient surface is rendered. */
  image?: string;
  /** Top color of the gradient surface */
  color1?: string;
  /** Bottom color of the gradient surface */
  color2?: string;
  /** Optional title */
  title?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional category badge */
  badge?: string;
  /** Width of the card (number for px or CSS string) */
  width?: number | string;
  /** Height of the card (number for px or CSS string) */
  height?: number | string;
  /** Interaction mode: 'hover' or 'drag' */
  interaction?: 'hover' | 'drag';
  /** Perspective tilt in degrees */
  tilt?: number;
  /** Shading depth */
  shading?: number;
  /** Corner radius in pixels */
  borderRadius?: number;
  /** Lattice line display */
  showGrid?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional overlay children */
  children?: React.ReactNode;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  image,
  color1 = '#4F46E5',
  color2 = '#0EA5E9',
  title,
  subtitle,
  badge,
  width = '100%',
  height = 340,
  interaction = 'hover',
  tilt = 14,
  shading = 0.5,
  borderRadius = 24,
  showGrid = true,
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-white/20 bg-slate-900/80 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-emerald-400/40 hover:shadow-emerald-950/40 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {/* 3D Elastic WebGL Surface */}
      <div className="absolute inset-0 z-0">
        <ElasticMesh
          image={image}
          color1={color1}
          color2={color2}
          interaction={interaction}
          tilt={tilt}
          fit={0.82}
          shading={shading}
          borderRadius={borderRadius}
          showGrid={showGrid}
          highlight="#ffffff"
          gridColor="#ffffff"
          gridOpacity={0.24}
          gridDensity={22}
          stiffness={0.06}
          damping={0.2}
          grabRadius={0.6}
          pull={0.42}
          wobble={5}
          resolution={25}
        />
      </div>

      {/* Glassmorphic Overlay Content */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-center justify-between">
          {badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md border border-white/10 shadow-sm">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              {badge}
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur-md border border-white/10">
            {interaction === 'drag' ? (
              <>
                <Move className="h-2.5 w-2.5 text-sky-400" />
                <span>Drag to warp</span>
              </>
            ) : (
              <>
                <MousePointer className="h-2.5 w-2.5 text-emerald-400" />
                <span>Hover to bend</span>
              </>
            )}
          </span>
        </div>

        {(title || subtitle || children) && (
          <div className="space-y-1.5 rounded-2xl bg-black/40 p-3.5 backdrop-blur-md border border-white/10 shadow-lg">
            {title && <h4 className="text-base font-bold tracking-tight text-white drop-shadow-sm">{title}</h4>}
            {subtitle && <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Interactive Showcase component displaying both ElasticMesh examples from React Bits
 */
export const ElasticMeshShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gradient' | 'image' | 'both'>('both');
  const [interactionMode, setInteractionMode] = useState<'hover' | 'drag'>('hover');

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>ElasticMesh Interactive 3D Canvas</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            GPU-accelerated vertex displacement mesh via OGL WebGL. Touch, hover, or drag to deform the surface.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-800/80 p-1 rounded-xl border border-white/15 text-xs">
            <button
              type="button"
              onClick={() => setInteractionMode('hover')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                interactionMode === 'hover' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hover Mode
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode('drag')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                interactionMode === 'drag' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Drag Mode
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
        {/* Example 1: Pure Color Gradient Surface */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[480px] h-[320px]">
            <AnimatedCard
              color1="#4F46E5"
              color2="#0EA5E9"
              badge="Gradient Shader"
              title="Procedural Color Mesh"
              subtitle="Smooth OGL vertex springs with real-time normal lighting and grid lattice."
              interaction={interactionMode}
              tilt={14}
              shading={0.6}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">Example 1: Gradient Surface (#4F46E5 → #0EA5E9)</span>
        </div>

        {/* Example 2: Texture Warp Surface */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[480px] h-[320px]">
            <AnimatedCard
              image="/images/media_1788672011845.jpg"
              color1="#5227FF"
              color2="#B19EEF"
              badge="Texture Warp"
              title="Agricultural Field Canopy"
              subtitle="Bending texture canvas with specular reflection and rubbery bounce physics."
              interaction={interactionMode}
              tilt={16}
              shading={0.8}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">Example 2: Image Texture Warp (Cross River Cassava)</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard;