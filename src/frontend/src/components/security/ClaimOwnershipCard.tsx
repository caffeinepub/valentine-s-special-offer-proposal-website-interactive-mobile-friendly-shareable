import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useClaimOwnership } from '../../hooks/useRewardQueries';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

const CONFIRMATION_TEXT = 'I CLAIM OWNERSHIP';

export function ClaimOwnershipCard() {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const claimOwnership = useClaimOwnership();

  const handleClaim = async () => {
    try {
      await claimOwnership.mutateAsync();
      toast.success('Ownership claimed successfully! You are now the admin.');
      setIsDialogOpen(false);
      setConfirmationInput('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isConfirmationValid = confirmationInput === CONFIRMATION_TEXT;

  return (
    <Card className="max-w-2xl mx-auto border-warning">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-warning" />
          <CardTitle>Claim Admin Ownership</CardTitle>
        </div>
        <CardDescription>
          This application is not yet secured. You must claim ownership to become the admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Security Notice</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              <strong>Admin access is tied to your Internet Identity principal.</strong> There is no password-based admin login.
            </p>
            <p>
              Once you claim ownership, only your Internet Identity account will have admin access. This action is permanent and cannot be undone.
            </p>
            <p>
              Make sure you are logged in with the Internet Identity account you want to use as the admin before claiming ownership.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">What happens when you claim ownership:</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Your Internet Identity becomes the permanent admin account</li>
            <li>You gain access to all admin functions (deposits, withdrawals, claims, VIP upgrades)</li>
            <li>No other user will be able to access admin features</li>
            <li>This action cannot be reversed or transferred</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full" size="lg">
              Claim Ownership
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Ownership Claim</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This is a permanent action. Your current Internet Identity will become the sole admin of this application.
                </p>
                <p>
                  To confirm, please type <strong>{CONFIRMATION_TEXT}</strong> below:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmation</Label>
                  <Input
                    id="confirmation"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder={CONFIRMATION_TEXT}
                    className="font-mono"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmationInput('')}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClaim}
                disabled={!isConfirmationValid || claimOwnership.isPending}
              >
                {claimOwnership.isPending ? 'Claiming...' : 'Claim Ownership'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
