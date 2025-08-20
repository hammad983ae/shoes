import { supabase } from '@/integrations/supabase/client';

// 🔧 SESSION RECOVERY UTILITY
// Handles tab switching session loss with diagnostics and mutex protection

let isRecovering = false;
let lastRecoveryAttempt = 0;
const RECOVERY_DEBOUNCE = 2000; // 2 seconds

export const recoverSessionIfNeeded = async (): Promise<void> => {
  // 🛡️ Prevent overlapping recovery attempts
  if (isRecovering) {
    console.log("🔄 Session recovery already in progress, skipping...");
    return;
  }

  const now = Date.now();
  if (now - lastRecoveryAttempt < RECOVERY_DEBOUNCE) {
    console.log("🔄 Session recovery debounced, skipping...");
    return;
  }

  isRecovering = true;
  lastRecoveryAttempt = now;

  try {
    console.log("🔍 [SessionRecovery] Checking session status...");
    
    // 📊 DIAGNOSTICS: Check what's in localStorage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    );
    console.log("🔑 Auth keys in localStorage:", authKeys);
    
    // Check if localStorage is accessible
    try {
      localStorage.setItem('test-storage', 'test');
      localStorage.removeItem('test-storage');
    } catch (e) {
      console.warn("⚠️ localStorage is blocked — session persistence will fail");
      return;
    }

    // 🔍 Get current session from Supabase
    const { data, error } = await supabase.auth.getSession();
    const currentSession = data?.session;

    if (currentSession) {
      console.log("✅ [SessionRecovery] Session found - no recovery needed");
      console.log(`📦 Session expires in: ${Math.floor((currentSession.expires_at! * 1000 - Date.now()) / 60000)} minutes`);
      return;
    }

    if (error) {
      console.error("❌ [SessionRecovery] Error getting session:", error);
    } else {
      console.warn("⚠️ [SessionRecovery] Session is null");
    }

    // 🔍 Check if we have auth tokens in localStorage (indicating we should have a session)
    const hasAuthTokens = authKeys.some(key => 
      key.includes('access_token') || 
      key.includes('refresh_token') ||
      localStorage.getItem(key)?.includes('access_token')
    );

    if (hasAuthTokens) {
      console.log("🔄 [SessionRecovery] Auth tokens found in localStorage - forcing refresh...");
      
      // 🚀 Force manual refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("❌ [SessionRecovery] Refresh failed:", refreshError);
        console.log("🧹 Clearing potentially corrupted auth data...");
        
        // Clear corrupted auth data
        authKeys.forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } else if (refreshData.session) {
        console.log("✅ [SessionRecovery] Session refreshed successfully!");
        console.log(`📦 New session expires in: ${Math.floor((refreshData.session.expires_at! * 1000 - Date.now()) / 60000)} minutes`);
      } else {
        console.warn("⚠️ [SessionRecovery] Refresh returned no session");
      }
    } else {
      console.log("ℹ️ [SessionRecovery] No auth tokens found - user likely not logged in");
    }

  } catch (error) {
    console.error("💥 [SessionRecovery] Recovery failed:", error);
  } finally {
    isRecovering = false;
  }
};

// 🎯 EVENT HANDLERS
export const setupSessionRecovery = (): (() => void) => {
  console.log("🔧 [SessionRecovery] Setting up session recovery listeners...");

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log("👁️ [SessionRecovery] Tab became visible - checking session...");
      recoverSessionIfNeeded();
    }
  };

  const handleFocus = () => {
    console.log("🎯 [SessionRecovery] Window focused - checking session...");
    recoverSessionIfNeeded();
  };

  // 📡 Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  // 🧹 Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
    console.log("🧹 [SessionRecovery] Event listeners cleaned up");
  };
};