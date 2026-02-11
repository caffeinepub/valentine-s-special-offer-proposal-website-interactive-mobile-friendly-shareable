import { useState } from 'react';
import { useExchangeState, useGetUsdtDepositAddresses, useSetUsdtDepositAddresses, useMarkDepositCompleted, useMarkWithdrawalCompleted } from '../../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { Settings, Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2, Check } from 'lucide-react';

export function AdminPanelPage() {
  const { data: exchangeState, isLoading: stateLoading } = useExchangeState();
  const { data: depositAddresses, isLoading: addressesLoading } = useGetUsdtDepositAddresses();
  const setAddresses = useSetUsdtDepositAddresses();
  const markDepositCompleted = useMarkDepositCompleted();
  const markWithdrawalCompleted = useMarkWithdrawalCompleted();

  const [trc20Address, setTrc20Address] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [editingAddresses, setEditingAddresses] = useState(false);

  // State for completion forms
  const [completingDeposit, setCompletingDeposit] = useState<string | null>(null);
  const [depositTxId, setDepositTxId] = useState('');
  const [completingWithdrawal, setCompletingWithdrawal] = useState<string | null>(null);

  // Load addresses when available
  if (depositAddresses && !editingAddresses && !trc20Address && !erc20Address) {
    setTrc20Address(depositAddresses.trc20Address);
    setErc20Address(depositAddresses.erc20Address);
  }

  const handleSaveAddresses = async () => {
    try {
      await setAddresses.mutateAsync({
        trc20Address,
        erc20Address,
      });
      toast.success('Deposit addresses updated successfully');
      setEditingAddresses(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkDepositCompleted = async (user: string, depositId: string) => {
    if (!depositTxId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    try {
      await markDepositCompleted.mutateAsync({ user, depositId, txId: depositTxId });
      toast.success('Deposit marked as completed');
      setCompletingDeposit(null);
      setDepositTxId('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkWithdrawalCompleted = async (user: string, withdrawalId: string) => {
    try {
      await markWithdrawalCompleted.mutateAsync({ user, withdrawalId });
      toast.success('Withdrawal marked as completed');
      setCompletingWithdrawal(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Extract all deposits and withdrawals with user info
  const allDeposits = exchangeState?.deposits || [];
  const allWithdrawals = exchangeState?.withdrawals || [];

  const pendingDeposits = allDeposits
    .filter(([_, d]) => d.status === 'pending')
    .map(([_, d]) => d);

  const pendingWithdrawals = allWithdrawals
    .filter(([_, w]) => w.status === 'pending')
    .map(([_, w]) => w);

  if (stateLoading || addressesLoading) {
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
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage deposit addresses and process pending transfers
        </p>
      </div>

      <Tabs defaultValue="addresses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="addresses">
            <Settings className="h-4 w-4 mr-2" />
            Deposit Addresses
          </TabsTrigger>
          <TabsTrigger value="deposits">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Pending Deposits ({pendingDeposits.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Pending Withdrawals ({pendingWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                USDT Deposit Addresses
              </CardTitle>
              <CardDescription>
                Configure the USDT deposit addresses shown to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trc20">USDT (TRC20) Address</Label>
                <Input
                  id="trc20"
                  value={trc20Address}
                  onChange={(e) => {
                    setTrc20Address(e.target.value);
                    setEditingAddresses(true);
                  }}
                  placeholder="Enter TRC20 address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="erc20">USDT (ERC20) Address</Label>
                <Input
                  id="erc20"
                  value={erc20Address}
                  onChange={(e) => {
                    setErc20Address(e.target.value);
                    setEditingAddresses(true);
                  }}
                  placeholder="Enter ERC20 address"
                />
              </div>

              <Button
                onClick={handleSaveAddresses}
                disabled={setAddresses.isPending || !editingAddresses}
              >
                {setAddresses.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Addresses
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposits</CardTitle>
              <CardDescription>
                Review and approve deposit requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeposits.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending deposits</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deposit ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-mono text-sm">{deposit.id}</TableCell>
                          <TableCell className="font-mono">
                            {(Number(deposit.amount) / Math.pow(10, Number(deposit.asset.decimals))).toFixed(8)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{deposit.asset.symbol}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(Number(deposit.timestamp / BigInt(1000000))).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {completingDeposit === deposit.id ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  placeholder="Transaction ID"
                                  value={depositTxId}
                                  onChange={(e) => setDepositTxId(e.target.value)}
                                  className="w-48"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkDepositCompleted('user', deposit.id)}
                                  disabled={markDepositCompleted.isPending}
                                >
                                  {markDepositCompleted.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setCompletingDeposit(null);
                                    setDepositTxId('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setCompletingDeposit(deposit.id)}
                              >
                                Complete
                              </Button>
                            )}
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
              <CardDescription>
                Review and approve withdrawal requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals.length === 0 ? (
                <Alert>
                  <AlertDescription>No pending withdrawals</AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Withdrawal ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="font-mono text-sm">{withdrawal.id}</TableCell>
                          <TableCell className="font-mono">
                            {(Number(withdrawal.amount) / Math.pow(10, Number(withdrawal.asset.decimals))).toFixed(8)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{withdrawal.asset.symbol}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm truncate max-w-[200px]">
                            {withdrawal.destinationAddress}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(Number(withdrawal.timestamp / BigInt(1000000))).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleMarkWithdrawalCompleted('user', withdrawal.id)}
                              disabled={markWithdrawalCompleted.isPending && completingWithdrawal === withdrawal.id}
                            >
                              {markWithdrawalCompleted.isPending && completingWithdrawal === withdrawal.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
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
