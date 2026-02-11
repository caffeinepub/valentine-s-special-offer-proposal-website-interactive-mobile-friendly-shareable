import { Button } from '@/components/ui/button';
import { LoginButton } from '../LoginButton';
import { useIsOwner, useGetOwnershipStatus } from '../../hooks/useRewardQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

type PageType = 'dashboard' | 'earn' | 'vip' | 'transfers' | 'admin';

interface ExchangeHeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function ExchangeHeader({ currentPage, onNavigate }: ExchangeHeaderProps) {
  const { data: isOwner } = useIsOwner();
  const { data: ownershipStatus } = useGetOwnershipStatus();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const hasNoOwner = ownershipStatus && !ownershipStatus.hasOwner;

  // Show Admin tab if:
  // 1. User is the owner, OR
  // 2. User is authenticated AND no owner exists yet (so they can claim ownership)
  const showAdminTab = isOwner || (isAuthenticated && hasNoOwner);

  const navItems: { id: PageType; label: string; ownerOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'earn', label: 'Earn' },
    { id: 'vip', label: 'VIP' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'admin', label: 'Admin', ownerOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/taskora-logo.dim_512x512.png" 
              alt="Taskora Global" 
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Taskora Global
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              // Hide admin tab based on ownership/auth logic
              if (item.ownerOnly && !showAdminTab) {
                return null;
              }

              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className="relative"
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <LoginButton />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <nav className="container mx-auto flex items-center gap-1 px-2 py-2 overflow-x-auto">
          {navItems.map((item) => {
            // Hide admin tab based on ownership/auth logic
            if (item.ownerOnly && !showAdminTab) {
              return null;
            }

            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="whitespace-nowrap"
              >
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
