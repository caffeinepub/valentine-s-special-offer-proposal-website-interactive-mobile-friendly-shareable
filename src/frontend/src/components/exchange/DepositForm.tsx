import { useState } from 'react';
import { useCreateDeposit, useExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowDownToLine, Loader2 } from 'lucide-react';

export function DepositForm() {
  const [assetSymbol, setAssetSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const { data: exchangeState } = useExchangeState();
  const createDeposit = useCreateDeposit();

  const supportedAssets = exchangeState?.supportedAssets || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetSymbol || !amount) {
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

    const amountInSmallestUnit = BigInt(Math.floor(numAmount * Math.pow(10, Number(asset.decimals))));

    createDeposit.mutate(
      { assetSymbol, amount: amountInSmallestUnit },
      {
        onSuccess: (deposit) => {
          toast.success(`Deposit request created and is pending admin review. Reference: ${deposit.id}`);
          setAmount('');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to create deposit');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          Deposit
        </CardTitle>
        <CardDescription>Create a deposit request for admin processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-asset">Asset</Label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol}>
              <SelectTrigger id="deposit-asset">
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
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createDeposit.isPending}>
            {createDeposit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Deposit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
