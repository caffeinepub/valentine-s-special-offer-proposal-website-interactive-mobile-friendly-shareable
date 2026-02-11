import { useState } from 'react';
import { usePlaceTrade, useExchangeState } from '../../hooks/useExchangeQueries';
import { useMarketPrices } from '../../hooks/useMarketPrices';
import { usePricingMarkup } from '../../hooks/usePricingMarkup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TrendingUp, Loader2 } from 'lucide-react';
import { Variant_buy_sell } from '../../backend';

export function TradeTicket() {
  const [pair, setPair] = useState('BTC/USDT');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  
  const { data: exchangeState } = useExchangeState();
  const { data: prices } = useMarketPrices();
  const { applyMarkup } = usePricingMarkup();
  const placeTrade = usePlaceTrade();

  const [baseAsset, quoteAsset] = pair.split('/');
  
  const basePrice = prices?.find((p) => p.symbol === baseAsset)?.price || 0;
  const exchangePrice = applyMarkup(basePrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const baseAssetInfo = exchangeState?.supportedAssets.find((a) => a.symbol === baseAsset);
    const quoteAssetInfo = exchangeState?.supportedAssets.find((a) => a.symbol === quoteAsset);

    if (!baseAssetInfo || !quoteAssetInfo) {
      toast.error('Invalid trading pair');
      return;
    }

    const amountInSmallestUnit = BigInt(Math.floor(numAmount * Math.pow(10, Number(baseAssetInfo.decimals))));

    placeTrade.mutate(
      {
        tradeType: side === 'buy' ? Variant_buy_sell.buy : Variant_buy_sell.sell,
        inputAssetSymbol: side === 'buy' ? quoteAsset : baseAsset,
        outputAssetSymbol: side === 'buy' ? baseAsset : quoteAsset,
        amount: amountInSmallestUnit,
      },
      {
        onSuccess: () => {
          toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order executed successfully!`);
          setAmount('');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to execute trade');
        },
      }
    );
  };

  const estimatedTotal = amount ? (parseFloat(amount) * exchangePrice).toFixed(2) : '0.00';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trade
        </CardTitle>
        <CardDescription>Place market orders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trading-pair">Trading Pair</Label>
            <Select value={pair} onValueChange={setPair}>
              <SelectTrigger id="trading-pair">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Side</Label>
            <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-amount">Amount ({baseAsset})</Label>
            <Input
              id="trade-amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-mono">${exchangePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Total:</span>
              <span className="font-mono font-semibold">${estimatedTotal} {quoteAsset}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={placeTrade.isPending}>
            {placeTrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {side === 'buy' ? 'Buy' : 'Sell'} {baseAsset}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
