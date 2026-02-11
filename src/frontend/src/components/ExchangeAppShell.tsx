import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCurrentUserAdmin } from '../hooks/useQueries';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { DashboardPage } from './taskora/pages/DashboardPage';
import { EarnPage } from './taskora/pages/EarnPage';
import { VipPage } from './taskora/pages/VipPage';
import { TransfersPage } from './taskora/pages/TransfersPage';
import { AdminPanelPage } from './taskora/pages/AdminPanelPage';
import { ProfileSetupModal } from './ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldOff, Heart } from 'lucide-react';

type PageType = 'dashboard' | 'earn' | 'vip' | 'transfers' | 'admin';

export function ExchangeAppShell() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Show loading skeleton during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 border-b border-border bg-card">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Admin page requires authentication and admin role
    if (currentPage === 'admin') {
      if (!isAuthenticated) {
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>Please log in to access the admin panel</CardDescription>
            </CardHeader>
          </Card>
        );
      }

      if (!isAdmin) {
        return (
          <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin panel. Only administrators can view this page.
            </AlertDescription>
          </Alert>
        );
      }

      return <AdminPanelPage />;
    }

    // All other pages require authentication
    if (!isAuthenticated) {
      return (
        <Card className="max-w-2xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to access Taskora Global features</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sign in with Internet Identity to start earning rewards, upgrade your VIP status, and manage your account.
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'earn':
        return <EarnPage />;
      case 'vip':
        return <VipPage />;
      case 'transfers':
        return <TransfersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ExchangeHeader currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {renderPage()}
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            © {new Date().getFullYear()} Taskora Global. Built with <Heart className="h-4 w-4 text-accent fill-accent" /> using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
