import React, { useState, useEffect, useCallback } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  X,
  Database,
  Smartphone,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ConnectivityState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  effectiveType: string;
  pingLatency: number | null;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  triggerSync: () => Promise<void>;
}

// Custom hook to track real browser online status, effective connection speed, and sync cycle
export function useConnectivity(): ConnectivityState {
  const [realOnline, setRealOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => new Date());
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [effectiveType, setEffectiveType] = useState<string>('4G');

  // Compute effective online state (factoring in test simulation)
  const isOnline = isSimulatedOffline ? false : realOnline;

  const triggerSync = useCallback(async () => {
    if (isSimulatedOffline || !navigator.onLine) {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        setPingLatency(elapsed);
        setLastSyncTime(new Date());
        setRealOnline(true);
      } else {
        setRealOnline(false);
      }
    } catch {
      // If health check fails or times out, consider degraded/offline
      if (!isSimulatedOffline && !navigator.onLine) {
        setRealOnline(false);
      }
    } finally {
      // Keep syncing animation visible for at least 600ms for smooth UX feedback
      setTimeout(() => {
        setIsSyncing(false);
      }, 600);
    }
  }, [isSimulatedOffline]);

  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setRealOnline(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read NetworkInformation API if available in Chromium / Android browsers
    const navAny = navigator as unknown as {
      connection?: {
        effectiveType?: string;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const updateConnectionInfo = () => {
      if (navAny.connection?.effectiveType) {
        setEffectiveType(navAny.connection.effectiveType.toUpperCase());
      }
    };

    updateConnectionInfo();
    if (navAny.connection?.addEventListener) {
      navAny.connection.addEventListener('change', updateConnectionInfo);
    }

    // Periodic heartbeat sync every 60 seconds if online
    const interval = setInterval(() => {
      if (navigator.onLine && !isSimulatedOffline) {
        triggerSync();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navAny.connection?.removeEventListener) {
        navAny.connection.removeEventListener('change', updateConnectionInfo);
      }
      clearInterval(interval);
    };
  }, [triggerSync, isSimulatedOffline]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    effectiveType: isOnline ? effectiveType : 'OFFLINE',
    pingLatency,
    isSimulatedOffline,
    toggleSimulatedOffline,
    triggerSync,
  };
}

interface ConnectivityStatusProps {
  theme?: 'light' | 'dark' | 'natural';
  className?: string;
  showPersistentFloatingBadge?: boolean;
}

export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({
  className = '',
  showPersistentFloatingBadge = true,
}) => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    effectiveType,
    pingLatency,
    isSimulatedOffline,
    toggleSimulatedOffline,
    triggerSync,
  } = useConnectivity();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [dismissFloatingPill, setDismissFloatingPill] = useState<boolean>(false);

  // Format relative time for last sync
  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* -------------------------------------------------------------------
          INLINE FOOTER STATUS COMPONENT
          ------------------------------------------------------------------- */}
      <div
        id="connectivity-footer-status"
        className={`flex flex-wrap items-center gap-3.5 text-sm ${className}`}
      >
        {/* Main Status Pill (Clickable for full diagnostics modal) */}
        <button
          onClick={() => setShowModal(true)}
          className={`group inline-flex items-center gap-3 px-4 py-2.5 min-h-[48px] rounded-full border text-left transition-all active:scale-95 touch-manipulation cursor-pointer ${
            isOnline
              ? 'bg-[#0A160F] border-emerald-500/40 text-white hover:border-[#22C55E] hover:bg-[#10281A]'
              : 'bg-red-950/60 border-red-500/50 text-red-200 hover:bg-red-900/60'
          }`}
          title="Click to view full offline/online synchronization status"
        >
          {/* Signal Indicator Dot / Icon */}
          <span className="relative flex h-3 w-3">
            {isOnline ? (
              <>
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSyncing ? 'bg-[#22C55E]' : 'bg-[#22C55E]'
                  }`}
                />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]" />
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </>
            )}
          </span>

          {/* Status Text Label */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 shrink-0 text-[#22C55E]" />
            ) : (
              <WifiOff className="w-4 h-4 shrink-0 text-red-400" />
            )}

            <span className="font-bold text-xs sm:text-sm tracking-tight text-white">
              {isOnline ? (
                isSyncing ? (
                  'Sync Active...'
                ) : (
                  'Online • Sync Active'
                )
              ) : (
                'Offline Mode Active'
              )}
            </span>
          </div>

          {/* Network Details Chip */}
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 rounded font-mono font-bold border-emerald-500/40 text-[#22C55E] bg-black/40"
          >
            {isOnline ? effectiveType : 'LOCAL'}
          </Badge>
        </button>

        {/* Sync Info / Last Synced Timestamp */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Synced <strong className="font-bold text-white">{formatSyncTime(lastSyncTime)}</strong>
              </span>
              {pingLatency !== null && (
                <span className="hidden sm:inline text-emerald-400 font-mono text-xs">
                  ({pingLatency}ms)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-300 font-semibold">
              <Database className="w-4 h-4 text-red-400 shrink-0" />
              <span>Local Diagnostic Cache Enabled</span>
            </div>
          )}

          {/* Quick Manual Sync / Test Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            className="min-h-[48px] min-w-[48px] rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            title="Check connectivity and sync now"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#22C55E]' : ''}`} />
          </Button>
        </div>

        {/* Simulated offline warning badge (when developer/tester has simulation active) */}
        {isSimulatedOffline && (
          <Badge variant="outline" className="text-xs font-bold border-red-500/50 text-red-300 bg-red-950/60">
            SIMULATED
          </Badge>
        )}
      </div>

      {/* -------------------------------------------------------------------
          PERSISTENT FLOATING BOTTOM BADGE (Only shows when offline so farmers immediately know)
          ------------------------------------------------------------------- */}
      {showPersistentFloatingBadge && !isOnline && !dismissFloatingPill && (
        <aside
          aria-label="Offline Mode Notification"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
        >
          <div className="bg-[#0A160F] text-white rounded-2xl p-4 shadow-2xl border-2 border-red-500/50 flex items-start justify-between gap-3.5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 border border-red-500/40">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-red-400">
                    Offline Field Mode Active
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/30 text-white font-mono font-bold">
                    Device Cache
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  No internet connection in your field. AgriScan is running locally on your device. Offline guides &amp; preset scans remain active.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-[#22C55E] hover:underline pt-1 inline-block cursor-pointer"
                >
                  View Offline Capabilities &amp; Sync Guide →
                </button>
              </div>
            </div>

            <button
              onClick={() => setDismissFloatingPill(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Dismiss warning banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------------
          DETAILED CONNECTIVITY & OFFLINE SYNC MODAL
          ------------------------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="bg-[#0D1C13]/95 backdrop-blur-md rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/30 text-white space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isOnline
                      ? 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                </div>
                <div>
                  <h3
                    className="text-lg sm:text-xl font-bold text-white"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Connectivity &amp; Sync Status
                  </h3>
                  <p className="text-xs text-slate-300">
                    Cross River Smallholder Field Synchronization
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="rounded-xl text-slate-300 hover:text-white min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Connection Status Box */}
            <div
              className={`p-4 rounded-2xl border-2 ${
                isOnline
                  ? 'bg-[#0A160F] border-emerald-500/30'
                  : 'bg-red-950/30 border-red-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Current Network State
                </span>
                <Badge
                  variant={isOnline ? 'default' : 'warning'}
                  className="font-bold text-xs"
                >
                  {isOnline ? 'Online & Synchronized' : 'Offline Field Mode'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20">
                  <span className="block text-[11px] text-slate-400">Network Type</span>
                  <strong className="text-white font-mono text-sm">
                    {effectiveType}
                  </strong>
                </div>

                <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20">
                  <span className="block text-[11px] text-slate-400">Server Latency</span>
                  <strong className="text-white font-mono text-sm">
                    {pingLatency !== null ? `${pingLatency} ms` : 'N/A'}
                  </strong>
                </div>

                <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-slate-400">Last Synced</span>
                  <strong className="text-white text-sm">
                    {formatSyncTime(lastSyncTime)}
                  </strong>
                </div>
              </div>
            </div>

            {/* How Offline Works for Farmers in Cross River */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Smartphone className="w-5 h-5 text-[#22C55E]" />
                How AgriScan Works in Remote Farms:
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Zero-Data Offline Guides:</strong> The complete Cross River agronomy guide (Cassava, Cocoa, Oil Palm, Maize, Yam) is cached locally on your device.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Local Treatment Library:</strong> Organic neem leaf solutions, wood ash treatments, and recommended fungicides display immediately without loading from the cloud.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Automatic Sync on Reconnection:</strong> As soon as you step back into 2G/3G/4G coverage in Ikom, Calabar, or Ogoja, the app auto-syncs with Gemini 3.8 Flash live models.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Simulation button for demo / testing */}
              <Button
                type="button"
                variant={isSimulatedOffline ? 'destructive' : 'outline'}
                size="default"
                onClick={toggleSimulatedOffline}
                className="min-h-[48px] text-sm font-bold"
              >
                {isSimulatedOffline ? 'Disable Offline Simulation' : 'Simulate Offline Mode'}
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={triggerSync}
                  disabled={isSyncing || !isOnline}
                  className="gap-2 min-h-[48px] text-base font-black bg-[#22C55E] text-[#060D09]"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing...' : 'Sync with Lab Server'}</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={() => setShowModal(false)}
                  className="min-h-[48px] text-base font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
