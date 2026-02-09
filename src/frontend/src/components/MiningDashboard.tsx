import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetMiningState, useGetMiningEvents, useStartMining, useStopMining } from '../hooks/useMining';
import { Play, Square, Zap, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function MiningDashboard() {
  const { data: miningState, isLoading: stateLoading } = useGetMiningState();
  const { data: events = [], isLoading: eventsLoading } = useGetMiningEvents();
  const startMining = useStartMining();
  const stopMining = useStopMining();

  const [currentRuntime, setCurrentRuntime] = useState(0);
  const [currentEarnings, setCurrentEarnings] = useState(0);

  const isActive = miningState?.isActive || false;
  const config = miningState?.config;

  useEffect(() => {
    if (!miningState || !isActive) {
      setCurrentRuntime(Number(miningState?.cumulativeRuntime || 0));
      setCurrentEarnings(Number(miningState?.cumulativeEarnings || 0));
      return;
    }

    const startTime = miningState.lastStartTimestamp ? Number(miningState.lastStartTimestamp) / 1_000_000 : Date.now();
    const baseRuntime = Number(miningState.cumulativeRuntime || 0);
    const baseEarnings = Number(miningState.cumulativeEarnings || 0);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentRuntime(baseRuntime + elapsed);
      
      const hashrate = Number(config?.targetHashrate || 0);
      const sessionEarnings = Math.floor((elapsed * hashrate) / 1000);
      setCurrentEarnings(baseEarnings + sessionEarnings);
    }, 1000);

    return () => clearInterval(interval);
  }, [miningState, isActive, config]);

  const handleStart = async () => {
    try {
      await startMining.mutateAsync();
      toast.success('Mining started successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start mining');
    }
  };

  const handleStop = async () => {
    try {
      await stopMining.mutateAsync();
      toast.success('Mining stopped successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop mining');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1_000_000) return `${(hashrate / 1_000_000).toFixed(2)} TH/s`;
    if (hashrate >= 1_000) return `${(hashrate / 1_000).toFixed(2)} GH/s`;
    return `${hashrate} MH/s`;
  };

  const formatSatoshis = (sats: number) => {
    return `${sats.toLocaleString()} sats`;
  };

  if (stateLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration Required</CardTitle>
          <CardDescription>
            Please configure your mining settings before starting operations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="relative rounded-lg overflow-hidden bg-cover bg-center min-h-[200px] flex items-center justify-center"
        style={{ backgroundImage: 'url(/assets/generated/mining-hero-bg.dim_1920x1080.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/80" />
        <div className="relative z-10 text-center space-y-4 p-6">
          <div className="flex items-center justify-center gap-3">
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isActive || startMining.isPending}
              className="gap-2"
            >
              {startMining.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              Start Mining
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              disabled={!isActive || stopMining.isPending}
              className="gap-2"
            >
              {stopMining.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              Stop Mining
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Hashrate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHashrate(Number(config.targetHashrate))}</div>
            <p className="text-xs text-muted-foreground mt-1">Target performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Runtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(currentRuntime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total mining time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSatoshis(currentEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest mining events and status changes</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No events yet. Start mining to see activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 10).map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{event.eventType}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.details || '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(Number(event.timestamp) / 1_000_000).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
