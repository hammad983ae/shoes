import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChartModal = ({ isOpen, onClose }: SizeChartModalProps) => {
  const sizeData = [
    { usMens: '5', usWomens: '7', eu: '37' },
    { usMens: '6', usWomens: '8', eu: '39' },
    { usMens: '7', usWomens: '9', eu: '40' },
    { usMens: '8', usWomens: '10', eu: '41' },
    { usMens: '9', usWomens: '11', eu: '42' },
    { usMens: '10', usWomens: '12', eu: '43' },
    { usMens: '11', usWomens: '13', eu: '44' },
    { usMens: '12', usWomens: '14', eu: '45' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Size Conversion Chart</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">US Men's</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">US Women's</th>
                  <th className="px-6 py-4 text-left font-semibold text-primary">EU Size</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((size, index) => (
                  <tr 
                    key={size.eu} 
                    className={`border-t border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    }`}
                  >
                    <td className="px-6 py-4 text-muted-foreground font-medium">{size.usMens}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{size.usWomens}</td>
                    <td className="px-6 py-4 text-primary font-bold text-lg">{size.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Note:</strong> All our products are sized in EU. 
              Use this chart to find your EU size based on your US size.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline" className="min-w-24">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChartModal;