import { useEffect, useRef, useState } from 'react';

interface UseDataPersistenceOptions {
  /**
   * Time in milliseconds to wait before refetching data when tab becomes visible
   * Default: 5 minutes (300000ms)
   */
  refetchDelay?: number;
  
  /**
   * Whether to enable automatic refetching on tab visibility change
   * Default: true
   */
  enableAutoRefetch?: boolean;
  
  /**
   * Whether to enable automatic refetching on window focus
   * Default: true
   */
  enableFocusRefetch?: boolean;
}

/**
 * Custom hook that provides data persistence and automatic refetching
 * when switching tabs or returning to the app
 */
export const useDataPersistence = (options: UseDataPersistenceOptions = {}) => {
  const {
    refetchDelay = 5 * 60 * 1000, // 5 minutes
    enableAutoRefetch = true,
    enableFocusRefetch = true
  } = options;

  const [hasLoaded, setHasLoaded] = useState(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);
  const refetchCallbackRef = useRef<(() => void) | null>(null);

  // Set the refetch callback that will be called when needed
  const setRefetchCallback = (callback: () => void) => {
    refetchCallbackRef.current = callback;
  };

  // Mark data as loaded
  const markAsLoaded = () => {
    setHasLoaded(true);
    lastFetchRef.current = Date.now();
  };

  // Check if we should refetch data
  const shouldRefetch = (force = false): boolean => {
    if (force) return true;
    
    const timeSinceLastFetch = Date.now() - lastFetchRef.current;
    return timeSinceLastFetch > refetchDelay;
  };

  // Trigger a refetch if conditions are met
  const triggerRefetch = (force = false) => {
    if (shouldRefetch(force) && refetchCallbackRef.current) {
      console.log('Triggering data refetch...');
      refetchCallbackRef.current();
    }
  };

  // Handle visibility changes
  useEffect(() => {
    if (!enableAutoRefetch) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Add a small delay to allow connection to stabilize
        setTimeout(() => {
          triggerRefetch();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableAutoRefetch]);

  // Handle window focus
  useEffect(() => {
    if (!enableFocusRefetch) return;

    const handleFocus = () => {
      // Add a small delay to allow connection to stabilize
      setTimeout(() => {
        triggerRefetch();
      }, 500);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enableFocusRefetch]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    hasLoaded,
    mountedRef,
    lastFetchRef,
    setRefetchCallback,
    markAsLoaded,
    shouldRefetch,
    triggerRefetch
  };
};
