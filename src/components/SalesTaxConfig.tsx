
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings } from 'lucide-react';

const SalesTaxConfig = () => {
  const [salesTax, setSalesTax] = useState(() => {
    return localStorage.getItem('salesTax') || '0';
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    localStorage.setItem('salesTax', salesTax);
    setIsOpen(false);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'salesTax',
      newValue: salesTax
    }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-600 hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 mr-2" />
          Tax Config
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900 border-gray-700 text-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salesTax" className="text-sm font-medium text-gray-300">
              Sales Tax (%)
            </Label>
            <Input
              id="salesTax"
              type="number"
              value={salesTax}
              onChange={(e) => setSalesTax(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Applied to minimum price calculations
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SalesTaxConfig;
