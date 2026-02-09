import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { MiningHeader } from './MiningHeader';
import { MiningDashboard } from './MiningDashboard';
import { MiningSettings } from './MiningSettings';
import { Payouts } from './Payouts';
import { ProfileSetupModal } from './ProfileSetupModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

type Section = 'dashboard' | 'settings' | 'payouts';

export function MiningAppShell() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <MiningHeader activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Bitcoin Mining</CardTitle>
              <CardDescription>
                Sign in to access your mining dashboard, configure your operations, and manage payouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                onClick={login}
                disabled={loginStatus === 'logging-in'}
                className="gap-2"
              >
                <LogIn className="h-5 w-5" />
                {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardContent>
          </Card>
        </main>
        <footer className="border-t py-6 px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} · Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <>
        <MiningHeader activeSection={activeSection} onSectionChange={setActiveSection} />
        <ProfileSetupModal />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MiningHeader activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {activeSection === 'dashboard' && <MiningDashboard />}
        {activeSection === 'settings' && <MiningSettings />}
        {activeSection === 'payouts' && <Payouts />}
      </main>
      <footer className="border-t py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
