import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { ExchangeAppShell } from './components/ExchangeAppShell';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <ExchangeAppShell />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
