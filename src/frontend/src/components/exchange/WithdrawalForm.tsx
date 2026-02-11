import { useState } from 'react';
import { useCreateWithdrawal, useExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowUpFromLine, Loader2 } from 'lucide-react';

export function WithdrawalForm() {
  const [assetSymbol, setAssetSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const { data: exchangeState } = useExchangeState();
  const createWithdrawal = useCreateWithdrawal();

  const supportedAssets = exchangeState?.supportedAssets || [];
  const balances = exchangeState?.balances || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetSymbol || !amount || !destinationAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const asset = supportedAssets.find((a) => a.symbol === assetSymbol);
    if (!asset) {
      toast.error('Invalid asset selected');
      return;
    }

    // Check balance
    const balance = balances.find(([symbol]) => symbol === assetSymbol)?.[1];
    const availableBalance = balance ? Number(balance.available) / Math.pow(10, Number(asset.decimals)) : 0;

    if (numAmount > availableBalance) {
      toast.error(`Insufficient balance. Available: ${availableBalance} ${assetSymbol}`);
      return;
    }

    const amountInSmallestUnit = BigInt(Math.floor(numAmount * Math.pow(10, Number(asset.decimals))));

    createWithdrawal.mutate(
      { assetSymbol, amount: amountInSmallestUnit, destinationAddress },
      {
        onSuccess: (withdrawal) => {
          toast.success(`Withdrawal request created and is pending admin review. Reference: ${withdrawal.id}`);
          setAmount('');
          setDestinationAddress('');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to create withdrawal');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpFromLine className="h-5 w-5" />
          Withdrawal
        </CardTitle>
        <CardDescription>Create a withdrawal request for admin processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawal-asset">Asset</Label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol}>
              <SelectTrigger id="withdrawal-asset">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {supportedAssets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount">Amount</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination-address">Destination Address</Label>
            <Input
              id="destination-address"
              type="text"
              placeholder="Enter wallet address"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createWithdrawal.isPending}>
            {createWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Withdrawal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
