import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function EditCredentials() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSave = () => {
    setError('');
    if (!email || !currentPassword) {
      setError('Email and current password are required.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    // TODO: Add Supabase update logic here
    // On success:
    navigate('/edit-profile');
  };

  return (
    <div className="min-h-screen page-gradient flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-yellow-500/50 relative">
        {/* Top Bar */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/edit-profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="flex-1 text-center font-bold text-lg text-white">Edit Credentials</span>
        </div>
        {/* Email */}
        <div className="mb-4">
          <Label htmlFor="email" className="text-gray-300 mb-2 block">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter your email"
          />
        </div>
        {/* Current Password */}
        <div className="mb-4">
          <Label htmlFor="currentPassword" className="text-gray-300 mb-2 block">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="pr-10 bg-gray-800 border-gray-700 text-white"
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {/* New Password */}
        <div className="mb-4">
          <Label htmlFor="newPassword" className="text-gray-300 mb-2 block">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="pr-10 bg-gray-800 border-gray-700 text-white"
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {/* Confirm New Password */}
        <div className="mb-6">
          <Label htmlFor="confirmPassword" className="text-gray-300 mb-2 block">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="pr-10 bg-gray-800 border-gray-700 text-white"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl btn-hover-glow" onClick={handleSave}>
          Save Credentials
        </Button>
      </div>
    </div>
  );
} 