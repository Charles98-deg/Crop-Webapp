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

      const rawApiBase = (
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        ''
      ).trim();
      const configuredApiBase = rawApiBase
        .replace(/^(https?:\/\/)+/, (match) =>
          match.includes('https://') ? 'https://' : 'http://'
        )
        .replace(/\/+$/, '')
        .replace(/\/api\/diagnose\/?$/, '')
        .replace(/\/api\/?$/, '');
      const healthUrl = configuredApiBase ? `${configuredApiBase}/api/health` : '/api/health';

      const res = await fetch(healthUrl, {
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
              ? 'bg-secondary border-border text-foreground hover:border-primary/50'
              : 'bg-destructive/15 border-destructive/30 text-destructive hover:bg-destructive/20'
          }`}
          title="Click to view full offline/online synchronization status"
        >
          {/* Signal Indicator Dot / Icon */}
          <span className="relative flex h-3 w-3">
            <span
              className={`inline-flex rounded-full h-3 w-3 ${
                isOnline ? 'bg-primary' : 'bg-destructive'
              }`}
            />
          </span>

          {/* Status Text Label */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 shrink-0 text-primary" />
            ) : (
              <WifiOff className="w-4 h-4 shrink-0 text-destructive" />
            )}

            <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground">
              {isOnline ? (
                isSyncing ? (
                  'Sync Active...'
                ) : (
                  'Online'
                )
              ) : (
                'Offline Mode'
              )}
            </span>
          </div>

          {/* Network Details Chip */}
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 rounded font-mono font-bold"
          >
            {isOnline ? effectiveType : 'OFFLINE'}
          </Badge>
        </button>

        {/* Sync Info / Last Synced Timestamp */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Synced <strong className="font-bold text-foreground">{formatSyncTime(lastSyncTime)}</strong>
              </span>
              {pingLatency !== null && (
                <span className="hidden sm:inline text-muted-foreground font-mono text-xs">
                  ({pingLatency}ms)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-destructive font-semibold">
              <Database className="w-4 h-4 text-destructive shrink-0" />
              <span>Local Diagnostic Cache</span>
            </div>
          )}

          {/* Quick Manual Sync / Test Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            className="min-h-[48px] min-w-[48px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            title="Check connectivity and sync now"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>

        {/* Simulated offline warning badge (when developer/tester has simulation active) */}
        {isSimulatedOffline && (
          <Badge variant="destructive" className="text-xs font-bold">
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
          <div className="bg-card text-foreground rounded-2xl p-4 shadow-xl border border-destructive/40 flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0 mt-0.5 border border-destructive/30">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-destructive">
                    Offline Field Mode Active
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground font-mono font-bold border border-border">
                    Device Cache
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No internet connection in your field. AgriScan is running locally on your device. Offline guides &amp; preset scans remain active.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs font-bold text-primary hover:underline pt-1 inline-block cursor-pointer"
                >
                  View Offline Capabilities &amp; Sync Guide →
                </button>
              </div>
            </div>

            <button
              onClick={() => setDismissFloatingPill(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="bg-card rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-border text-foreground space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isOnline
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-destructive/15 text-destructive border border-destructive/30'
                  }`}
                >
                  {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                    Connectivity &amp; Sync Status
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Offline guides and field synchronization
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary min-h-[44px] min-w-[44px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Connection Status Box */}
            <div
              className={`p-4 rounded-xl border ${
                isOnline
                  ? 'bg-secondary/50 border-border'
                  : 'bg-destructive/10 border-destructive/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Current Network State
                </span>
                <Badge
                  variant={isOnline ? 'default' : 'warning'}
                  className="font-bold text-xs"
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <span className="block text-[11px] text-muted-foreground">Network Type</span>
                  <strong className="text-foreground font-mono text-sm">
                    {effectiveType}
                  </strong>
                </div>

                <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                  <span className="block text-[11px] text-muted-foreground">Server Latency</span>
                  <strong className="text-foreground font-mono text-sm">
                    {pingLatency !== null ? `${pingLatency} ms` : 'N/A'}
                  </strong>
                </div>

                <div className="bg-background/80 p-2.5 rounded-xl border border-border col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-muted-foreground">Last Synced</span>
                  <strong className="text-foreground text-sm">
                    {formatSyncTime(lastSyncTime)}
                  </strong>
                </div>
              </div>
            </div>

            {/* How Offline Works for Remote Farms */}
            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              <h4 className="font-serif font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <Smartphone className="w-5 h-5 text-primary" />
                How AgriScan Works in Remote Fields:
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Zero-Data Offline Guides:</strong> The complete agronomy pathology guide is cached locally on your device.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Local Treatment Library:</strong> Biological solutions, wood ash recipes, and recommended remedies display immediately without loading from the cloud.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Automatic Sync on Reconnection:</strong> As soon as your device reconnects to a mobile network or Wi-Fi, the app syncs automatically.
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
                size="default"
                onClick={toggleSimulatedOffline}
                className="min-h-[48px] text-sm font-bold rounded-xl"
              >
                {isSimulatedOffline ? 'Disable Simulation' : 'Simulate Offline'}
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={triggerSync}
                  disabled={isSyncing || !isOnline}
                  className="gap-2 min-h-[48px] text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Checking...' : 'Check Connection'}</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={() => setShowModal(false)}
                  className="min-h-[48px] text-base font-bold rounded-xl"
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
