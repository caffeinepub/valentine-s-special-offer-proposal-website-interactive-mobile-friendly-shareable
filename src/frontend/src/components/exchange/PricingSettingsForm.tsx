import { useState, useEffect } from 'react';
import { usePricingMarkup } from '../../hooks/usePricingMarkup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

export function PricingSettingsForm() {
  const { markup, setMarkup } = usePricingMarkup();
  const [localMarkup, setLocalMarkup] = useState(markup);

  useEffect(() => {
    setLocalMarkup(markup);
  }, [markup]);

  const handleSave = () => {
    setMarkup(localMarkup);
    toast.success('Pricing markup updated successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pricing Settings
        </CardTitle>
        <CardDescription>
          Configure the exchange price markup percentage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="markup-slider">Price Markup: {localMarkup.toFixed(1)}%</Label>
            <Slider
              id="markup-slider"
              min={0}
              max={25}
              step={0.5}
              value={[localMarkup]}
              onValueChange={(value) => setLocalMarkup(value[0])}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Exchange prices will be {localMarkup.toFixed(1)}% higher than reference prices
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup-input">Exact Value (%)</Label>
            <Input
              id="markup-input"
              type="number"
              min={0}
              max={25}
              step={0.1}
              value={localMarkup}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 25) {
                  setLocalMarkup(value);
                }
              }}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
