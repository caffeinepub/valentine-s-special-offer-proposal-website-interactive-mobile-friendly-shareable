import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { WalletBalances } from '../WalletBalances';
import { WalletActivity } from '../WalletActivity';
import { SimulationDisclosure } from '../SimulationDisclosure';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function WalletPage() {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="space-y-6">
        <SimulationDisclosure />
        
        <Card>
          <CardHeader>
            <CardTitle>Wallet Access Required</CardTitle>
            <CardDescription>
              Please log in to view your wallet balances and transaction history
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
      <SimulationDisclosure />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground mt-2">
          View your balances and transaction history
        </p>
      </div>

      <WalletBalances />
      <WalletActivity />
    </div>
  );
}
