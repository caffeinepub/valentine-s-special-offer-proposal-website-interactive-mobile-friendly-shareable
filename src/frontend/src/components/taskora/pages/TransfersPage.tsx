import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationDisclosure } from '../../exchange/SimulationDisclosure';
import { CopyField } from '../../CopyField';
import { useGetUsdtAddresses, useRequestDeposit, useRequestWithdrawal, useGetTransferHistory } from '../../../hooks/useRewardQueries';
import { useLocalDepositProof } from '../../../hooks/useLocalDepositProof';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Clock, Upload, X, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function TransfersPage() {
  const { data: addresses, isLoading: addressesLoading } = useGetUsdtAddresses();
  const { data: transferHistory, isLoading: historyLoading } = useGetTransferHistory();
  const requestDeposit = useRequestDeposit();
  const requestWithdrawal = useRequestWithdrawal();
  const { txId, screenshot, setTxId, setScreenshot, clearProof } = useLocalDepositProof();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setScreenshot(file);
    }
  };

  const handleRequestDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await requestDeposit.mutateAsync({
        amount: Math.floor(amount * 100),
        txId: txId.trim() || null,
      });
      toast.success('Deposit request submitted! Awaiting admin approval.');
      setDepositAmount('');
      // Keep txId and screenshot for reference
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error('Please enter a withdrawal address');
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        amount: Math.floor(amount * 100),
        destinationAddress: withdrawAddress.trim(),
      });
      toast.success('Withdrawal request submitted! Awaiting admin processing.');
      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (addressesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const statusVariants = {
    pending: 'secondary' as const,
    completed: 'default' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transfers</h1>
        <p className="text-muted-foreground">Deposit and withdraw USDT</p>
      </div>

      <SimulationDisclosure />

      <Tabs defaultValue="deposit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="deposit">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit USDT</CardTitle>
              <CardDescription>Send USDT to one of the addresses below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyField
                label="USDT (TRC20) Address"
                value={addresses?.trc20Address || 'Not set yet'}
                description="Tron network - Lower fees"
              />
              <CopyField
                label="USDT (ERC20) Address"
                value={addresses?.erc20Address || 'Not set yet'}
                description="Ethereum network - Higher fees"
              />
              
              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (USDT)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tx-id">Transaction ID (Optional)</Label>
                  <Input
                    id="tx-id"
                    placeholder="Enter your transaction ID"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps admin verify your deposit faster
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Upload Screenshot (Stored Locally)</Label>
                  <div className="space-y-2">
                    {screenshot ? (
                      <div className="relative border rounded-lg p-2">
                        <img 
                          src={screenshot} 
                          alt="Deposit proof" 
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setScreenshot(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="screenshot-input" className="cursor-pointer text-sm text-primary hover:underline">
                          Click to upload screenshot
                        </Label>
                        <Input
                          id="screenshot-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotChange}
                        />
                      </div>
                    )}
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Screenshot is stored locally on your device only and is not uploaded to the backend. 
                      It's for your personal reference.
                    </AlertDescription>
                  </Alert>
                </div>

                <Button onClick={handleRequestDeposit} disabled={requestDeposit.isPending} className="w-full">
                  {requestDeposit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Deposit Request
                </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    After sending funds, submit this request. Admin will review and credit your account. 
                    Status remains "Pending" until admin approval.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw USDT</CardTitle>
              <CardDescription>Request a withdrawal to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="withdraw-address">Destination Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Your USDT wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Specify TRC20 or ERC20 in your address or notes
                </p>
              </div>
              <Button onClick={handleRequestWithdrawal} disabled={requestWithdrawal.isPending} className="w-full">
                {requestWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>Your deposit and withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !transferHistory || transferHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transfer history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transferHistory.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {transfer.type === 'deposit' ? (
                        <ArrowDownToLine className="h-4 w-4 text-accent" />
                      ) : (
                        <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="font-medium capitalize">{transfer.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(transfer.timestamp) / 1_000_000), { addSuffix: true })}
                    </p>
                    {transfer.txId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        TX: {transfer.txId}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${(Number(transfer.amount) / 100).toFixed(2)}
                    </span>
                    <Badge variant={statusVariants[transfer.status as 'pending' | 'completed'] || 'secondary'}>
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
