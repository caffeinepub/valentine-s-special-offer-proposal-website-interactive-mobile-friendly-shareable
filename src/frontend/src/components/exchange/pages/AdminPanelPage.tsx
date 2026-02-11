import { useState } from 'react';
import { useGetExchangeState, useGetUsdtDepositAddresses, useSetUsdtDepositAddresses, useMarkExchangeDepositCompleted, useMarkExchangeWithdrawalCompleted } from '../../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Settings, Loader2, CheckCircle } from 'lucide-react';
import { useGetPendingExchangeDeposits, useGetPendingExchangeWithdrawals } from '../../../hooks/useExchangeQueries';

export function AdminPanelPage() {
  const { data: addresses, isLoading: addressesLoading } = useGetUsdtDepositAddresses();
  const { data: pendingDeposits, isLoading: depositsLoading } = useGetPendingExchangeDeposits();
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useGetPendingExchangeWithdrawals();
  const setAddresses = useSetUsdtDepositAddresses();
  const markDepositCompleted = useMarkExchangeDepositCompleted();
  const markWithdrawalCompleted = useMarkExchangeWithdrawalCompleted();

  const [trc20Address, setTrc20Address] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [depositTxIds, setDepositTxIds] = useState<Record<string, string>>({});

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
      await markDepositCompleted.mutateAsync({ user, depositId, txId: txId.trim() });
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
        <p className="text-muted-foreground">Manage exchange settings and pending requests</p>
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
                        <TableHead>Asset</TableHead>
                        <TableHead>Transaction ID</TableHead>
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
                            {(Number(deposit.amount) / Math.pow(10, Number(deposit.asset.decimals))).toFixed(8)}
                          </TableCell>
                          <TableCell>{deposit.asset.symbol}</TableCell>
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
                        <TableHead>Asset</TableHead>
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
                            {(Number(withdrawal.amount) / Math.pow(10, Number(withdrawal.asset.decimals))).toFixed(8)}
                          </TableCell>
                          <TableCell>{withdrawal.asset.symbol}</TableCell>
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
      </Tabs>
    </div>
  );
}
