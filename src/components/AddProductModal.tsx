import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AddProductModal({ isOpen, onClose, onUpdate }: AddProductModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: '',
    color: '',
    price: 0,
    slashed_price: 0,
    stock: 0,
    limited: false,
    infinite_stock: false,
    size_type: 'US',
    availability: 'In Stock'
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [images, setImages] = useState<Array<{ file?: File; url: string; role: string; display_order?: number }>>([]);
  const [loading, setLoading] = useState(false);

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'blockquote', 'code-block'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        brand: '',
        category: '',
        color: '',
        price: 0,
        slashed_price: 0,
        stock: 0,
        limited: false,
        infinite_stock: false,
        size_type: 'US',
        availability: 'In Stock'
      });
      setSelectedCategories([]);
      setSelectedColors([]);
      setImages([]);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    if (!selectedCategories.includes(category)) {
      const newCategories = [...selectedCategories, category];
      setSelectedCategories(newCategories);
      setFormData(prev => ({
        ...prev,
        category: newCategories.join(', ')
      }));
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    const newCategories = selectedCategories.filter(cat => cat !== categoryToRemove);
    setSelectedCategories(newCategories);
    setFormData(prev => ({
      ...prev,
      category: newCategories.join(', ')
    }));
  };

  const handleColorSelect = (color: string) => {
    if (!selectedColors.includes(color)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      setFormData(prev => ({
        ...prev,
        color: newColors.join(', ')
      }));
    }
  };

  const removeColor = (colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    setFormData(prev => ({
      ...prev,
      color: newColors.join(', ')
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update display_order and role for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index,
      role: index === 0 ? 'primary' : 'gallery' // First image becomes primary, others become gallery
    }));
    
    setImages(updatedItems);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.brand) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          description: formData.description,
          brand: formData.brand,
          category: formData.category,
          color: formData.color || null,
          price: formData.price,
          slashed_price: formData.slashed_price || null,
          stock: formData.stock,
          limited: formData.limited,
          infinite_stock: formData.infinite_stock,
          size_type: formData.size_type,
          availability: formData.infinite_stock ? 'In Stock' : formData.availability,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Handle image uploads
      if (images.length > 0) {
        for (const [index, image] of images.entries()) {
          if (image.file) {
            const fileExt = image.file.name.split('.').pop();
            const fileName = `${productData.id}/${Date.now()}-${index}.${fileExt}`;
            
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
                product_id: productData.id,
                url: publicUrl,
                role: index === 0 ? 'primary' : 'gallery',
                display_order: index
              });

            if (mediaError) throw mediaError;
          }
        }
      }

      toast({
        title: "Success",
        description: "Product created successfully"
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product with information and settings
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
                <SelectTrigger className="bg-gray-800 border border-gray-600 shadow-sm text-white">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[10001] max-h-60 overflow-y-auto">
                  <SelectItem value="Nike" className="text-white hover:bg-gray-700 focus:bg-gray-700">Nike</SelectItem>
                  <SelectItem value="Rick Owens" className="text-white hover:bg-gray-700 focus:bg-gray-700">Rick Owens</SelectItem>
                  <SelectItem value="Maison Margiela" className="text-white hover:bg-gray-700 focus:bg-gray-700">Maison Margiela</SelectItem>
                  <SelectItem value="Jordan" className="text-white hover:bg-gray-700 focus:bg-gray-700">Jordan</SelectItem>
                  <SelectItem value="Adidas" className="text-white hover:bg-gray-700 focus:bg-gray-700">Adidas</SelectItem>
                  <SelectItem value="Stone Island" className="text-white hover:bg-gray-700 focus:bg-gray-700">Stone Island</SelectItem>
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
              <Label htmlFor="slashed_price">Slashed Price ($)</Label>
              <Input
                id="slashed_price"
                type="number"
                step="0.01"
                value={formData.slashed_price}
                onChange={(e) => handleInputChange('slashed_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">Higher price to show crossed out</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categories</Label>
              <div className="space-y-2">
                <Select onValueChange={handleCategorySelect}>
                  <SelectTrigger className="bg-gray-800 border border-gray-600 shadow-sm text-white">
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[10001] max-h-60 overflow-y-auto">
                    <SelectItem value="Shoes" className="text-white hover:bg-gray-700 focus:bg-gray-700">Shoes</SelectItem>
                    <SelectItem value="Shirts" className="text-white hover:bg-gray-700 focus:bg-gray-700">Shirts</SelectItem>
                    <SelectItem value="Hoodies" className="text-white hover:bg-gray-700 focus:bg-gray-700">Hoodies</SelectItem>
                    <SelectItem value="Jackets" className="text-white hover:bg-gray-700 focus:bg-gray-700">Jackets</SelectItem>
                    <SelectItem value="Pants" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pants</SelectItem>
                    <SelectItem value="Jeans" className="text-white hover:bg-gray-700 focus:bg-gray-700">Jeans</SelectItem>
                    <SelectItem value="Sweatpants" className="text-white hover:bg-gray-700 focus:bg-gray-700">Sweatpants</SelectItem>
                    <SelectItem value="Shorts" className="text-white hover:bg-gray-700 focus:bg-gray-700">Shorts</SelectItem>
                    <SelectItem value="Sweaters/Knits" className="text-white hover:bg-gray-700 focus:bg-gray-700">Sweaters/Knits</SelectItem>
                    <SelectItem value="Hats" className="text-white hover:bg-gray-700 focus:bg-gray-700">Hats</SelectItem>
                    <SelectItem value="Accessories" className="text-white hover:bg-gray-700 focus:bg-gray-700">Accessories</SelectItem>
                    <SelectItem value="Socks" className="text-white hover:bg-gray-700 focus:bg-gray-700">Socks</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Selected Categories Tags */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded-md text-sm"
                      >
                        <span>{category}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="text-gray-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="color">Colors</Label>
              <div className="space-y-2">
                <Select onValueChange={handleColorSelect}>
                  <SelectTrigger className="bg-gray-800 border border-gray-600 shadow-sm text-white">
                    <SelectValue placeholder="Select colors" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[10001] max-h-60 overflow-y-auto">
                    <SelectItem value="Black" className="text-white hover:bg-gray-700 focus:bg-gray-700">Black</SelectItem>
                    <SelectItem value="White" className="text-white hover:bg-gray-700 focus:bg-gray-700">White</SelectItem>
                    <SelectItem value="Grey" className="text-white hover:bg-gray-700 focus:bg-gray-700">Grey</SelectItem>
                    <SelectItem value="Silver" className="text-white hover:bg-gray-700 focus:bg-gray-700">Silver</SelectItem>
                    <SelectItem value="Charcoal" className="text-white hover:bg-gray-700 focus:bg-gray-700">Charcoal</SelectItem>
                    <SelectItem value="Off-White/Cream" className="text-white hover:bg-gray-700 focus:bg-gray-700">Off-White/Cream</SelectItem>
                    <SelectItem value="Brown" className="text-white hover:bg-gray-700 focus:bg-gray-700">Brown</SelectItem>
                    <SelectItem value="Tan" className="text-white hover:bg-gray-700 focus:bg-gray-700">Tan</SelectItem>
                    <SelectItem value="Beige" className="text-white hover:bg-gray-700 focus:bg-gray-700">Beige</SelectItem>
                    <SelectItem value="Navy" className="text-white hover:bg-gray-700 focus:bg-gray-700">Navy</SelectItem>
                    <SelectItem value="Blue" className="text-white hover:bg-gray-700 focus:bg-gray-700">Blue</SelectItem>
                    <SelectItem value="Light Blue" className="text-white hover:bg-gray-700 focus:bg-gray-700">Light Blue</SelectItem>
                    <SelectItem value="Green" className="text-white hover:bg-gray-700 focus:bg-gray-700">Green</SelectItem>
                    <SelectItem value="Olive" className="text-white hover:bg-gray-700 focus:bg-gray-700">Olive</SelectItem>
                    <SelectItem value="Yellow" className="text-white hover:bg-gray-700 focus:bg-gray-700">Yellow</SelectItem>
                    <SelectItem value="Orange" className="text-white hover:bg-gray-700 focus:bg-gray-700">Orange</SelectItem>
                    <SelectItem value="Red" className="text-white hover:bg-gray-700 focus:bg-gray-700">Red</SelectItem>
                    <SelectItem value="Burgundy" className="text-white hover:bg-gray-700 focus:bg-gray-700">Burgundy</SelectItem>
                    <SelectItem value="Pink" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pink</SelectItem>
                    <SelectItem value="Purple" className="text-white hover:bg-gray-700 focus:bg-gray-700">Purple</SelectItem>
                    <SelectItem value="Gold" className="text-white hover:bg-gray-700 focus:bg-gray-700">Gold</SelectItem>
                    <SelectItem value="Multicolor/Pattern" className="text-white hover:bg-gray-700 focus:bg-gray-700">Multicolor/Pattern</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Selected Colors Tags */}
                {selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedColors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded-md text-sm"
                      >
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="text-gray-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Product Description</Label>
            <div className="mt-2">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter a detailed product description with rich formatting..."
                style={{ height: '120px', marginBottom: '50px' }}
              />
            </div>
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
                <SelectTrigger className="bg-gray-800 border border-gray-600 shadow-sm text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[10001]">
                  <SelectItem value="US" className="text-white hover:bg-gray-700 focus:bg-gray-700">US</SelectItem>
                  <SelectItem value="EU" className="text-white hover:bg-gray-700 focus:bg-gray-700">EU</SelectItem>
                  <SelectItem value="UK" className="text-white hover:bg-gray-700 focus:bg-gray-700">UK</SelectItem>
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
                <SelectTrigger className="bg-gray-800 border border-gray-600 shadow-sm text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[10001]">
                  <SelectItem value="In Stock" className="text-white hover:bg-gray-700 focus:bg-gray-700">In Stock</SelectItem>
                  <SelectItem value="Low Stock" className="text-white hover:bg-gray-700 focus:bg-gray-700">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock" className="text-white hover:bg-gray-700 focus:bg-gray-700">Out of Stock</SelectItem>
                  <SelectItem value="Pre-Order" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pre-Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Toggles */}
          <div className="flex flex-col sm:flex-row gap-4">
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

              {/* Image Preview with Drag and Drop */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag images to reorder them. First image will be the main product image.
                  </p>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {images.map((image, index) => (
                            <Draggable key={index} draggableId={`${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative group ${snapshot.isDragging ? 'z-50' : ''}`}
                                >
                                  <div className="relative">
                                    <img
                                      src={image.url}
                                      alt={`Product ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                    {index === 0 && (
                                      <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                        Main
                                      </div>
                                    )}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-3 w-3" />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                      onClick={() => removeImage(index)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
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
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}