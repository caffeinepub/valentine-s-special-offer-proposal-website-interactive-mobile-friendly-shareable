import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { generateKeySet } from '@/utils/bitcoinWif';
import { CopyField } from './CopyField';
import { toast } from 'sonner';

export function WifGenerator() {
  const [generating, setGenerating] = useState(false);
  const [keySet, setKeySet] = useState<{
    wif: string;
    publicKey: string;
    address: string;
  } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Add slight delay for UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 300));
      const newKeySet = await generateKeySet();
      setKeySet(newKeySet);
      toast.success('New WIF key generated successfully!');
    } catch (error) {
      toast.error('Failed to generate key. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          WIF Key Generator
        </CardTitle>
        <CardDescription>
          Generate a new random Bitcoin private key in WIF format with derived public key and P2PKH address.
          All generation happens locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="lg"
            className="min-w-[200px]"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Key
              </>
            )}
          </Button>
        </div>

        {keySet && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <CopyField
              label="Private Key (WIF Compressed)"
              value={keySet.wif}
              description="Keep this secret! Anyone with this key can access the funds."
              sensitive
            />
            
            <CopyField
              label="Public Key (Hex)"
              value={keySet.publicKey}
              description="Derived from the private key using secp256k1 elliptic curve."
            />
            
            <CopyField
              label="Bitcoin Address (P2PKH)"
              value={keySet.address}
              description="This is the address where you can receive Bitcoin."
            />

            <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Remember:</strong> This key was generated randomly. 
                It has never been used before and has zero balance. Store it securely if you plan to use it.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
