import { PricingSettingsForm } from '../PricingSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure exchange preferences
        </p>
      </div>

      <PricingSettingsForm />
    </div>
  );
}
