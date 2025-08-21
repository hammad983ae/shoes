import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveData, loadData } from '@/utils/dataPersistence';

// Hook to handle app state recovery when switching tabs or navigating away
export const useAppStateRecovery = () => {
  const { user, profile } = useAuth();
  const isRecovering = useRef(false);
  const lastActiveTime = useRef(Date.now());

  // Save current app state periodically and on visibility change
  useEffect(() => {
    const saveAppState = () => {
      if (!user) return;
      
      const appState = {
        userId: user.id,
        lastActive: Date.now(),
        userEmail: user.email,
        profile: profile,
        // Add any other critical state you want to persist
      };
      
      saveData(`app-state-${user.id}`, appState);
    };

    // Save state every 30 seconds
    const intervalId = setInterval(saveAppState, 30000);

    // Save state on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to the app
        lastActiveTime.current = Date.now();
        saveAppState();
      } else {
        // User left the app
        saveAppState();
      }
    };

    // Save state on page focus/blur
    const handleFocus = () => {
      lastActiveTime.current = Date.now();
      saveAppState();
    };

    const handleBlur = () => {
      saveAppState();
    };

    // Save state on page unload
    const handleBeforeUnload = () => {
      saveAppState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial save
    saveAppState();

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, profile]);

  // Recover app state when user returns
  useEffect(() => {
    if (!user || isRecovering.current) return;

    const recoverAppState = async () => {
      try {
        const savedState = loadData(`app-state-${user.id}`);
        if (savedState && savedState.userId === user.id) {
          // Check if the saved state is recent (within last 5 minutes)
          const timeDiff = Date.now() - savedState.lastActive;
          if (timeDiff < 5 * 60 * 1000) {
            console.log('Recovering app state from:', new Date(savedState.lastActive).toLocaleString());
            isRecovering.current = true;
            
            // Here you can add logic to restore any specific app state
            // For example, restore scroll position, form data, etc.
            
            // Mark as recovered
            setTimeout(() => {
              isRecovering.current = false;
            }, 1000);
          }
        }
      } catch (error) {
        console.warn('Failed to recover app state:', error);
      }
    };

    // Recover on mount and when user changes
    recoverAppState();

    // Also recover when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        recoverAppState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Return recovery status
  return {
    isRecovering: isRecovering.current,
    lastActiveTime: lastActiveTime.current,
  };
};
