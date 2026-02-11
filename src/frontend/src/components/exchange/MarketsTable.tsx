import { useMarketPrices } from '../../hooks/useMarketPrices';
import { usePricingMarkup } from '../../hooks/usePricingMarkup';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MarketsTable() {
  const { data: prices, isLoading, error } = useMarketPrices();
  const { markup, applyMarkup } = usePricingMarkup();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load market prices. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No market data available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Reference Price</TableHead>
            <TableHead className="text-right">Exchange Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price) => {
            const exchangePrice = applyMarkup(price.price);
            const change24h = price.change24h || 0;
            const isPositive = change24h >= 0;

            return (
              <TableRow key={price.symbol}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{price.symbol}</div>
                    <div className="text-sm text-muted-foreground">{price.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${price.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-primary">
                  ${exchangePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-mono">
                      {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
