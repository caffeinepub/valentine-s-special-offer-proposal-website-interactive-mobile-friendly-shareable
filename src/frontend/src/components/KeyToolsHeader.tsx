import { Button } from '@/components/ui/button';
import { Key, Github } from 'lucide-react';

export function KeyToolsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Bitcoin WIF Tools</h1>
            <p className="text-xs text-muted-foreground">Secure Key Generation</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/bitcoin/bips/blob/master/bip-0038.mediawiki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Documentation</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
