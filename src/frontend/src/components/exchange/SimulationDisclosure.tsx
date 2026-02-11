import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function SimulationDisclosure() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Manual Processing Required</AlertTitle>
      <AlertDescription>
        Taskora Global does not connect directly to blockchains or automatically generate deposit addresses. 
        All deposits and withdrawals are processed manually by the admin. 
        Deposit addresses are configured by the admin and must be verified before use.
      </AlertDescription>
    </Alert>
  );
}
