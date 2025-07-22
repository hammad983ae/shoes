import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check URL params for referral code
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store in localStorage so it persists during signup flow
      localStorage.setItem('pendingReferralCode', refCode);
      setReferralCode(refCode);
    } else {
      // Check if we have a stored referral code
      const storedCode = localStorage.getItem('pendingReferralCode');
      if (storedCode) {
        setReferralCode(storedCode);
      }
    }
  }, [location]);

  const clearReferralCode = () => {
    localStorage.removeItem('pendingReferralCode');
    setReferralCode(null);
  };

  return {
    referralCode,
    clearReferralCode
  };
};