import { Button } from "@/components/ui/button";
import { Check, Package, Truck, CheckCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusTrackerProps {
  currentStatus: string;
  onLeaveReview?: () => void;
  isReviewed?: boolean;
}

const statusSteps = [
  { id: 'paid', label: 'Paid', icon: Check },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
  { id: 'reviewed', label: 'Reviewed', icon: Star }
];

const statusOrder = ['paid', 'processing', 'shipped', 'delivered', 'reviewed'];

export function OrderStatusTracker({ currentStatus, onLeaveReview, isReviewed }: OrderStatusTrackerProps) {
  const getCurrentStepIndex = () => {
    const normalizedStatus = currentStatus.toLowerCase();
    if (normalizedStatus === 'pending') return 0; // Treat pending as paid
    return statusOrder.indexOf(normalizedStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Order Status</h4>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` 
            }}
          />
        </div>

        {/* Status steps */}
        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            // const isCurrent = index === currentStepIndex;
            const isReviewStep = step.id === 'reviewed';
            const showReviewButton = isReviewStep && currentStepIndex >= 3 && !isReviewed;
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-background border-muted-foreground/30"
                )}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  {showReviewButton && onLeaveReview && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={onLeaveReview}
                    >
                      Leave a Review
                    </Button>
                  )}
                  {isReviewStep && isReviewed && (
                    <div className="mt-2 text-green-600 text-sm flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      Complete
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}