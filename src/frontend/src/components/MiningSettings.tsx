import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetMiningConfig, useUpdateMiningConfig } from '../hooks/useMining';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { MiningConfig } from '../backend';

export function MiningSettings() {
  const { data: config, isLoading } = useGetMiningConfig();
  const updateConfig = useUpdateMiningConfig();

  const [formData, setFormData] = useState({
    profileName: '',
    targetHashrate: '',
    powerUsage: '',
    electricityCost: '',
    bitcoinPayoutAddress: '',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        profileName: config.profileName,
        targetHashrate: config.targetHashrate.toString(),
        powerUsage: config.powerUsage.toString(),
        electricityCost: config.electricityCost.toString(),
        bitcoinPayoutAddress: config.bitcoinPayoutAddress,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetHashrate = parseInt(formData.targetHashrate);
    const powerUsage = parseInt(formData.powerUsage);
    const electricityCost = parseInt(formData.electricityCost);

    if (isNaN(targetHashrate) || targetHashrate <= 0) {
      toast.error('Target hashrate must be a positive number');
      return;
    }

    if (isNaN(powerUsage) || powerUsage <= 0) {
      toast.error('Power usage must be a positive number');
      return;
    }

    if (isNaN(electricityCost) || electricityCost < 0) {
      toast.error('Electricity cost must be a non-negative number');
      return;
    }

    if (!formData.bitcoinPayoutAddress.trim()) {
      toast.error('Bitcoin payout address is required');
      return;
    }

    const newConfig: MiningConfig = {
      profileName: formData.profileName.trim(),
      targetHashrate: BigInt(targetHashrate),
      powerUsage: BigInt(powerUsage),
      electricityCost: BigInt(electricityCost),
      bitcoinPayoutAddress: formData.bitcoinPayoutAddress.trim(),
    };

    try {
      await updateConfig.mutateAsync(newConfig);
      toast.success('Mining configuration saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mining Configuration</CardTitle>
          <CardDescription>
            Configure your mining parameters and payout settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profileName">Profile Name</Label>
              <Input
                id="profileName"
                value={formData.profileName}
                onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                placeholder="My Mining Rig"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetHashrate">Target Hashrate (MH/s)</Label>
              <Input
                id="targetHashrate"
                type="number"
                value={formData.targetHashrate}
                onChange={(e) => setFormData({ ...formData, targetHashrate: e.target.value })}
                placeholder="1000"
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Expected mining performance in megahashes per second
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="powerUsage">Power Usage (Watts)</Label>
              <Input
                id="powerUsage"
                type="number"
                value={formData.powerUsage}
                onChange={(e) => setFormData({ ...formData, powerUsage: e.target.value })}
                placeholder="1500"
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Power consumption of your mining hardware
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricityCost">Electricity Cost (cents per kWh)</Label>
              <Input
                id="electricityCost"
                type="number"
                value={formData.electricityCost}
                onChange={(e) => setFormData({ ...formData, electricityCost: e.target.value })}
                placeholder="12"
                min="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your electricity rate for cost calculations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bitcoinPayoutAddress">Bitcoin Payout Address</Label>
              <Input
                id="bitcoinPayoutAddress"
                value={formData.bitcoinPayoutAddress}
                onChange={(e) => setFormData({ ...formData, bitcoinPayoutAddress: e.target.value })}
                placeholder="bc1q..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Your Bitcoin wallet address for receiving payouts
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={updateConfig.isPending}
            >
              {updateConfig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card
        className="bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/mining-rig-illustration.dim_1600x900.png)' }}
      >
        <div className="bg-background/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Hardware Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Ensure proper cooling and ventilation for optimal performance</p>
            <p>• Monitor temperature and adjust fan speeds as needed</p>
            <p>• Regular maintenance extends hardware lifespan</p>
            <p>• Consider joining a mining pool for consistent returns</p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
