import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { validateAndDeriveFromWIF } from '@/utils/bitcoinWif';
import { CopyField } from './CopyField';

export function WifVerifier() {
  const [wifInput, setWifInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    error?: string;
    publicKey?: string;
    address?: string;
    compressed?: boolean;
  } | null>(null);

  const handleVerify = async () => {
    if (!wifInput.trim()) {
      setResult({
        valid: false,
        error: 'Please enter a WIF private key to verify.',
      });
      return;
    }

    setVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const validationResult = await validateAndDeriveFromWIF(wifInput.trim());
      setResult(validationResult);
    } catch (error) {
      setResult({
        valid: false,
        error: 'An unexpected error occurred during verification.',
      });
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = () => {
    setWifInput('');
    setResult(null);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          WIF Key Verifier
        </CardTitle>
        <CardDescription>
          Paste a WIF private key to verify its format and derive the corresponding public key and address.
          Verification happens locally - your key is never transmitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="wif-input">WIF Private Key</Label>
          <Textarea
            id="wif-input"
            placeholder="Enter WIF key (e.g., KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn)"
            value={wifInput}
            onChange={(e) => setWifInput(e.target.value)}
            className="font-mono text-sm min-h-[100px]"
            disabled={verifying}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            disabled={verifying || !wifInput.trim()}
            className="flex-1"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify WIF
              </>
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={verifying}
          >
            Clear
          </Button>
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {result.valid ? (
              <>
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Valid WIF key! {result.compressed ? 'Compressed format.' : 'Uncompressed format.'}
                  </AlertDescription>
                </Alert>

                <CopyField
                  label="Public Key (Hex)"
                  value={result.publicKey!}
                  description="Derived public key from the private key."
                />
                
                <CopyField
                  label="Bitcoin Address (P2PKH)"
                  value={result.address!}
                  description="The Bitcoin address associated with this key."
                />
              </>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.error || 'Invalid WIF format.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
