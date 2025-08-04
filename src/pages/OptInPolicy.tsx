
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const OptInPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-400 hover:text-yellow-500"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Content Card */}
        <div className="bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-yellow-500/50">
          <h1 className="text-3xl font-bold text-white mb-6">Crallux SMS Opt-In Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500 font-semibold">Effective Date:</span>
              <span className="text-white">August 1, 2025</span>
            </div>

            <div>
              <p className="mb-4">
                By providing your phone number, you consent to receive SMS messages from Crallux for purposes including, but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order confirmations and updates</li>
                <li>Support and customer service communications</li>
                <li>Promotions, special offers, and announcements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Your Privacy</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your phone number will never be shared or sold to third parties.</li>
                <li>All messages will be sent via secure and compliant messaging systems.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Opt-Out Instructions</h2>
              <p>
                You may opt out at any time by replying <strong className="text-yellow-500">STOP</strong> to any SMS message from us. 
                Message and data rates may apply depending on your carrier.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Support</h2>
              <p>
                If you have questions about this policy or our communications, please contact us at{' '}
                <a 
                  href="mailto:cralluxmaster@protonmail.com" 
                  className="text-yellow-500 hover:text-yellow-400 underline"
                >
                  cralluxmaster@protonmail.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptInPolicy; 