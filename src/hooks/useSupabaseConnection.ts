import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedSupabase, connectionManager } from '../integrations/supabase/client';

interface UseSupabaseConnectionOptions {
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableConnectionMonitoring?: boolean;
}

/**
 * Enhanced hook for Supabase operations with automatic connection management
 * and retry logic
 */
// Connection status hook
export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    const unsubscribe = connectionManager.onConnectionChange(setIsConnected);
    return unsubscribe;
  }, []);
  
  return isConnected;
};

export const useSupabaseConnection = (options: UseSupabaseConnectionOptions = {}) => {
  const {
    enableAutoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableConnectionMonitoring = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);
  
  const isConnected = useConnectionStatus();
  const operationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced query function with automatic retry and connection management
  const enhancedQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    customOptions?: {
      maxRetries?: number;
      retryDelay?: number;
      timeout?: number;
    }
  ): Promise<{ data: T | null; error: any }> {
    if (!mountedRef.current) {
      return { data: null, error: new Error('Component unmounted') };
    }

    const finalMaxRetries = customOptions?.maxRetries ?? maxRetries;
    const finalRetryDelay = customOptions?.retryDelay ?? retryDelay;
    const timeout = customOptions?.timeout ?? 30000; // 30 second default timeout

    setIsLoading(true);
    setError(null);

    try {
      // Check connection health first
      if (!connectionManager.isConnectionHealthy()) {
        console.log('Connection unhealthy, attempting reconnection...');
        await connectionManager.forceReconnect();
        
        // Wait for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Set operation timeout
      const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) => {
        operationTimeoutRef.current = setTimeout(() => {
          reject(new Error('Operation timeout'));
        }, timeout);
      });

      // Execute query with retry logic
      const queryPromise = enhancedSupabase.queryWithRetry(
        queryFn,
        finalMaxRetries,
        finalRetryDelay
      );

      // Race between timeout and query
      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
        operationTimeoutRef.current = null;
      }

      if (result.error) {
        setError(result.error);
        console.error('Query failed:', result.error);
      } else {
        setLastOperationTime(Date.now());
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Query execution error:', error);
      return { data: null, error };
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [maxRetries, retryDelay]);

  // Enhanced auth operations
  const enhancedAuth = {
    signIn: async (email: string, password: string) => {
      return enhancedQuery(() => enhancedSupabase.auth.signInWithPassword({ email, password }));
    },
    
    signUp: async (email: string, password: string, options?: any) => {
      return enhancedQuery(() => enhancedSupabase.auth.signUp({ email, password, ...options }));
    },
    
    signOut: async () => {
      return enhancedQuery(() => enhancedSupabase.auth.signOut());
    },
    
    resetPassword: async (email: string, options?: any) => {
      return enhancedQuery(() => enhancedSupabase.auth.resetPasswordForEmail(email, options));
    },
    
    updateUser: async (attributes: any) => {
      return enhancedQuery(() => enhancedSupabase.auth.updateUser(attributes));
    },
    
    refreshSession: async () => {
      return enhancedQuery(() => enhancedSupabase.auth.refreshSession());
    },
    
    getSession: async () => {
      return enhancedQuery(() => enhancedSupabase.auth.getSession());
    },
    
    getUser: async () => {
      return enhancedQuery(() => enhancedSupabase.auth.getUser());
    }
  };

  // Enhanced database operations
  const enhancedDb = {
    from: (table: string) => {
      const originalFrom = enhancedSupabase.from(table);
      
      return {
        ...originalFrom,
        select: (...args: any[]) => {
          return enhancedQuery(() => originalFrom.select(...args));
        },
        insert: (...args: any[]) => {
          return enhancedQuery(() => originalFrom.insert(...args));
        },
        update: (...args: any[]) => {
          return enhancedQuery(() => originalFrom.update(...args));
        },
        delete: (...args: any[]) => {
          return enhancedQuery(() => originalFrom.delete(...args));
        },
        upsert: (...args: any[]) => {
          return enhancedQuery(() => originalFrom.upsert(...args));
        }
      };
    },
    
    rpc: (func: string, params?: any) => {
      return enhancedQuery(() => enhancedSupabase.rpc(func, params));
    },
    
    storage: enhancedSupabase.storage,
    
    functions: enhancedSupabase.functions
  };

  // Connection management utilities
  const connectionUtils = {
    forceReconnect: async () => {
      setIsLoading(true);
      try {
        await connectionManager.forceReconnect();
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    
    checkConnection: async () => {
      return enhancedQuery(() => enhancedSupabase.auth.getSession());
    },
    
    isConnected,
    
    getConnectionStatus: () => ({
      isConnected,
      isLoading,
      error,
      lastOperationTime
    })
  };

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!enableConnectionMonitoring) return;

    const handleConnectionLoss = () => {
      if (!isConnected && !isLoading) {
        console.log('Connection lost, attempting automatic reconnection...');
        connectionUtils.forceReconnect();
      }
    };

    if (!isConnected) {
      handleConnectionLoss();
    }
  }, [isConnected, isLoading, enableConnectionMonitoring]);

  return {
    // Enhanced operations
    enhancedQuery,
    enhancedAuth,
    enhancedDb,
    
    // Connection utilities
    connectionUtils,
    
    // State
    isLoading,
    error,
    isConnected,
    lastOperationTime,
    
    // Clear error
    clearError: () => setError(null)
  };
};

/**
 * Hook to monitor connection status and provide reconnection utilities
 */
export const useConnectionMonitor = () => {
  const isConnected = useConnectionStatus();
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: number;
    status: boolean;
    event: string;
  }>>([]);

  useEffect(() => {
    const addConnectionEvent = (status: boolean, event: string) => {
      setConnectionHistory(prev => [
        ...prev.slice(-9), // Keep last 10 events
        { timestamp: Date.now(), status, event }
      ]);
    };

    const unsubscribe = connectionManager.onConnectionChange((connected) => {
      addConnectionEvent(connected, connected ? 'reconnected' : 'disconnected');
    });

    return unsubscribe;
  }, []);

  const forceReconnect = useCallback(async () => {
    try {
      await connectionManager.forceReconnect();
      return true;
    } catch (error) {
      console.error('Force reconnection failed:', error);
      return false;
    }
  }, []);

  return {
    isConnected,
    connectionHistory,
    forceReconnect,
    connectionManager
  };
};
