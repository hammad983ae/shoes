import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralCode } from '@/hooks/useReferralCode';
import InteractiveParticles from '@/components/InteractiveParticles';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'login' | 'signup';
  fullPage?: boolean;
}

const getWelcomeText = () => {
  const seen = localStorage.getItem('hasVisited');
  if (!seen) {
    localStorage.setItem('hasVisited', 'true');
    return 'Welcome';
  }
  return 'Welcome back';
};

export default function AuthModal({ open, onOpenChange, mode = 'login', fullPage = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { referralCode, clearReferralCode } = useReferralCode();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) onOpenChange(false);
  }, [user, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const { error } = await signUp(email, password, displayName, referralCode || undefined);
        if (!error) {
          clearReferralCode(); // Clear the referral code after successful signup
        } else {
          setError(error.message);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };


  if (fullPage) {
    return (
      <div className="min-h-screen page-gradient relative w-full flex flex-col items-center justify-center">
        <InteractiveParticles isActive={true} />
        <div className="w-full max-w-md mx-auto z-10 px-4">
          <div className="py-6 px-8">
            {/* No welcome text in fullPage mode */}
          </div>
          {/* Remove the card background, render content directly on gradient */}
          <h2 className="text-xl font-bold text-yellow-400 text-center mb-2 mt-8">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-center text-yellow-200 mb-6">
            {isSignUp
              ? 'Create your account to save your cart and earn credits'
              : 'Sign in to your account to continue'}
          </p>
          {referralCode && isSignUp && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
              <p className="text-green-400 text-sm">
                🎉 You're signing up with a referral code! You'll get 10% off your first purchase.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-yellow-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/70 border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                  required
                />
              </div>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-yellow-300">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-black/70 border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-yellow-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/70 border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                  required
                />
              </div>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-yellow-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-black/70 border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                    required
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-300 border-0"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-yellow-200">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-white underline hover:text-yellow-200"
                type="button"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button className="text-sm text-white underline hover:text-yellow-200" type="button">
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden" hideClose>
        {/* X button in top-right if not fullPage */}
        {!fullPage && (
          <button
            className="absolute top-4 right-4 z-50 text-yellow-400 hover:text-yellow-300 text-2xl font-bold focus:outline-none"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        )}
        <DialogHeader className="py-6 px-8">
          {/* Only show welcome text in popup mode */}
          {!fullPage && (
            <DialogTitle className="text-2xl font-bold text-yellow-400 text-center">
              {getWelcomeText()}
            </DialogTitle>
          )}
        </DialogHeader>
        <div className="p-8 bg-[#0a0a0a]">
          <h2 className="text-xl font-bold text-yellow-400 text-center mb-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-center text-yellow-200 mb-6">
            {isSignUp
              ? 'Create your account to save your cart and earn credits'
              : 'Sign in to your account to continue'}
          </p>

          {referralCode && isSignUp && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
              <p className="text-green-400 text-sm">
                🎉 You're signing up with a referral code! You'll get 10% off your first purchase.
              </p>
            </div>
          )}

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-yellow-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-yellow-300">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-black border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-yellow-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-yellow-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-black border-yellow-400 text-yellow-100 placeholder-yellow-300 focus:border-yellow-400"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-300 border-0"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-yellow-200">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-white underline hover:text-yellow-200"
                type="button"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button className="text-sm text-white underline hover:text-yellow-200" type="button">
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 