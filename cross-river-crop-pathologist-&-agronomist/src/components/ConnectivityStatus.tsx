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
        className={`flex flex-wrap items-center gap-3 text-xs ${className}`}
      >
        {/* Main Status Pill (Clickable for full diagnostics modal) */}
        <button
          onClick={() => setShowModal(true)}
          className={`group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-left transition-all active:scale-95 ${
            isOnline
              ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15'
              : 'bg-accent/15 border-accent/40 text-accent hover:bg-accent/25'
          }`}
          title="Click to view full offline/online synchronization status"
        >
          {/* Signal Indicator Dot / Icon */}
          <span className="relative flex h-2.5 w-2.5">
            {isOnline ? (
              <>
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSyncing ? 'bg-primary' : 'bg-primary'
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </>
            )}
          </span>

          {/* Status Text Label */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 shrink-0 text-primary" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 shrink-0 text-accent" />
            )}

            <span className="font-bold text-[11px] tracking-tight">
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
            className="text-[10px] px-1.5 py-0 rounded font-mono font-bold border-current/30"
          >
            {isOnline ? effectiveType : 'LOCAL'}
          </Badge>
        </button>

        {/* Sync Info / Last Synced Timestamp */}
        <div className="flex items-center gap-2 text-[11px]">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3 h-3 text-muted-foreground/60" />
              <span>
                Synced <strong className="font-semibold text-foreground">{formatSyncTime(lastSyncTime)}</strong>
              </span>
              {pingLatency !== null && (
                <span className="hidden sm:inline opacity-70 font-mono text-[10px]">
                  ({pingLatency}ms)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-accent font-medium">
              <Database className="w-3 h-3 text-accent" />
              <span>Local Diagnostic Cache Enabled</span>
            </div>
          )}

          {/* Quick Manual Sync / Test Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Check connectivity and sync now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>

        {/* Simulated offline warning badge (when developer/tester has simulation active) */}
        {isSimulatedOffline && (
          <Badge variant="outline" className="text-[10px] font-bold border-destructive/40 text-destructive bg-destructive/10">
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
          <div className="bg-foreground text-background rounded-2xl p-3.5 shadow-2xl border border-accent/40 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5 border border-accent/30">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-accent">
                    Offline Field Mode Active
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/30 text-background font-mono">
                    Device Cache
                  </span>
                </div>
                <p className="text-[11px] opacity-90 leading-tight">
                  No internet connection in your field. AgriScan is running locally on your device. Offline guides &amp; preset scans remain active.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[11px] font-bold text-accent hover:underline pt-1 inline-block"
                >
                  View Offline Capabilities &amp; Sync Guide →
                </button>
              </div>
            </div>

            <button
              onClick={() => setDismissFloatingPill(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors shrink-0"
              title="Dismiss warning banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------------
          DETAILED CONNECTIVITY & OFFLINE SYNC MODAL
          ------------------------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card className="bg-card rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border-border space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isOnline
                      ? 'bg-primary/10 text-primary'
                      : 'bg-accent/15 text-accent'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3
                    className="text-base sm:text-lg font-bold text-foreground"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Connectivity &amp; Sync Status
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cross River Smallholder Field Synchronization
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Connection Status Box */}
            <div
              className={`p-4 rounded-2xl border ${
                isOnline
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-accent/5 border-accent/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Network State
                </span>
                <Badge
                  variant={isOnline ? 'default' : 'warning'}
                  className="font-bold"
                >
                  {isOnline ? 'Online & Synchronized' : 'Offline Field Mode'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="bg-card p-2.5 rounded-xl border border-border">
                  <span className="block text-[10px] text-muted-foreground">Network Type</span>
                  <strong className="text-foreground font-mono">
                    {effectiveType}
                  </strong>
                </div>

                <div className="bg-card p-2.5 rounded-xl border border-border">
                  <span className="block text-[10px] text-muted-foreground">Server Latency</span>
                  <strong className="text-foreground font-mono">
                    {pingLatency !== null ? `${pingLatency} ms` : 'N/A'}
                  </strong>
                </div>

                <div className="bg-card p-2.5 rounded-xl border border-border col-span-2 sm:col-span-1">
                  <span className="block text-[10px] text-muted-foreground">Last Synced</span>
                  <strong className="text-foreground">
                    {formatSyncTime(lastSyncTime)}
                  </strong>
                </div>
              </div>
            </div>

            {/* How Offline Works for Farmers in Cross River */}
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4 text-primary" />
                How AgriScan Works in Remote Farms:
              </h4>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Zero-Data Offline Guides:</strong> The complete Cross River agronomy guide (Cassava, Cocoa, Oil Palm, Maize, Yam) is cached locally on your device.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Local Treatment Library:</strong> Organic neem leaf solutions, wood ash treatments, and recommended fungicides display immediately without loading from the cloud.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Automatic Sync on Reconnection:</strong> As soon as you step back into 2G/3G/4G coverage in Ikom, Calabar, or Ogoja, the app auto-syncs with Gemini 3.8 Flash live models.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Simulation button for demo / testing */}
              <Button
                type="button"
                variant={isSimulatedOffline ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleSimulatedOffline}
                className="text-xs font-bold"
              >
                {isSimulatedOffline ? 'Disable Offline Simulation' : 'Simulate Offline Mode'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={triggerSync}
                  disabled={isSyncing || !isOnline}
                  className="flex-1 sm:flex-none gap-2 text-xs font-bold shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing...' : 'Sync with Lab Server'}</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-bold"
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
