import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface CartAnimationProps {
  isAnimating: boolean;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const CartAnimation = ({ isAnimating, startPosition, endPosition, onComplete }: CartAnimationProps) => {
  if (!isAnimating) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      initial={{ 
        x: startPosition.x, 
        y: startPosition.y, 
        scale: 1, 
        opacity: 1 
      }}
      animate={{ 
        x: endPosition.x, 
        y: endPosition.y, 
        scale: 0.5, 
        opacity: 0.8 
      }}
      transition={{ 
        duration: 0.6, 
        ease: "easeInOut" 
      }}
      onAnimationComplete={onComplete}
    >
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
        <ShoppingCart className="w-6 h-6 text-primary-foreground" />
      </div>
    </motion.div>
  );
};

export default CartAnimation;