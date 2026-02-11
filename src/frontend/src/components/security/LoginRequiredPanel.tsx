import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';

export function LoginRequiredPanel() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LogIn className="h-6 w-6 text-primary" />
          <CardTitle>Login Required</CardTitle>
        </div>
        <CardDescription>
          Please log in to access the admin panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Sign in with Internet Identity using the login button in the header to access admin features.
            Only the application owner can access the admin panel.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
