import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationDisclosure } from '../../exchange/SimulationDisclosure';
import { CopyField } from '../../CopyField';
import { useGetUsdtAddresses, useRequestDeposit, useRequestWithdrawal, useGetTransferHistory } from '../../../hooks/useRewardQueries';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function TransfersPage() {
  const { data: addresses, isLoading: addressesLoading } = useGetUsdtAddresses();
  const { data: transferHistory, isLoading: historyLoading } = useGetTransferHistory();
  const requestDeposit = useRequestDeposit();
  const requestWithdrawal = useRequestWithdrawal();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const handleRequestDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await requestDeposit.mutateAsync(Math.floor(amount * 100));
      toast.success('Deposit request submitted! Please send funds to the address above and wait for admin confirmation.');
      setDepositAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error('Please enter a withdrawal address');
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        amount: Math.floor(amount * 100),
        destinationAddress: withdrawAddress.trim(),
      });
      toast.success('Withdrawal request submitted! Awaiting admin processing.');
      setWithdrawAmount('');
      setWithdrawAddress('');
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

  const statusVariants = {
    pending: 'secondary' as const,
    completed: 'default' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transfers</h1>
        <p className="text-muted-foreground">Deposit and withdraw USDT</p>
      </div>

      <SimulationDisclosure />

      <Tabs defaultValue="deposit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="deposit">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit USDT</CardTitle>
              <CardDescription>Send USDT to one of the addresses below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyField
                label="USDT (TRC20) Address"
                value={addresses?.trc20Address || 'Not set yet'}
                description="Tron network - Lower fees"
              />
              <CopyField
                label="USDT (ERC20) Address"
                value={addresses?.erc20Address || 'Not set yet'}
                description="Ethereum network - Higher fees"
              />
              <div className="pt-4 border-t">
                <Label htmlFor="deposit-amount">Amount (USDT)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <Button onClick={handleRequestDeposit} disabled={requestDeposit.isPending}>
                    {requestDeposit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  After sending funds, submit a deposit request. Admin will confirm and credit your account.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw USDT</CardTitle>
              <CardDescription>Request a withdrawal to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="withdraw-address">Destination Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Your USDT wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Specify TRC20 or ERC20 in your address or notes
                </p>
              </div>
              <Button onClick={handleRequestWithdrawal} disabled={requestWithdrawal.isPending} className="w-full">
                {requestWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>Your deposit and withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !transferHistory || transferHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transfer history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transferHistory.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {transfer.type === 'deposit' ? (
                        <ArrowDownToLine className="h-4 w-4 text-accent" />
                      ) : (
                        <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="font-medium capitalize">{transfer.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(transfer.timestamp) / 1_000_000), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${(Number(transfer.amount) / 100).toFixed(2)}
                    </span>
                    <Badge variant={statusVariants[transfer.status as 'pending' | 'completed'] || 'secondary'}>
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
