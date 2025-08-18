import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  description?: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  limited: boolean;
  infinite_stock: boolean;
  size_type: string;
  availability: string;
  media?: Array<{
    id: string;
    url: string;
    role: string;
  }>;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: () => void;
}

export function EditProductModal({ isOpen, onClose, product, onUpdate }: EditProductModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: '',
    price: 0,
    stock: 0,
    limited: false,
    infinite_stock: false,
    size_type: 'US',
    availability: 'In Stock'
  });
  
  const [images, setImages] = useState<Array<{ file?: File; url: string; role: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        title: product.title,
        description: product.description || '',
        brand: product.brand,
        category: product.category,
        price: product.price,
        stock: product.stock,
        limited: product.limited,
        infinite_stock: product.infinite_stock || false,
        size_type: product.size_type,
        availability: product.infinite_stock ? 'In Stock' : product.availability
      });
      setImages(product.media?.map(media => ({
        url: media.url,
        role: media.role
      })) || []);
    }
  }, [product, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, url, role: 'gallery' }]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!product || !formData.title || !formData.price || !formData.brand) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          brand: formData.brand,
          category: formData.category,
          price: formData.price,
          stock: formData.stock,
          limited: formData.limited,
          infinite_stock: formData.infinite_stock,
          size_type: formData.size_type,
          availability: formData.infinite_stock ? 'In Stock' : formData.availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (productError) throw productError;

      // Handle new image uploads
      const newImages = images.filter(img => img.file);
      if (newImages.length > 0) {
        for (const image of newImages) {
          if (image.file) {
            const fileExt = image.file.name.split('.').pop();
            const fileName = `${product.id}/${Date.now()}.${fileExt}`;
            
            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, image.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('products')
              .getPublicUrl(fileName);

            // Add to product_media table
            const { error: mediaError } = await supabase
              .from('product_media')
              .insert({
                product_id: product.id,
                url: publicUrl,
                role: image.role
              });

            if (mediaError) throw mediaError;
          }
        }
      }

      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information and settings
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Product name"
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                <SelectTrigger className="bg-background border shadow-sm">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100] max-h-60 overflow-y-auto">
                  <SelectItem value="Nike">Nike</SelectItem>
                  <SelectItem value="Jordan">Jordan</SelectItem>
                  <SelectItem value="Adidas">Adidas</SelectItem>
                  <SelectItem value="Rick Owens">Rick Owens</SelectItem>
                  <SelectItem value="Maison Margiela">Maison Margiela</SelectItem>
                  <SelectItem value="Travis Scott">Travis Scott</SelectItem>
                  <SelectItem value="Yeezy">Yeezy</SelectItem>
                  <SelectItem value="New Balance">New Balance</SelectItem>
                  <SelectItem value="Converse">Converse</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="bg-background border shadow-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100] max-h-60 overflow-y-auto">
                  <SelectItem value="High-Top">High-Top</SelectItem>
                  <SelectItem value="Low-Top">Low-Top</SelectItem>
                  <SelectItem value="Mid-Top">Mid-Top</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Running">Running</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Limited Edition">Limited Edition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Product description"
              rows={3}
            />
          </div>

          {/* Stock & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={formData.infinite_stock}
              />
            </div>
            <div>
              <Label htmlFor="size_type">Size Type</Label>
              <Select value={formData.size_type} onValueChange={(value) => handleInputChange('size_type', value)}>
                <SelectTrigger className="bg-background border shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100]">
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select 
                value={formData.availability} 
                onValueChange={(value) => handleInputChange('availability', value)}
                disabled={formData.infinite_stock}
              >
                <SelectTrigger className="bg-background border shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100]">
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                  <SelectItem value="Very Limited">Very Limited</SelectItem>
                  <SelectItem value="Extremely Limited">Extremely Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="limited"
                checked={formData.limited}
                onCheckedChange={(checked) => handleInputChange('limited', checked)}
              />
              <Label htmlFor="limited">Limited Edition</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="infinite_stock"
                checked={formData.infinite_stock}
                onCheckedChange={(checked) => handleInputChange('infinite_stock', checked)}
              />
              <Label htmlFor="infinite_stock">Infinite Stock</Label>
            </div>
          </div>

          {/* Image Management */}
          <div>
            <Label>Product Images</Label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}