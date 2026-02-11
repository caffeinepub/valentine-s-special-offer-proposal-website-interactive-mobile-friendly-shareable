import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetEarningItems, useGetCallerEarningClaims, useSubmitEarningClaim } from '../../../hooks/useRewardQueries';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { DollarSign, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function EarnPage() {
  const { data: earningItems, isLoading: itemsLoading, error: itemsError } = useGetEarningItems();
  const { data: claims, isLoading: claimsLoading, error: claimsError } = useGetCallerEarningClaims();
  const submitClaim = useSubmitEarningClaim();

  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [intent, setIntent] = useState('');
  const [proof, setProof] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const handleOpenClaimDialog = (item: any) => {
    setSelectedItem(item);
    setIntent('');
    setProof('');
    setUserMessage('');
    setClaimDialogOpen(true);
  };

  const handleSubmitClaim = async () => {
    if (!selectedItem || !intent.trim() || !proof.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitClaim.mutateAsync({
        itemId: selectedItem.id,
        intent: intent.trim(),
        proof: proof.trim(),
        userMessage: userMessage.trim() || null,
      });
      toast.success('Claim submitted successfully! Awaiting admin approval.');
      setClaimDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (itemsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (itemsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load earning opportunities. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };

  const statusVariants = {
    pending: 'secondary' as const,
    approved: 'default' as const,
    rejected: 'destructive' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Earn Rewards</h1>
        <p className="text-muted-foreground">Complete tasks and watch ads to earn USDT</p>
      </div>

      {/* Earning Opportunities */}
      <div className="grid gap-4 md:grid-cols-2">
        {!earningItems || earningItems.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No earning opportunities available at the moment.</p>
              <p className="text-sm">Check back later for new tasks!</p>
            </CardContent>
          </Card>
        ) : (
          earningItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="mt-1">{item.description}</CardDescription>
                  </div>
                  <Badge variant="default" className="ml-2">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {(Number(item.rewardAmount) / 100).toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.conditionText}</p>
                <Button onClick={() => handleOpenClaimDialog(item)} className="w-full">
                  Claim Reward
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Claim History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Claims</CardTitle>
          <CardDescription>Track the status of your submitted claims</CardDescription>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : claimsError ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load claims history</AlertDescription>
            </Alert>
          ) : !claims || claims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No claims submitted yet</p>
              <p className="text-sm">Start earning by claiming rewards above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => {
                const item = earningItems?.find(i => i.id === claim.itemId);
                const claimStatus = claim.status as string;
                return (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item?.name || 'Unknown Task'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(Number(claim.created) / 1_000_000), { addSuffix: true })}
                      </p>
                      {claim.adminMessage && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          Admin: {claim.adminMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        ${(Number(claim.rewardAmount) / 100).toFixed(2)}
                      </span>
                      <Badge variant={statusVariants[claimStatus as keyof typeof statusVariants] || 'secondary'}>
                        <span className="flex items-center gap-1">
                          {statusIcons[claimStatus as keyof typeof statusIcons]}
                          {claimStatus}
                        </span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Claim</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - ${(Number(selectedItem?.rewardAmount || 0) / 100).toFixed(2)} reward
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="intent">Intent *</Label>
              <Input
                id="intent"
                placeholder="What did you do to earn this reward?"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof">Proof *</Label>
              <Input
                id="proof"
                placeholder="Provide proof (link, screenshot URL, etc.)"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Any additional information..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitClaim} disabled={submitClaim.isPending}>
              {submitClaim.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
