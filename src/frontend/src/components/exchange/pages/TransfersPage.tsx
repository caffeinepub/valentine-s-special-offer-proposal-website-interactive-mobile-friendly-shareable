import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { useGetUsdtDepositAddresses } from '../../../hooks/useExchangeQueries';
import { DepositForm } from '../DepositForm';
import { WithdrawalForm } from '../WithdrawalForm';
import { TransfersHistory } from '../TransfersHistory';
import { SimulationDisclosure } from '../SimulationDisclosure';
import { CopyField } from '../../CopyField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, Wallet, Info } from 'lucide-react';

export function TransfersPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: depositAddresses, isLoading: addressesLoading } = useGetUsdtDepositAddresses();

  if (!identity) {
    return (
      <div className="space-y-6">
        <SimulationDisclosure />
        
        <Card>
          <CardHeader>
            <CardTitle>Transfer Access Required</CardTitle>
            <CardDescription>
              Please log in to access deposit and withdrawal features
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
        <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
        <p className="text-muted-foreground mt-2">
          Deposit and withdraw cryptocurrencies
        </p>
      </div>

      {/* USDT Deposit Addresses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            USDT Deposit Addresses
          </CardTitle>
          <CardDescription>
            Send USDT to these addresses for deposits. Deposits are processed manually by the admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addressesLoading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              <CopyField
                label="USDT (TRC20) Address"
                value={depositAddresses?.trc20Address || 'Not set yet'}
                description="Tron network (TRC20) - Lower fees"
              />
              <CopyField
                label="USDT (ERC20) Address"
                value={depositAddresses?.erc20Address || 'Not set yet'}
                description="Ethereum network (ERC20) - Higher fees"
              />
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  After sending USDT to one of these addresses, create a deposit request below. 
                  The admin will verify and credit your account manually.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <DepositForm />
        <WithdrawalForm />
      </div>

      <TransfersHistory />
    </div>
  );
}
