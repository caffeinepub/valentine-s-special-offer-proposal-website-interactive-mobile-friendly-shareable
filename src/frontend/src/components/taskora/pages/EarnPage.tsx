import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useGetCallerEarningClaims, useGetVIPStatus } from '../../../hooks/useRewardQueries';
import { useLocalEarnCatalog, getVIPDailyEarnings } from '../../../hooks/useLocalEarnCatalog';
import { useLocalEarnQuota } from '../../../hooks/useLocalEarnQuota';
import { useLocalEarnClaims } from '../../../hooks/useLocalEarnClaims';
import { toast } from 'sonner';
import { DollarSign, CheckCircle2, Clock, XCircle, Loader2, Play, Trophy, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function EarnPage() {
  const { data: vipStatus, isLoading: vipLoading } = useGetVIPStatus();
  const { data: backendClaims, isLoading: claimsLoading } = useGetCallerEarningClaims();
  
  const vipTier = (vipStatus?.tier || 'basic') as 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond';
  const localItems = useLocalEarnCatalog(vipTier);
  const { incrementAds, incrementTasks, getAdLimits, getTaskLimits } = useLocalEarnQuota(vipTier);
  const { claims: localClaims, addClaim } = useLocalEarnClaims();

  const [watchingAd, setWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(30);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskProof, setTaskProof] = useState('');

  const adLimits = getAdLimits();
  const taskLimits = getTaskLimits();

  // Ad timer countdown
  useEffect(() => {
    if (watchingAd && adTimer > 0) {
      const timer = setTimeout(() => setAdTimer(adTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [watchingAd, adTimer]);

  const handleWatchAd = () => {
    if (!adLimits.canWatch) {
      toast.error(`Daily ad limit reached (${adLimits.max}). Come back tomorrow!`);
      return;
    }
    setWatchingAd(true);
    setAdTimer(30);
  };

  const handleClaimAd = () => {
    const adItem = localItems.find(i => i.type === 'ad');
    if (!adItem) return;

    incrementAds();
    addClaim({
      type: 'ad',
      title: adItem.title,
      reward: adItem.reward,
    });
    
    toast.success(`Ad claim submitted! $${adItem.reward.toFixed(2)} pending admin approval.`);
    setWatchingAd(false);
    setAdTimer(30);
  };

  const handleOpenTaskDialog = () => {
    if (!taskLimits.canComplete) {
      toast.error(`Daily task limit reached (${taskLimits.max}). Come back tomorrow!`);
      return;
    }
    setTaskProof('');
    setTaskDialogOpen(true);
  };

  const handleSubmitTask = () => {
    if (!taskProof.trim()) {
      toast.error('Please provide proof of task completion');
      return;
    }

    const taskItem = localItems.find(i => i.type === 'task');
    if (!taskItem) return;

    incrementTasks();
    addClaim({
      type: 'task',
      title: taskItem.title,
      reward: taskItem.reward,
      proof: taskProof.trim(),
    });

    toast.success(`Task claim submitted! $${taskItem.reward.toFixed(2)} pending admin approval.`);
    setTaskDialogOpen(false);
  };

  if (vipLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const adItem = localItems.find(i => i.type === 'ad');
  const taskItem = localItems.find(i => i.type === 'task');
  const dailyPotential = getVIPDailyEarnings(vipTier);

  const allClaims = [
    ...localClaims.map(c => ({
      id: c.id,
      title: c.title,
      reward: c.reward,
      status: c.status,
      timestamp: BigInt(c.timestamp * 1_000_000),
      adminMessage: null,
    })),
    ...(backendClaims || []).map(c => ({
      id: c.id,
      title: 'Backend Task',
      reward: Number(c.rewardAmount) / 100,
      status: c.status as string,
      timestamp: c.created,
      adminMessage: c.adminMessage,
    })),
  ].sort((a, b) => Number(b.timestamp - a.timestamp));

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };

  const statusVariants = {
    pending: 'secondary' as const,
    approved: 'default' as const,
    rejected: 'destructive' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Earn Rewards</h1>
        <p className="text-muted-foreground">Watch ads and complete tasks to earn USDT</p>
      </div>

      {/* VIP Status & Daily Limits */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {vipTier.toUpperCase()} Member
              </CardTitle>
              <CardDescription>Daily earning potential: ${dailyPotential.toFixed(2)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Ads Today: {adLimits.used} / {adLimits.max}</span>
              <span className="text-muted-foreground">{adLimits.remaining} remaining</span>
            </div>
            <Progress value={(adLimits.used / adLimits.max) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasks Today: {taskLimits.used} / {taskLimits.max}</span>
              <span className="text-muted-foreground">{taskLimits.remaining} remaining</span>
            </div>
            <Progress value={(taskLimits.used / taskLimits.max) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ad Card */}
        {adItem && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{adItem.title}</CardTitle>
                  <CardDescription className="mt-1">{adItem.description}</CardDescription>
                </div>
                <Badge variant="default" className="ml-2">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {adItem.reward.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!adLimits.canWatch ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Daily limit reached. Come back tomorrow!
                  </AlertDescription>
                </Alert>
              ) : watchingAd ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{adTimer}s</div>
                    <p className="text-sm text-muted-foreground">Please wait while the ad plays...</p>
                  </div>
                  <Progress value={((30 - adTimer) / 30) * 100} className="h-2" />
                  <Button 
                    onClick={handleClaimAd} 
                    disabled={adTimer > 0}
                    className="w-full"
                  >
                    {adTimer > 0 ? `Wait ${adTimer}s` : 'Claim Reward'}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleWatchAd} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Ad
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Card */}
        {taskItem && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{taskItem.title}</CardTitle>
                  <CardDescription className="mt-1">{taskItem.description}</CardDescription>
                </div>
                <Badge variant="default" className="ml-2">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {taskItem.reward.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!taskLimits.canComplete ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Daily limit reached. Come back tomorrow!
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={handleOpenTaskDialog} className="w-full">
                  Submit Task
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Claim History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Claims</CardTitle>
          <CardDescription>Track the status of your submitted claims</CardDescription>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : allClaims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No claims submitted yet</p>
              <p className="text-sm">Start earning by watching ads or completing tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{claim.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(claim.timestamp) / 1_000_000), { addSuffix: true })}
                    </p>
                    {claim.adminMessage && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Admin: {claim.adminMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${claim.reward.toFixed(2)}
                    </span>
                    <Badge variant={statusVariants[claim.status as keyof typeof statusVariants] || 'secondary'}>
                      <span className="flex items-center gap-1">
                        {statusIcons[claim.status as keyof typeof statusIcons]}
                        {claim.status}
                      </span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Task Completion</DialogTitle>
            <DialogDescription>
              {taskItem?.title} - ${taskItem?.reward.toFixed(2)} reward
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Proof of Completion *</Label>
              <Textarea
                id="proof"
                placeholder="Describe what you did or provide a link/screenshot URL..."
                value={taskProof}
                onChange={(e) => setTaskProof(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Provide details or evidence that you completed the task
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTask}>
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
