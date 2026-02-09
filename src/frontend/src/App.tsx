import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { MiningAppShell } from './components/MiningAppShell';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <MiningAppShell />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
