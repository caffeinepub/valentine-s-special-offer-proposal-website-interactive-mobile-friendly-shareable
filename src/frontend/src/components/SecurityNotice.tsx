import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

export function SecurityNotice() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold">Important Security Notice</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p className="font-medium">
            This tool is NOT a private key finder or wallet scanner. It only generates new random keys.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>All key generation happens locally in your browser</li>
            <li>No keys are transmitted to any server or stored anywhere</li>
            <li>This tool cannot find or recover existing wallet keys</li>
            <li>Generated keys are for educational and testing purposes only</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Client-Side Only</AlertTitle>
          <AlertDescription className="text-sm">
            All cryptographic operations run entirely in your browser. Your keys never leave your device.
          </AlertDescription>
        </Alert>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Your Responsibility</AlertTitle>
          <AlertDescription className="text-sm">
            You are solely responsible for securely storing any generated keys. Never share private keys with anyone.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
