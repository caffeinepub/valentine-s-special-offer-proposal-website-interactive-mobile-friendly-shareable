import { useExchangeState } from '../../hooks/useExchangeQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet } from 'lucide-react';

export function WalletBalances() {
  const { data: exchangeState, isLoading, error } = useExchangeState();

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

  const balances = exchangeState?.balances || [];
  const supportedAssets = exchangeState?.supportedAssets || [];

  // Create a map of balances
  const balanceMap = new Map(balances.map(([symbol, balance]) => [symbol, balance]));

  // Show all supported assets with zero balance if not present
  const displayBalances = supportedAssets.map((asset) => {
    const balance = balanceMap.get(asset.symbol);
    return {
      asset,
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
        <CardDescription>Your available cryptocurrency balances</CardDescription>
      </CardHeader>
      <CardContent>
        {displayBalances.length === 0 ? (
          <Alert>
            <AlertDescription>No assets available</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Available Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBalances.map(({ asset, available }) => (
                  <TableRow key={asset.symbol}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {available.toFixed(Number(asset.decimals))} {asset.symbol}
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
