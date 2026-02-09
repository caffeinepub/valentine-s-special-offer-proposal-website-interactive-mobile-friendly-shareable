import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetPayoutHistory, useRequestPayout } from '../hooks/usePayouts';
import { useGetMiningConfig, useGetMiningState } from '../hooks/useMining';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export function Payouts() {
  const { data: payoutHistory = [], isLoading: historyLoading } = useGetPayoutHistory();
  const { data: config } = useGetMiningConfig();
  const { data: miningState } = useGetMiningState();
  const requestPayout = useRequestPayout();

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const availableBalance = Number(miningState?.cumulativeEarnings || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payoutAmount = parseInt(amount);

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      toast.error('Payout amount must be a positive number');
      return;
    }

    if (payoutAmount > availableBalance) {
      toast.error('Insufficient balance for this payout');
      return;
    }

    const payoutAddress = address.trim() || config?.bitcoinPayoutAddress || '';
    if (!payoutAddress) {
      toast.error('Please provide a Bitcoin address');
      return;
    }

    try {
      await requestPayout.mutateAsync(BigInt(payoutAmount));
      toast.success('Payout request submitted successfully');
      setAmount('');
      setAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payout request');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    if (status === 'completed') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Submit a payout request to withdraw your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{availableBalance.toLocaleString()} sats</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (satoshis)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                min="1"
                max={availableBalance}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Bitcoin Address (optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={config?.bitcoinPayoutAddress || 'bc1q...'}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your default payout address from settings
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={requestPayout.isPending || availableBalance === 0}
            >
              {requestPayout.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Request Payout
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payoutHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payout requests yet. Submit your first payout above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutHistory.map((payout, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {Number(payout.amount).toLocaleString()} sats
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payout.address.slice(0, 12)}...{payout.address.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(payout.status)}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(Number(payout.timestamp) / 1_000_000).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
