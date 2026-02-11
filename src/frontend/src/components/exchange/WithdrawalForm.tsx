import { useState } from 'react';
import { useRequestExchangeWithdrawal, useGetExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'ICP', name: 'Internet Computer' },
];

export function WithdrawalForm() {
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const { data: exchangeState } = useGetExchangeState();
  const requestWithdrawal = useRequestExchangeWithdrawal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter a destination address');
      return;
    }

    // Check balance
    const balancesMap = new Map(exchangeState?.balances || []);
    const balance = balancesMap.get(asset);
    const assetInfo = exchangeState?.supportedAssets.find(a => a.symbol === asset);
    
    if (balance && assetInfo) {
      const availableBalance = Number(balance.available) / Math.pow(10, Number(assetInfo.decimals));
      if (amountNum > availableBalance) {
        toast.error('Insufficient balance');
        return;
      }
    }

    try {
      await requestWithdrawal.mutateAsync({
        assetSymbol: asset,
        amount: Math.floor(amountNum * 100),
        destinationAddress: address.trim(),
      });
      toast.success('Withdrawal request submitted! Awaiting admin processing.');
      setAmount('');
      setAddress('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>Submit a withdrawal request for admin processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawal-asset">Asset</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger id="withdrawal-asset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_ASSETS.map(a => (
                  <SelectItem key={a.symbol} value={a.symbol}>
                    {a.name} ({a.symbol})
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
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdrawal-address">Destination Address</Label>
            <Input
              id="withdrawal-address"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={requestWithdrawal.isPending}>
            {requestWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Withdrawal Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
