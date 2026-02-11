import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useGetOwnershipStatus, useIsOwner } from '../hooks/useRewardQueries';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { DashboardPage } from './taskora/pages/DashboardPage';
import { EarnPage } from './taskora/pages/EarnPage';
import { VipPage } from './taskora/pages/VipPage';
import { TransfersPage } from './taskora/pages/TransfersPage';
import { AdminPanelPage } from './taskora/pages/AdminPanelPage';
import { ProfileSetupModal } from './ProfileSetupModal';
import { ClaimOwnershipCard } from './security/ClaimOwnershipCard';
import { AccessDeniedPanel } from './security/AccessDeniedPanel';
import { LoginRequiredPanel } from './security/LoginRequiredPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

type PageType = 'dashboard' | 'earn' | 'vip' | 'transfers' | 'admin';

export function ExchangeAppShell() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: ownershipStatus, isLoading: ownershipLoading } = useGetOwnershipStatus();
  const { data: isOwner, isLoading: isOwnerLoading } = useIsOwner();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Initialize page from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove '#'
    const path = hash.startsWith('/') ? hash.slice(1) : hash; // Remove leading '/'
    
    if (path && ['dashboard', 'earn', 'vip', 'transfers', 'admin'].includes(path)) {
      setCurrentPage(path as PageType);
    }
  }, []);

  // Update URL when page changes
  useEffect(() => {
    window.location.hash = `#/${currentPage}`;
  }, [currentPage]);

  // Listen for hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const path = hash.startsWith('/') ? hash.slice(1) : hash;
      
      if (path && ['dashboard', 'earn', 'vip', 'transfers', 'admin'].includes(path)) {
        setCurrentPage(path as PageType);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
    // Admin page requires special handling
    if (currentPage === 'admin') {
      // Must be logged in
      if (!isAuthenticated) {
        return <LoginRequiredPanel />;
      }

      // Loading ownership status
      if (ownershipLoading || isOwnerLoading) {
        return (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        );
      }

      // No owner set - show claim ownership card
      if (ownershipStatus && !ownershipStatus.hasOwner) {
        return <ClaimOwnershipCard />;
      }

      // Owner is set but caller is not the owner
      if (!isOwner) {
        return <AccessDeniedPanel />;
      }

      // Caller is the owner - show admin panel
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
