import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateSession } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSessionGuardOptions {
  retryAttempts?: number;
  retryDelay?: number;
  showToast?: boolean;
}

export const useSessionGuard = (options: UseSessionGuardOptions = {}) => {
  const { 
    retryAttempts = 3, 
    retryDelay = 1000, 
    showToast = true 
  } = options;
  
  const { session, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 🛡️ SESSION VALIDATION WITH RETRY LOGIC
  const guardedValidation = async (): Promise<boolean> => {
    if (!session || loading) return false;
    
    setIsValidating(true);
    
    try {
      const isValid = await validateSession();
      
      if (!isValid && retryCount < retryAttempts) {
        console.warn(`⚠️ Session invalid, retry ${retryCount + 1}/${retryAttempts}`);
        setRetryCount(prev => prev + 1);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        await refreshSession();
        
        return guardedValidation();
      }
      
      if (!isValid && showToast) {
        toast({
          title: "Session Issue",
          description: "Your session may have expired. Please refresh the page.",
          variant: "destructive"
        });
      }
      
      setRetryCount(0);
      return isValid;
    } catch (error) {
      console.error("💥 Session guard validation failed:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isSessionValid: !!session && !loading,
    isValidating,
    guardedValidation,
    retryCount
  };
};