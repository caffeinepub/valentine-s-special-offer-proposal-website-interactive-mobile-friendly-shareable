import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyFieldProps {
  label: string;
  value: string;
  description?: string;
  sensitive?: boolean;
}

export function CopyField({ label, value, description, sensitive = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!sensitive);

  const isEmpty = !value || value === '' || value === 'Not set yet';

  const handleCopy = async () => {
    if (isEmpty) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error('Copy error:', error);
    }
  };

  const displayValue = isEmpty ? value : (revealed ? value : '•'.repeat(Math.min(value.length, 64)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          {sensitive && !isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed(!revealed)}
              className="h-8 px-2"
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
            disabled={isEmpty}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div
        className={cn(
          "p-3 rounded-md border bg-muted/50 font-mono text-sm break-all",
          sensitive && !revealed && !isEmpty && "select-none",
          isEmpty && "text-muted-foreground italic"
        )}
      >
        {displayValue}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
