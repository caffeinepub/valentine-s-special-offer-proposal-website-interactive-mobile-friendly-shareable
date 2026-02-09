import { LoginButton } from './LoginButton';
import { Button } from '@/components/ui/button';
import { Activity, Settings, Wallet } from 'lucide-react';
import { SiBitcoin } from 'react-icons/si';

type Section = 'dashboard' | 'settings' | 'payouts';

interface MiningHeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function MiningHeader({ activeSection, onSectionChange }: MiningHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <SiBitcoin className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Bitcoin Mining</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('dashboard')}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={activeSection === 'payouts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('payouts')}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Payouts
            </Button>
          </nav>
        </div>
        <LoginButton />
      </div>
      <nav className="md:hidden border-t">
        <div className="container mx-auto flex items-center justify-around px-2 py-2">
          <Button
            variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSectionChange('dashboard')}
            className="gap-1 flex-1"
          >
            <Activity className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button
            variant={activeSection === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSectionChange('settings')}
            className="gap-1 flex-1"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">Settings</span>
          </Button>
          <Button
            variant={activeSection === 'payouts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSectionChange('payouts')}
            className="gap-1 flex-1"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-xs">Payouts</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
