import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { TradeTicket } from '../TradeTicket';
import { TradeHistory } from '../TradeHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function TradePage() {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Access Required</CardTitle>
            <CardDescription>
              Please log in to access trading features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} disabled={loginStatus === 'logging-in'}>
              <LogIn className="mr-2 h-4 w-4" />
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Log In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trade</h1>
        <p className="text-muted-foreground mt-2">
          Buy and sell cryptocurrencies
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TradeTicket />
        <TradeHistory />
      </div>
    </div>
  );
}
