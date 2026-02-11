import { useGetExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

export function TradeHistory() {
  const { data: exchangeState, isLoading } = useGetExchangeState();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trades = exchangeState?.trades || [];

  const tradeList = trades
    .map(([_, t]) => ({
      id: t.id,
      side: t.type === 'buy' ? 'Buy' : 'Sell',
      inputAmount: Number(t.inputAmount) / Math.pow(10, Number(t.inputAsset.decimals)),
      inputAsset: t.inputAsset.symbol,
      outputAmount: Number(t.outputAmount) / Math.pow(10, Number(t.outputAsset.decimals)),
      outputAsset: t.outputAsset.symbol,
      rate: t.rate,
      status: t.status,
      timestamp: t.timestamp,
    }))
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Trade History
        </CardTitle>
        <CardDescription>Your recent trades</CardDescription>
      </CardHeader>
      <CardContent>
        {tradeList.length === 0 ? (
          <Alert>
            <AlertDescription>No trades yet</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Side</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeList.slice(0, 10).map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>
                      <Badge variant={trade.side === 'Buy' ? 'default' : 'secondary'}>
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {trade.inputAmount.toFixed(8)} {trade.inputAsset}
                    </TableCell>
                    <TableCell className="font-mono">
                      ${trade.rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(Number(trade.timestamp / BigInt(1000000))).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
