import { useEffect, useState } from 'react';

export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      // Store referral code in localStorage
      localStorage.setItem('referral_code', refParam);
      setReferralCode(refParam);
    } else {
      // Check localStorage for existing referral code
      const storedCode = localStorage.getItem('referral_code');
      if (storedCode) {
        setReferralCode(storedCode);
      }
    }
  }, []);

  const getReferralCode = (): string | null => {
    return localStorage.getItem('referral_code');
  };

  const clearReferralCode = (): void => {
    localStorage.removeItem('referral_code');
    setReferralCode(null);
  };

  const setReferralCodeFromUrl = (code: string): void => {
    localStorage.setItem('referral_code', code);
    setReferralCode(code);
  };

  return {
    referralCode,
    getReferralCode,
    clearReferralCode,
    setReferralCodeFromUrl
  };
};