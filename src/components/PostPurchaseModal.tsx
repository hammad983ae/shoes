import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Gift, ShoppingBag, Star, Plus } from 'lucide-react';

interface PostPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchasedItems: any[];
}

const PostPurchaseModal = ({ isOpen, onClose, purchasedItems }: PostPurchaseModalProps) => {
  const { addItem } = useCart();
  
  // Mock related products and add-ons
  const relatedProducts = [
    {
      id: 'related-1',
      name: 'Premium Shoe Care Kit',
      price: 29.99,
      image: '/src/assets/sneaker-1.jpg',
      type: 'addon'
    },
    {
      id: 'related-2', 
      name: 'Sneaker Storage Box',
      price: 19.99,
      image: '/src/assets/sneaker-2.jpg',
      type: 'addon'
    },
    {
      id: 'related-3',
      name: 'Similar Style Sneaker',
      price: 159.99,
      image: '/src/assets/sneaker-3.jpg',
      type: 'related'
    }
  ];

  const [creditsEarned] = useState(Math.floor(Math.random() * 50) + 10);

  const handleAddProduct = (product: any) => {
    addItem({
      id: parseInt(product.id.replace('related-', '')),
      name: product.name,
      price: `$${product.price}`,
      image: product.image,
      size: '9',
      size_type: 'US'
    });
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Thank You for Your Purchase! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Your Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchasedItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.name} (Size {item.selectedSize})</span>
                    <span className="font-semibold">${item.price}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Credits Earned */}
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">
                  You earned {creditsEarned} credits!
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use credits on your next purchase or share posts to earn more
              </p>
            </CardContent>
          </Card>

          {/* Related Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Complete Your Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProducts.map((product) => (
                <Card key={product.id} className="relative">
                  <CardContent className="p-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-primary">${product.price}</span>
                      <Badge variant={product.type === 'addon' ? 'secondary' : 'outline'}>
                        {product.type === 'addon' ? 'Add-on' : 'Related'}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleAddProduct(product)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                  {product.type === 'addon' && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">20% OFF</Badge>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Special Offer */}
          <Card className="border-primary">
            <CardContent className="text-center py-6">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                Add Another Item & Get 15% Off!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This exclusive offer expires in 10 minutes
              </p>
              <Button variant="outline">
                Browse More Sneakers
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={handleContinueShopping} className="flex-1">
              Continue Shopping
            </Button>
            <Button onClick={onClose} className="flex-1">
              View My Orders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPurchaseModal;