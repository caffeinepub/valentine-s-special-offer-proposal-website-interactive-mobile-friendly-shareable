import { MarketsTable } from '../MarketsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function MarketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
        <p className="text-muted-foreground mt-2">
          Live cryptocurrency prices with exchange markup
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrency Prices</CardTitle>
          <CardDescription>
            Real-time market data with exchange pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketsTable />
        </CardContent>
      </Card>
    </div>
  );
}
