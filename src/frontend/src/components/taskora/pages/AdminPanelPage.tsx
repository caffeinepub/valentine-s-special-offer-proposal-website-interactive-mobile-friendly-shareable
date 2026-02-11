import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useGetUsdtAddresses,
  useSetUsdtAddresses,
  useGetPendingDeposits,
  useGetPendingWithdrawals,
  useGetPendingClaims,
  useGetPendingVIPUpgrades,
  useMarkDepositCompleted,
  useMarkWithdrawalCompleted,
  useApproveEarningClaim,
  useRejectEarningClaim,
  useApproveVIPUpgrade,
  useRejectVIPUpgrade,
} from '../../../hooks/useRewardQueries';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AdminPanelPage() {
  const { data: addresses, isLoading: addressesLoading } = useGetUsdtAddresses();
  const setAddresses = useSetUsdtAddresses();
  const { data: pendingDeposits, isLoading: depositsLoading } = useGetPendingDeposits();
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useGetPendingWithdrawals();
  const { data: pendingClaims, isLoading: claimsLoading } = useGetPendingClaims();
  const { data: pendingVIPUpgrades, isLoading: vipLoading } = useGetPendingVIPUpgrades();

  const markDepositCompleted = useMarkDepositCompleted();
  const markWithdrawalCompleted = useMarkWithdrawalCompleted();
  const approveClaim = useApproveEarningClaim();
  const rejectClaim = useRejectEarningClaim();
  const approveVIP = useApproveVIPUpgrade();
  const rejectVIP = useRejectVIPUpgrade();

  const [trc20Address, setTrc20Address] = useState(addresses?.trc20Address || '');
  const [erc20Address, setErc20Address] = useState(addresses?.erc20Address || '');
  const [txIdInput, setTxIdInput] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);

  const handleUpdateAddresses = async () => {
    try {
      await setAddresses.mutateAsync({
        trc20Address: trc20Address.trim(),
        erc20Address: erc20Address.trim(),
      });
      toast.success('Deposit addresses updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCompleteDeposit = async (userId: string, depositId: string) => {
    if (!txIdInput.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    try {
      await markDepositCompleted.mutateAsync({
        userId,
        depositId,
        txId: txIdInput.trim(),
      });
      toast.success('Deposit marked as completed');
      setTxIdInput('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCompleteWithdrawal = async (userId: string, withdrawalId: string) => {
    try {
      await markWithdrawalCompleted.mutateAsync({ userId, withdrawalId });
      toast.success('Withdrawal marked as completed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openActionDialog = (action: any) => {
    setCurrentAction(action);
    setAdminMessage('');
    setActionDialogOpen(true);
  };

  const handleApproveAction = async () => {
    if (!currentAction) return;

    try {
      if (currentAction.type === 'claim') {
        await approveClaim.mutateAsync({
          claimId: currentAction.id,
          adminMessage: adminMessage.trim() || null,
        });
        toast.success('Claim approved');
      } else if (currentAction.type === 'vip') {
        await approveVIP.mutateAsync({
          userId: currentAction.userId,
          adminMessage: adminMessage.trim() || null,
        });
        toast.success('VIP upgrade approved');
      }
      setActionDialogOpen(false);
      setCurrentAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRejectAction = async () => {
    if (!currentAction) return;

    try {
      if (currentAction.type === 'claim') {
        await rejectClaim.mutateAsync({
          claimId: currentAction.id,
          adminMessage: adminMessage.trim() || null,
        });
        toast.success('Claim rejected');
      } else if (currentAction.type === 'vip') {
        await rejectVIP.mutateAsync({
          userId: currentAction.userId,
          adminMessage: adminMessage.trim() || null,
        });
        toast.success('VIP upgrade rejected');
      }
      setActionDialogOpen(false);
      setCurrentAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage platform operations</p>
      </div>

      <Tabs defaultValue="addresses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="addresses">
            <Settings className="h-4 w-4 mr-2" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="deposits">
            Deposits {pendingDeposits && pendingDeposits.length > 0 && `(${pendingDeposits.length})`}
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Withdrawals {pendingWithdrawals && pendingWithdrawals.length > 0 && `(${pendingWithdrawals.length})`}
          </TabsTrigger>
          <TabsTrigger value="claims">
            Claims {pendingClaims && pendingClaims.length > 0 && `(${pendingClaims.length})`}
          </TabsTrigger>
          <TabsTrigger value="vip">
            VIP {pendingVIPUpgrades && pendingVIPUpgrades.length > 0 && `(${pendingVIPUpgrades.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>USDT Deposit Addresses</CardTitle>
              <CardDescription>Configure the addresses where users send deposits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressesLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <div>
                    <Label htmlFor="trc20">USDT (TRC20) Address</Label>
                    <Input
                      id="trc20"
                      placeholder="Tron network address"
                      value={trc20Address}
                      onChange={(e) => setTrc20Address(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="erc20">USDT (ERC20) Address</Label>
                    <Input
                      id="erc20"
                      placeholder="Ethereum network address"
                      value={erc20Address}
                      onChange={(e) => setErc20Address(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleUpdateAddresses} disabled={setAddresses.isPending}>
                    {setAddresses.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Addresses
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposits</CardTitle>
              <CardDescription>Review and complete deposit requests</CardDescription>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !pendingDeposits || pendingDeposits.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No pending deposits</p>
              ) : (
                <div className="space-y-4">
                  {pendingDeposits.map(([userId, deposit]) => (
                    <div key={deposit.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">User: {userId.toString().slice(0, 10)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: ${(Number(deposit.amount) / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(Number(deposit.timestamp) / 1_000_000), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Transaction ID"
                          value={txIdInput}
                          onChange={(e) => setTxIdInput(e.target.value)}
                        />
                        <Button
                          onClick={() => handleCompleteDeposit(userId.toString(), deposit.id)}
                          disabled={markDepositCompleted.isPending}
                        >
                          {markDepositCompleted.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawals</CardTitle>
              <CardDescription>Review and complete withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !pendingWithdrawals || pendingWithdrawals.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No pending withdrawals</p>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map(([userId, withdrawal]) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">User: {userId.toString().slice(0, 10)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: ${(Number(withdrawal.amount) / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground break-all">
                            To: {withdrawal.destinationAddress}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(Number(withdrawal.timestamp) / 1_000_000), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <Button
                        onClick={() => handleCompleteWithdrawal(userId.toString(), withdrawal.id)}
                        disabled={markWithdrawalCompleted.isPending}
                      >
                        {markWithdrawalCompleted.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark Completed
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Pending Claims</CardTitle>
              <CardDescription>Review and approve/reject earning claims</CardDescription>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !pendingClaims || pendingClaims.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No pending claims</p>
              ) : (
                <div className="space-y-4">
                  {pendingClaims.map((claim) => (
                    <div key={claim.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">User: {claim.userId.toString().slice(0, 10)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Reward: ${(Number(claim.rewardAmount) / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Intent: {claim.claimData.intent}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Proof: {claim.claimData.proof}
                          </p>
                          {claim.userMessage && (
                            <p className="text-sm text-muted-foreground italic">
                              Message: {claim.userMessage}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(Number(claim.created) / 1_000_000), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          onClick={() => openActionDialog({ type: 'claim', id: claim.id, action: 'approve' })}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => openActionDialog({ type: 'claim', id: claim.id, action: 'reject' })}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <Card>
            <CardHeader>
              <CardTitle>Pending VIP Upgrades</CardTitle>
              <CardDescription>Review and approve/reject VIP upgrade requests</CardDescription>
            </CardHeader>
            <CardContent>
              {vipLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !pendingVIPUpgrades || pendingVIPUpgrades.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No pending VIP upgrades</p>
              ) : (
                <div className="space-y-4">
                  {pendingVIPUpgrades.map(([userId, status]) => {
                    const request = status.requestedUpgrade;
                    if (!request) return null;

                    return (
                      <div key={userId.toString()} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">User: {userId.toString().slice(0, 10)}...</p>
                            <p className="text-sm text-muted-foreground">
                              Current Tier: {status.tier as string}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested Tier: {request.tierTo as string}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(Number(request.requestedAt) / 1_000_000), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge>Pending</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => openActionDialog({ type: 'vip', userId: userId.toString(), action: 'approve' })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => openActionDialog({ type: 'vip', userId: userId.toString(), action: 'reject' })}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction?.action === 'approve' ? 'Approve' : 'Reject'} {currentAction?.type === 'claim' ? 'Claim' : 'VIP Upgrade'}
            </DialogTitle>
            <DialogDescription>
              Add an optional message for the user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-message">Admin Message (Optional)</Label>
            <Textarea
              id="admin-message"
              placeholder="Message to user..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            {currentAction?.action === 'approve' ? (
              <Button onClick={handleApproveAction} disabled={approveClaim.isPending || approveVIP.isPending}>
                {(approveClaim.isPending || approveVIP.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleRejectAction} disabled={rejectClaim.isPending || rejectVIP.isPending}>
                {(rejectClaim.isPending || rejectVIP.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
