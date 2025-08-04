import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReferralCode } from '@/hooks/useReferralCode';

const ReferralRedirect = () => {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();
  const { setReferralCodeFromUrl } = useReferralCode();

  useEffect(() => {
    if (referralCode) {
      // Store the referral code
      setReferralCodeFromUrl(referralCode);
      
      // Redirect to home page
      navigate('/', { replace: true });
    } else {
      // No referral code, just redirect to home
      navigate('/', { replace: true });
    }
  }, [referralCode, navigate, setReferralCodeFromUrl]);

  return (
    <div className="min-h-screen page-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Setting up your referral...</p>
      </div>
    </div>
  );
};

export default ReferralRedirect; 