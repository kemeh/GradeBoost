import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudCheck, RefreshCw, Sparkles, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onNetworkStatusChange, isOnline, syncOfflineSubmissionsToFirestore, getOfflineStorageMetrics, StorageMetrics } from '../services/offlineStorageService';
import toast from 'react-hot-toast';

export const OfflineStatusBanner: React.FC = () => {
  const [online, setOnline] = useState<boolean>(true);
  const [showSyncSuccess, setShowSyncSuccess] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);

  useEffect(() => {
    setOnline(isOnline());

    const refreshMetrics = async () => {
      const data = await getOfflineStorageMetrics();
      setMetrics(data);
    };

    refreshMetrics();

    const unsubscribe = onNetworkStatusChange(async (isNowOnline) => {
      setOnline(isNowOnline);

      if (isNowOnline) {
        // Just came back online -> perform sync of any offline attempts
        const { syncedCount } = await syncOfflineSubmissionsToFirestore();
        if (syncedCount > 0) {
          setShowSyncSuccess(true);
          toast.success(`Online! Synced ${syncedCount} offline practice attempt${syncedCount > 1 ? 's' : ''}.`);
          setTimeout(() => setShowSyncSuccess(false), 5000);
        }
      } else {
        toast('Offline mode active. Downloaded materials are available.', {
          icon: '📶',
          duration: 4000,
        });
      }

      refreshMetrics();
    });

    return () => unsubscribe();
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold z-50 sticky top-0"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-slate-950 shrink-0" />
              <span>
                <strong>Offline Study Mode</strong> — Internet disconnected. You can continue practicing with all downloaded papers & daily drills.
              </span>
            </div>
            {metrics && (metrics.practiceCount > 0 || metrics.drillCount > 0) && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-600/30 px-2.5 py-1 rounded-full text-[11px]">
                <Database size={12} /> {metrics.practiceCount} Papers • {metrics.drillCount} Drills Ready
              </span>
            )}
          </div>
        </motion.div>
      )}

      {showSyncSuccess && online && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 z-50 sticky top-0"
        >
          <Wifi size={16} />
          <span>Connection restored! All offline practice and drill submissions are synchronized.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
