import { useExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

export function TransfersHistory() {
  const { data: exchangeState, isLoading } = useExchangeState();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
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

  const deposits = exchangeState?.deposits || [];
  const withdrawals = exchangeState?.withdrawals || [];

  const transfers = [
    ...deposits.map(([_, d]) => ({
      type: 'Deposit' as const,
      id: d.id,
      amount: Number(d.amount) / Math.pow(10, Number(d.asset.decimals)),
      asset: d.asset.symbol,
      status: d.status,
      timestamp: d.timestamp,
      reference: d.txId || d.id,
    })),
    ...withdrawals.map(([_, w]) => ({
      type: 'Withdrawal' as const,
      id: w.id,
      amount: Number(w.amount) / Math.pow(10, Number(w.asset.decimals)),
      asset: w.asset.symbol,
      status: w.status,
      timestamp: w.timestamp,
      reference: w.destinationAddress,
    })),
  ].sort((a, b) => Number(b.timestamp - a.timestamp));

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    if (status === 'completed') return 'default';
    if (status === 'pending') return 'secondary';
    return 'outline';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending';
    return status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transfer History
        </CardTitle>
        <CardDescription>Your deposit and withdrawal history</CardDescription>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <Alert>
            <AlertDescription>No transfer history yet</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <Badge variant="outline">{transfer.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {transfer.amount.toFixed(8)} {transfer.asset}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(transfer.status)}>
                        {getStatusLabel(transfer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground truncate max-w-[200px]">
                      {transfer.reference}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(Number(transfer.timestamp / BigInt(1000000))).toLocaleString()}
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
