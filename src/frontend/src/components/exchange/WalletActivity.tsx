import { useGetExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export function WalletActivity() {
  const { data: exchangeState, isLoading } = useGetExchangeState();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
  const trades = exchangeState?.trades || [];

  // Combine all activities and sort by timestamp
  const activities: Array<{
    type: 'deposit' | 'withdrawal' | 'trade';
    timestamp: bigint;
    details: string;
    status?: string;
  }> = [
    ...deposits.map(([_, d]) => ({
      type: 'deposit' as const,
      timestamp: d.timestamp,
      details: `Deposit ${Number(d.amount) / Math.pow(10, Number(d.asset.decimals))} ${d.asset.symbol}`,
      status: d.status,
    })),
    ...withdrawals.map(([_, w]) => ({
      type: 'withdrawal' as const,
      timestamp: w.timestamp,
      details: `Withdrawal ${Number(w.amount) / Math.pow(10, Number(w.asset.decimals))} ${w.asset.symbol}`,
      status: w.status,
    })),
    ...trades.map(([_, t]) => ({
      type: 'trade' as const,
      timestamp: t.timestamp,
      details: `${t.type === 'buy' ? 'Buy' : 'Sell'} ${Number(t.inputAmount) / Math.pow(10, Number(t.inputAsset.decimals))} ${t.inputAsset.symbol}`,
      status: t.status,
    })),
  ].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest transactions and trades</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <Alert>
            <AlertDescription>No recent activity</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.slice(0, 10).map((activity, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{activity.details}</TableCell>
                    <TableCell>
                      {activity.status && (
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(Number(activity.timestamp / BigInt(1000000))).toLocaleString()}
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
