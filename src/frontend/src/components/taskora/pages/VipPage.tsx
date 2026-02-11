import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetVIPStatus, useRequestVIPUpgrade } from '../../../hooks/useRewardQueries';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Crown, Check, Loader2, Sparkles } from 'lucide-react';
import type { Variant_bronze_gold_diamond_basic_silver } from '../../../backend';

export function VipPage() {
  const { data: vipStatus, isLoading, error } = useGetVIPStatus();
  const requestUpgrade = useRequestVIPUpgrade();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Variant_bronze_gold_diamond_basic_silver | null>(null);

  const tiers = [
    {
      id: 'basic' as Variant_bronze_gold_diamond_basic_silver,
      name: 'Basic',
      price: 'Free',
      benefits: ['Access to basic earning tasks', 'Standard support', 'Basic dashboard'],
    },
    {
      id: 'bronze' as Variant_bronze_gold_diamond_basic_silver,
      name: 'Bronze',
      price: '$50',
      benefits: ['All Basic benefits', 'Priority task access', '5% bonus on earnings', 'Email support'],
    },
    {
      id: 'silver' as Variant_bronze_gold_diamond_basic_silver,
      name: 'Silver',
      price: '$150',
      benefits: ['All Bronze benefits', '10% bonus on earnings', 'Exclusive tasks', 'Priority support'],
    },
    {
      id: 'gold' as Variant_bronze_gold_diamond_basic_silver,
      name: 'Gold',
      price: '$300',
      benefits: ['All Silver benefits', '15% bonus on earnings', 'VIP-only tasks', 'Dedicated support', 'Early access to features'],
    },
    {
      id: 'diamond' as Variant_bronze_gold_diamond_basic_silver,
      name: 'Diamond',
      price: '$500',
      benefits: ['All Gold benefits', '25% bonus on earnings', 'Premium tasks', 'Personal account manager', 'Custom earning opportunities'],
    },
  ];

  const handleRequestUpgrade = async () => {
    if (!selectedTier) return;

    try {
      await requestUpgrade.mutateAsync(selectedTier);
      toast.success('VIP upgrade request submitted! Awaiting admin approval.');
      setUpgradeDialogOpen(false);
      setSelectedTier(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load VIP status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const currentTier = (vipStatus?.tier as string) || 'basic';
  const pendingUpgrade = vipStatus?.requestedUpgrade;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">VIP Membership</h1>
        <p className="text-muted-foreground">Unlock exclusive benefits and higher earning potential</p>
      </div>

      {/* Current Status */}
      <Card className="border-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                Your Current Tier
              </CardTitle>
              <CardDescription className="mt-1">
                {tiers.find(t => t.id === currentTier)?.name || 'Basic'}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {tiers.find(t => t.id === currentTier)?.name || 'Basic'}
            </Badge>
          </div>
        </CardHeader>
        {pendingUpgrade && (pendingUpgrade.status as string) === 'pending' && (
          <CardContent>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                You have a pending upgrade request to{' '}
                <strong>{tiers.find(t => t.id === (pendingUpgrade.tierTo as string))?.name}</strong>.
                Awaiting admin approval.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        {pendingUpgrade && (pendingUpgrade.status as string) === 'rejected' && pendingUpgrade.adminMessage && (
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Your upgrade request was rejected. Admin message: {pendingUpgrade.adminMessage}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Tier Comparison */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentTier;
          const isLower = tiers.findIndex(t => t.id === tier.id) <= tiers.findIndex(t => t.id === currentTier);
          const hasPendingUpgrade = pendingUpgrade && (pendingUpgrade.status as string) === 'pending';

          return (
            <Card
              key={tier.id}
              className={`relative ${isCurrent ? 'border-accent shadow-lg' : ''}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default">Current</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className={`h-5 w-5 ${isCurrent ? 'text-accent' : 'text-muted-foreground'}`} />
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-2xl font-bold">{tier.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                {!isCurrent && !isLower && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setUpgradeDialogOpen(true);
                    }}
                    disabled={hasPendingUpgrade}
                  >
                    {hasPendingUpgrade ? 'Upgrade Pending' : 'Request Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request VIP Upgrade</DialogTitle>
            <DialogDescription>
              You are requesting an upgrade to{' '}
              <strong>{tiers.find(t => t.id === selectedTier)?.name}</strong> tier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                After submitting your request, an admin will review and approve it. 
                You will need to complete payment as instructed by the admin before your upgrade is activated.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestUpgrade} disabled={requestUpgrade.isPending}>
              {requestUpgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
