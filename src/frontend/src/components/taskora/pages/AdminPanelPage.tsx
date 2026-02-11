import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useGetUsdtAddresses,
  useSetUsdtAddresses,
  useGetPendingDeposits,
  useMarkDepositCompleted,
  useGetPendingWithdrawals,
  useMarkWithdrawalCompleted,
  useGetPendingClaims,
  useApproveEarningClaim,
  useRejectEarningClaim,
  useGetPendingVIPUpgrades,
  useApproveVIPUpgrade,
  useRejectVIPUpgrade,
} from '../../../hooks/useRewardQueries';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AdminPanelPage() {
  const { data: addresses, isLoading: addressesLoading } = useGetUsdtAddresses();
  const { data: pendingDeposits, isLoading: depositsLoading } = useGetPendingDeposits();
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useGetPendingWithdrawals();
  const { data: pendingClaims, isLoading: claimsLoading } = useGetPendingClaims();
  const { data: pendingVIPUpgrades, isLoading: vipLoading } = useGetPendingVIPUpgrades();

  const setAddresses = useSetUsdtAddresses();
  const markDepositCompleted = useMarkDepositCompleted();
  const markWithdrawalCompleted = useMarkWithdrawalCompleted();
  const approveClaim = useApproveEarningClaim();
  const rejectClaim = useRejectEarningClaim();
  const approveVIPUpgrade = useApproveVIPUpgrade();
  const rejectVIPUpgrade = useRejectVIPUpgrade();

  const [trc20Address, setTrc20Address] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [depositTxIds, setDepositTxIds] = useState<Record<string, string>>({});
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState('');

  const handleSaveAddresses = async () => {
    if (!trc20Address.trim() && !erc20Address.trim()) {
      toast.error('Please enter at least one address');
      return;
    }

    try {
      await setAddresses.mutateAsync({
        trc20Address: trc20Address.trim() || addresses?.trc20Address || '',
        erc20Address: erc20Address.trim() || addresses?.erc20Address || '',
      });
      toast.success('Deposit addresses updated successfully');
      setTrc20Address('');
      setErc20Address('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCompleteDeposit = async (user: any, depositId: string) => {
    const txId = depositTxIds[depositId];
    if (!txId?.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    try {
      await markDepositCompleted.mutateAsync({
        user,
        depositId,
        txId: txId.trim(),
      });
      toast.success('Deposit marked as completed');
      setDepositTxIds(prev => {
        const updated = { ...prev };
        delete updated[depositId];
        return updated;
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCompleteWithdrawal = async (user: any, withdrawalId: string) => {
    try {
      await markWithdrawalCompleted.mutateAsync({ user, withdrawalId });
      toast.success('Withdrawal marked as completed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openApproveDialog = (type: 'claim' | 'vip', item: any) => {
    setCurrentAction({ type, action: 'approve', ...item });
    setAdminMessage('');
    setActionDialogOpen(true);
  };

  const openRejectDialog = (type: 'claim' | 'vip', item: any) => {
    setCurrentAction({ type, action: 'reject', ...item });
    setAdminMessage('');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!currentAction) return;

    try {
      if (currentAction.type === 'claim') {
        if (currentAction.action === 'approve') {
          await approveClaim.mutateAsync({
            claimId: currentAction.claimId,
            adminMessage: adminMessage.trim() || null,
          });
          toast.success('Claim approved successfully');
        } else {
          await rejectClaim.mutateAsync({
            claimId: currentAction.claimId,
            adminMessage: adminMessage.trim() || null,
          });
          toast.success('Claim rejected');
        }
      } else if (currentAction.type === 'vip') {
        if (currentAction.action === 'approve') {
          await approveVIPUpgrade.mutateAsync({
            user: currentAction.user,
            adminMessage: adminMessage.trim() || null,
          });
          toast.success('VIP upgrade approved successfully');
        } else {
          await rejectVIPUpgrade.mutateAsync({
            user: currentAction.user,
            adminMessage: adminMessage.trim() || null,
          });
          toast.success('VIP upgrade rejected');
        }
      }
      setActionDialogOpen(false);
      setCurrentAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (addressesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage Taskora Global settings and pending requests</p>
      </div>

      <Tabs defaultValue="addresses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="addresses">
            <Settings className="h-4 w-4 mr-2" />
            Deposit Addresses
          </TabsTrigger>
          <TabsTrigger value="deposits">
            Pending Deposits
            {pendingDeposits && pendingDeposits.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingDeposits.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Pending Withdrawals
            {pendingWithdrawals && pendingWithdrawals.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingWithdrawals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims">
            Pending Claims
            {pendingClaims && pendingClaims.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingClaims.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vip">
            VIP Upgrades
            {pendingVIPUpgrades && pendingVIPUpgrades.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingVIPUpgrades.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>USDT Deposit Addresses</CardTitle>
              <CardDescription>Configure the addresses where users can send USDT deposits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-trc20">Current TRC20 Address</Label>
                <Input
                  id="current-trc20"
                  value={addresses?.trc20Address || 'Not set'}
                  disabled
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-erc20">Current ERC20 Address</Label>
                <Input
                  id="current-erc20"
                  value={addresses?.erc20Address || 'Not set'}
                  disabled
                  className="font-mono"
                />
              </div>
              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-trc20">New TRC20 Address</Label>
                  <Input
                    id="new-trc20"
                    placeholder="Enter new TRC20 address"
                    value={trc20Address}
                    onChange={(e) => setTrc20Address(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-erc20">New ERC20 Address</Label>
                  <Input
                    id="new-erc20"
                    placeholder="Enter new ERC20 address"
                    value={erc20Address}
                    onChange={(e) => setErc20Address(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveAddresses} disabled={setAddresses.isPending}>
                  {setAddresses.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Addresses
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposits</CardTitle>
              <CardDescription>Review and approve deposit requests</CardDescription>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !pendingDeposits || pendingDeposits.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending deposits</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>User TX ID</TableHead>
                        <TableHead>Confirm TX ID</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeposits.map(([user, deposit]) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-mono text-xs">
                            {user.toString().slice(0, 12)}...
                          </TableCell>
                          <TableCell className="font-mono">
                            ${(Number(deposit.amount) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {deposit.txId || 'Not provided'}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Enter TX ID"
                              value={depositTxIds[deposit.id] || ''}
                              onChange={(e) => setDepositTxIds(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                              className="max-w-[200px]"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleCompleteDeposit(user, deposit.id)}
                              disabled={markDepositCompleted.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawals</CardTitle>
              <CardDescription>Review and process withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !pendingWithdrawals || pendingWithdrawals.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending withdrawals</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingWithdrawals.map(([user, withdrawal]) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="font-mono text-xs">
                            {user.toString().slice(0, 12)}...
                          </TableCell>
                          <TableCell className="font-mono">
                            ${(Number(withdrawal.amount) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[200px]">
                            {withdrawal.destinationAddress}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleCompleteWithdrawal(user, withdrawal.id)}
                              disabled={markWithdrawalCompleted.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Pending Earning Claims</CardTitle>
              <CardDescription>Review and process earning claims</CardDescription>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !pendingClaims || pendingClaims.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending claims</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {pendingClaims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Claim #{claim.id.slice(-8)}</span>
                            <Badge variant="secondary">${(Number(claim.rewardAmount) / 100).toFixed(2)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            User: {claim.userId.toString().slice(0, 12)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(Number(claim.created) / 1_000_000), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div>
                          <span className="text-sm font-medium">Intent:</span>
                          <p className="text-sm text-muted-foreground">{claim.claimData.intent}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Proof:</span>
                          <p className="text-sm text-muted-foreground">{claim.claimData.proof}</p>
                        </div>
                        {claim.userMessage && (
                          <div>
                            <span className="text-sm font-medium">User Message:</span>
                            <p className="text-sm text-muted-foreground">{claim.userMessage}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog('claim', { claimId: claim.id })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog('claim', { claimId: claim.id })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
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
              <CardDescription>Review and process VIP upgrade requests</CardDescription>
            </CardHeader>
            <CardContent>
              {vipLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !pendingVIPUpgrades || pendingVIPUpgrades.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending VIP upgrades</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Current Tier</TableHead>
                        <TableHead>Requested Tier</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVIPUpgrades.map(([user, status]) => (
                        <TableRow key={user.toString()}>
                          <TableCell className="font-mono text-xs">
                            {user.toString().slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {status.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">
                              {status.requestedUpgrade?.tierTo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {status.requestedUpgrade && formatDistanceToNow(
                              new Date(Number(status.requestedUpgrade.requestedAt) / 1_000_000),
                              { addSuffix: true }
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={() => openApproveDialog('vip', { user })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog('vip', { user })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction?.action === 'approve' ? 'Approve' : 'Reject'}{' '}
              {currentAction?.type === 'claim' ? 'Claim' : 'VIP Upgrade'}
            </DialogTitle>
            <DialogDescription>
              Add an optional message for the user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-message">Admin Message (Optional)</Label>
              <Textarea
                id="admin-message"
                placeholder="Enter a message for the user..."
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={approveClaim.isPending || rejectClaim.isPending || approveVIPUpgrade.isPending || rejectVIPUpgrade.isPending}
            >
              {(approveClaim.isPending || rejectClaim.isPending || approveVIPUpgrade.isPending || rejectVIPUpgrade.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
