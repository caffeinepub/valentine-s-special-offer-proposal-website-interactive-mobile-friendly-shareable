import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';

export function ProfileSetupModal() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
    };

    try {
      await saveProfile.mutateAsync(profile);
      toast.success('Profile created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Bitcoin Mining</DialogTitle>
          <DialogDescription>
            Please enter your name to set up your profile and get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
