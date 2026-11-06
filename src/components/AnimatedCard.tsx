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
      className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 ${className}`}
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
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-5 text-foreground">
        <div className="flex items-center justify-between">
          {badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-[11px] font-semibold text-primary border border-border shadow-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              {badge}
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
            {interaction === 'drag' ? (
              <>
                <Move className="h-2.5 w-2.5 text-primary" />
                <span>Drag to warp</span>
              </>
            ) : (
              <>
                <MousePointer className="h-2.5 w-2.5 text-primary" />
                <span>Hover to bend</span>
              </>
            )}
          </span>
        </div>

        {(title || subtitle || children) && (
          <div className="space-y-1.5 rounded-xl bg-card/90 p-3.5 border border-border shadow-md">
            {title && <h4 className="text-base font-bold tracking-tight text-foreground">{title}</h4>}
            {subtitle && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{subtitle}</p>}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>ElasticMesh Interactive 3D Canvas</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            GPU-accelerated vertex displacement mesh via OGL WebGL. Touch, hover, or drag to deform the surface.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex bg-secondary p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setInteractionMode('hover')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                interactionMode === 'hover' ? 'bg-primary text-primary-foreground shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hover Mode
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode('drag')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                interactionMode === 'drag' ? 'bg-primary text-primary-foreground shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'
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
              color1="#10B981"
              color2="#060D09"
              badge="Gradient Shader"
              title="Procedural Color Mesh"
              subtitle="Smooth OGL vertex springs with real-time normal lighting and grid lattice."
              interaction={interactionMode}
              tilt={14}
              shading={0.6}
            />
          </div>
          <span className="text-[11px] text-muted-foreground mt-2 font-mono">Example 1: Gradient Surface</span>
        </div>

        {/* Example 2: Texture Warp Surface */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[480px] h-[320px]">
            <AnimatedCard
              image="/images/media_1788672011845.jpg"
              color1="#22C55E"
              color2="#0D1C13"
              badge="Texture Warp"
              title="Agricultural Field Canopy"
              subtitle="Bending texture canvas with specular reflection and rubbery bounce physics."
              interaction={interactionMode}
              tilt={16}
              shading={0.8}
            />
          </div>
          <span className="text-[11px] text-muted-foreground mt-2 font-mono">Example 2: Image Texture Warp (Cassava Specimen)</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard;