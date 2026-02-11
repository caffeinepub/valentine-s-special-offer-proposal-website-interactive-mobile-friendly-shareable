import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAccountSummary, useGetRecentActivity } from '../../../hooks/useRewardQueries';
import { Wallet, TrendingUp, Award, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function DashboardPage() {
  const { data: accountSummary, isLoading: summaryLoading, error: summaryError } = useGetAccountSummary();
  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useGetRecentActivity();

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (summaryError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const vipTierLabels = {
    basic: 'Basic',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    diamond: 'Diamond',
  };

  const vipTierColors = {
    basic: 'secondary',
    bronze: 'default',
    silver: 'secondary',
    gold: 'default',
    diamond: 'default',
  } as const;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card via-card to-accent/10 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Taskora Global</h1>
          <p className="text-muted-foreground">Your reward-based earning platform</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <img 
            src="/assets/generated/taskora-hero.dim_1400x800.png" 
            alt="" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountSummary?.balance.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">USDT equivalent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Status</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {vipTierLabels[accountSummary?.vipTier || 'basic']}
            </div>
            <Badge variant={vipTierColors[accountSummary?.vipTier || 'basic']}>
              {accountSummary?.hasPendingUpgrade ? 'Upgrade Pending' : 'Active'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountSummary?.totalEarnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All-time rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions and claims</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : activityError ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load activity</AlertDescription>
            </Alert>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start earning by completing tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(activity.timestamp) / 1_000_000), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activity.amount && (
                      <span className="font-semibold text-accent">
                        +${activity.amount.toFixed(2)}
                      </span>
                    )}
                    <Badge variant={
                      activity.status === 'approved' || activity.status === 'completed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
