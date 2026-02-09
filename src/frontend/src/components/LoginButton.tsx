import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      onClick={handleAuth}
      disabled={isLoggingIn}
      className="gap-2"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Logging in...</span>
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Login</span>
        </>
      )}
    </Button>
  );
}
