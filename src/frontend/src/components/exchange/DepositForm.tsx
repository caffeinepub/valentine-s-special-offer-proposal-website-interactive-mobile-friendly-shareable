import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequestExchangeDeposit } from '../../hooks/useExchangeQueries';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'ICP', name: 'Internet Computer' },
];

export function DepositForm() {
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const requestDeposit = useRequestExchangeDeposit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await requestDeposit.mutateAsync({
        assetSymbol: asset,
        amount: Math.floor(amountNum * 100),
      });
      toast.success('Deposit request submitted! Awaiting admin review.');
      setAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Deposit</CardTitle>
        <CardDescription>Submit a deposit request for admin processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-asset">Asset</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger id="deposit-asset">
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
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full" disabled={requestDeposit.isPending}>
            {requestDeposit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Deposit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
