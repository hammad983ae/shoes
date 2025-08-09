
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CATEGORIES = [
  'Shoes', 'Shirts', 'Hoodies', 'Jackets', 'Pants', 'Jeans', 
  'Sweatpants', 'Shorts', 'Sweaters/Knits', 'Hats', 'Accessories', 'Socks'
];

interface RequestItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestItemModal = ({ isOpen, onClose }: RequestItemModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    brand: '',
    category: '',
    reference_url: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    
    if (formData.reference_url && !isValidUrl(formData.reference_url)) {
      newErrors.reference_url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to request items');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use type assertion since the table exists but isn't in generated types yet
      const { error } = await (supabase as any)
        .from('item_requests')
        .insert({
          user_id: user.id,
          item_name: formData.item_name.trim(),
          brand: formData.brand.trim() || null,
          category: formData.category || null,
          reference_url: formData.reference_url.trim() || null,
          notes: formData.notes.trim() || null,
        });

      if (error) {
        console.error('Error submitting request:', error);
        toast.error('Failed to submit request. Please try again.');
        return;
      }

      toast.success('Request submitted successfully! We\'ll review it soon.');
      
      // Reset form
      setFormData({
        item_name: '',
        brand: '',
        category: '',
        reference_url: '',
        notes: ''
      });
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Request New Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => handleInputChange('item_name', e.target.value)}
              placeholder="e.g., Nike Air Force 1 Low White"
              className={errors.item_name ? 'border-red-500' : ''}
            />
            {errors.item_name && (
              <p className="text-sm text-red-500 mt-1">{errors.item_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Nike, Jordan, Stone Island"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent side="top" className="z-[9999]">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference_url">Reference URL</Label>
            <Input
              id="reference_url"
              value={formData.reference_url}
              onChange={(e) => handleInputChange('reference_url', e.target.value)}
              placeholder="https://..."
              className={errors.reference_url ? 'border-red-500' : ''}
            />
            {errors.reference_url && (
              <p className="text-sm text-red-500 mt-1">{errors.reference_url}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional details, size preferences, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestItemModal;
