import { SupabaseClient } from '@supabase/supabase-js';

export class SessionRecoveryManager {
  private supabase: SupabaseClient;
  private isRecovering = false;
  private recoveryAttempts = 0;
  private maxRetries = 3;
  private recoveryDebounceMs = 1000;
  private lastRecoveryAttempt = 0;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [SessionRecovery] Tab became visible - checking session...');
        this.attemptSessionRecovery();
      }
    });

    // Listen for window focus events
    window.addEventListener('focus', () => {
      console.log('🎯 [SessionRecovery] Window focused - checking session...');
      this.attemptSessionRecovery();
    });

    // Listen for page show events (back/forward navigation)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('📄 [SessionRecovery] Page restored from cache - checking session...');
        this.attemptSessionRecovery();
      }
    });
  }

  public async attemptSessionRecovery(): Promise<boolean> {
    const now = Date.now();
    
    // Debounce recovery attempts
    if (now - this.lastRecoveryAttempt < this.recoveryDebounceMs) {
      console.log('🔄 Session recovery already in progress, skipping...');
      return false;
    }

    if (this.isRecovering) {
      console.log('🔄 Session recovery already in progress, skipping...');
      return false;
    }

    this.lastRecoveryAttempt = now;
    this.isRecovering = true;

    try {
      console.log('🔍 [SessionRecovery] Checking session status...');
      
      // Check current session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [SessionRecovery] Error getting session:', error);
        return false;
      }

      // Log auth keys in localStorage for debugging
      const authKeys = this.getLocalStorageAuthKeys();
      console.log('🔑 Auth keys in localStorage:', authKeys);

      if (session) {
        console.log('✅ [SessionRecovery] Session found and valid');
        this.recoveryAttempts = 0;
        return true;
      }

      // Session is null, check if we have auth tokens in localStorage
      const hasAuthData = this.hasLocalStorageAuthData();
      
      if (!hasAuthData) {
        console.log('🚫 [SessionRecovery] No session and no auth data in localStorage');
        return false;
      }

      console.log('🔧 [SessionRecovery] Session missing but auth data exists, attempting refresh...');
      
      // Attempt to refresh the session
      const refreshResult = await this.forceSessionRefresh();
      
      if (refreshResult) {
        console.log('✅ [SessionRecovery] Session recovered successfully');
        this.recoveryAttempts = 0;
        return true;
      } else {
        this.recoveryAttempts++;
        console.log(`❌ [SessionRecovery] Recovery failed (attempt ${this.recoveryAttempts}/${this.maxRetries})`);
        
        if (this.recoveryAttempts >= this.maxRetries) {
          console.log('🧹 [SessionRecovery] Max retries reached, clearing corrupted auth data');
          await this.clearCorruptedSession();
        }
        
        return false;
      }

    } catch (error) {
      console.error('💥 [SessionRecovery] Unexpected error during recovery:', error);
      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  private async forceSessionRefresh(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ [SessionRecovery] Refresh failed:', error.message);
        return false;
      }

      if (data.session) {
        console.log('✅ [SessionRecovery] Session refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('💥 [SessionRecovery] Refresh error:', error);
      return false;
    }
  }

  private hasLocalStorageAuthData(): boolean {
    try {
      const keys = this.getLocalStorageAuthKeys();
      return keys.length > 0;
    } catch (error) {
      console.warn('⚠️ localStorage is blocked — session persistence will fail');
      return false;
    }
  }

  private getLocalStorageAuthKeys(): string[] {
    try {
      const authKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          authKeys.push(key);
        }
      }
      return authKeys;
    } catch (error) {
      console.warn('⚠️ localStorage access failed:', error);
      return [];
    }
  }

  private async clearCorruptedSession(): Promise<void> {
    try {
      // Clear Supabase session
      await this.supabase.auth.signOut();
      
      // Clear localStorage auth data
      const authKeys = this.getLocalStorageAuthKeys();
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error);
        }
      });
      
      console.log('🧹 [SessionRecovery] Corrupted session data cleared');
    } catch (error) {
      console.error('❌ [SessionRecovery] Failed to clear session:', error);
    }
  }

  public async diagnoseSessionIssues(): Promise<{
    hasSession: boolean;
    sessionExpiry?: number;
    authKeysInStorage: string[];
    userAgent: string;
    isLocalStorageBlocked: boolean;
    lastRecoveryAttempt: number;
    recoveryAttempts: number;
  }> {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    let authKeys: string[] = [];
    let isLocalStorageBlocked = false;
    
    try {
      authKeys = this.getLocalStorageAuthKeys();
    } catch (error) {
      isLocalStorageBlocked = true;
    }

    return {
      hasSession: !!session,
      sessionExpiry: session?.expires_at,
      authKeysInStorage: authKeys,
      userAgent: navigator.userAgent,
      isLocalStorageBlocked,
      lastRecoveryAttempt: this.lastRecoveryAttempt,
      recoveryAttempts: this.recoveryAttempts,
    };
  }

  public destroy() {
    // Remove event listeners when needed
    document.removeEventListener('visibilitychange', this.attemptSessionRecovery);
    window.removeEventListener('focus', this.attemptSessionRecovery);
    window.removeEventListener('pageshow', this.attemptSessionRecovery);
  }
}