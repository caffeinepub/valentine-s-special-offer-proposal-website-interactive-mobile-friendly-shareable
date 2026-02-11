import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldOff, Lock } from 'lucide-react';

export function AccessDeniedPanel() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldOff className="h-6 w-6 text-destructive" />
          <CardTitle>Access Denied</CardTitle>
        </div>
        <CardDescription>
          You do not have permission to access the admin panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Owner Access Only</AlertTitle>
          <AlertDescription>
            Admin access is restricted to the application owner authenticated via Internet Identity.
            Only the owner account can view and manage admin functions.
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Admin Panel Features (Owner Only):</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Manage USDT deposit addresses (TRC20 & ERC20)</li>
            <li>Process pending deposit requests</li>
            <li>Process pending withdrawal requests</li>
            <li>Approve or reject earning claims</li>
            <li>Approve or reject VIP upgrade requests</li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          If you believe you should have admin access, please contact the application owner.
          There is no password-based admin login system.
        </p>
      </CardContent>
    </Card>
  );
}
