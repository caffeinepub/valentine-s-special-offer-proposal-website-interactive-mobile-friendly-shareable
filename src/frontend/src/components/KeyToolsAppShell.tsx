import { KeyToolsHeader } from './KeyToolsHeader';
import { SecurityNotice } from './SecurityNotice';
import { WifGenerator } from './WifGenerator';
import { WifVerifier } from './WifVerifier';
import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';

export function KeyToolsAppShell() {
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname)
    : 'bitcoin-wif-tools';

  return (
    <div className="min-h-screen flex flex-col">
      <KeyToolsHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'url(/assets/generated/wallet-pattern.dim_1600x1600.png)',
              backgroundSize: '400px 400px',
              backgroundRepeat: 'repeat',
            }}
          />
          <div className="container relative py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Bitcoin WIF Key Tools
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Generate and verify Bitcoin Wallet Import Format (WIF) private keys securely in your browser
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>100% Client-Side • No Data Transmitted • Fully Private</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Notice */}
        <section className="container py-8">
          <SecurityNotice />
        </section>

        {/* Tools Section */}
        <section className="container py-12 space-y-12">
          <WifGenerator />
          <WifVerifier />
        </section>

        {/* Educational Section */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">About WIF Keys</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-3">What is WIF?</h3>
                <p className="text-muted-foreground">
                  Wallet Import Format (WIF) is a standardized way to encode Bitcoin private keys. 
                  It uses Base58Check encoding to create a human-readable string that can be easily 
                  imported into Bitcoin wallets.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-3">Compressed vs Uncompressed</h3>
                <p className="text-muted-foreground">
                  Compressed WIF keys (starting with 'K' or 'L') produce smaller transactions and are 
                  the modern standard. Uncompressed keys (starting with '5') are legacy format but 
                  still valid.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-3">Security Best Practices</h3>
                <p className="text-muted-foreground">
                  Never share your private keys. Store them securely offline. Use hardware wallets 
                  for significant amounts. This tool is for educational purposes and testing only.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-3">P2PKH Addresses</h3>
                <p className="text-muted-foreground">
                  Pay-to-Public-Key-Hash (P2PKH) addresses start with '1' on mainnet. They are derived 
                  from the public key using SHA-256 and RIPEMD-160 hashing algorithms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Bitcoin WIF Key Tools. All keys generated locally in your browser.
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <SiCaffeine className="h-4 w-4" />
                <span className="font-medium">caffeine.ai</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
