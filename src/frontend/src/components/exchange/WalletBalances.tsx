import { useGetExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet } from 'lucide-react';

export function WalletBalances() {
  const { data: exchangeState, isLoading, error } = useGetExchangeState();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load balances. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const supportedAssets = exchangeState?.supportedAssets || [];
  const balancesMap = new Map(exchangeState?.balances || []);

  const balances = supportedAssets.map((asset) => {
    const balance = balancesMap.get(asset.symbol);
    return {
      asset: asset.symbol,
      name: asset.name,
      available: balance ? Number(balance.available) / Math.pow(10, Number(asset.decimals)) : 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Balances
        </CardTitle>
        <CardDescription>Your cryptocurrency holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((balance) => (
                <TableRow key={balance.asset}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{balance.asset}</div>
                      <div className="text-sm text-muted-foreground">{balance.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {balance.available.toFixed(8)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
