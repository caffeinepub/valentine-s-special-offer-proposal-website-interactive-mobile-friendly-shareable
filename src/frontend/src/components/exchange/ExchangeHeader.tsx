import { Button } from '@/components/ui/button';
import { LoginButton } from '../LoginButton';
import { useIsCurrentUserAdmin } from '../../hooks/useQueries';

type PageType = 'dashboard' | 'earn' | 'vip' | 'transfers' | 'admin';

interface ExchangeHeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function ExchangeHeader({ currentPage, onNavigate }: ExchangeHeaderProps) {
  const { data: isAdmin } = useIsCurrentUserAdmin();

  const navItems: { id: PageType; label: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'earn', label: 'Earn' },
    { id: 'vip', label: 'VIP' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'admin', label: 'Admin', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/taskora-logo.dim_512x512.png" 
              alt="Taskora Global Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-foreground">Taskora Global</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <LoginButton />
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-border">
        <nav className="container mx-auto px-4 flex items-center gap-1 py-2 overflow-x-auto">
          {visibleNavItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate(item.id)}
              className="whitespace-nowrap"
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
