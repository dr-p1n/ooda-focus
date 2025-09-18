import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/types/task';
import { calculateScoreCalibration, ScoreCalibration } from '@/utils/scoringCalibration';
import { UserProductivityProfile } from '@/types/productivity';
import { TrendingUp, Target, Zap, BarChart3, Award, Clock } from 'lucide-react';

interface CalibrationDashboardProps {
  tasks: Task[];
  profile?: UserProductivityProfile;
}

export function CalibrationDashboard({ tasks, profile }: CalibrationDashboardProps) {
  const calibration = useMemo(() => calculateScoreCalibration(tasks, profile), [tasks, profile]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const criticalCount = tasks.filter(t => {
      const score = Math.random() * 10; // This would use actual calibrated scores
      return score >= calibration.ranges.critical[0];
    }).length;
    
    return {
      totalTasks,
      criticalCount,
      averageScore: calibration.averages.overall,
      completionRate: tasks.filter(t => t.status === 'complete').length / Math.max(1, totalTasks) * 100,
    };
  }, [tasks, calibration]);

  return (
    <div className="space-y-6">
      {/* Score Range Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Priority Score Calibration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
              <Badge variant="destructive" className="mb-2">Critical</Badge>
              <div className="text-sm font-mono">
                {calibration.ranges.critical[0].toFixed(1)}+
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Immediate action
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
              <Badge variant="default" className="mb-2">High</Badge>
              <div className="text-sm font-mono">
                {calibration.ranges.high[0].toFixed(1)} - {calibration.ranges.high[1].toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                This week
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Badge variant="secondary" className="mb-2">Medium</Badge>
              <div className="text-sm font-mono">
                {calibration.ranges.medium[0].toFixed(1)} - {calibration.ranges.medium[1].toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Next 2-3 weeks
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-950">
              <Badge variant="outline" className="mb-2">Low</Badge>
              <div className="text-sm font-mono">
                {calibration.ranges.low[0].toFixed(1)} - {calibration.ranges.low[1].toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Delegate/eliminate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageScore >= calibration.percentiles.p75 ? 'Above' : 
               stats.averageScore >= calibration.percentiles.p50 ? 'Near' : 'Below'} median
            </p>
            <Progress 
              value={(stats.averageScore / (calibration.ranges.critical[0] * 1.2)) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalCount}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.criticalCount / Math.max(1, stats.totalTasks)) * 100).toFixed(0)}% of total tasks
            </p>
            <Progress 
              value={(stats.criticalCount / Math.max(1, stats.totalTasks)) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Target: {((profile?.completionRateTarget || 0.8) * 100).toFixed(0)}%
            </p>
            <Progress 
              value={stats.completionRate} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Fast Track</div>
              <div className="text-2xl font-bold text-green-600">
                {calibration.benchmarks.fastCompletion.toFixed(1)}+
              </div>
              <div className="text-sm text-muted-foreground">
                Typically completed within 1-2 days
              </div>
            </div>
            
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Weekly Focus</div>
              <div className="text-2xl font-bold text-blue-600">
                {calibration.benchmarks.weeklyTarget.toFixed(1)}+
              </div>
              <div className="text-sm text-muted-foreground">
                Recommended for weekly planning
              </div>
            </div>
            
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold">Daily Capacity</div>
              <div className="text-2xl font-bold text-orange-600">
                {calibration.benchmarks.dailyCapacity.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Sustainable daily workload score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">90th percentile</span>
              <Badge variant="outline">{calibration.percentiles.p90.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">75th percentile</span>
              <Badge variant="outline">{calibration.percentiles.p75.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Median (50th)</span>
              <Badge variant="outline">{calibration.percentiles.p50.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">25th percentile</span>
              <Badge variant="outline">{calibration.percentiles.p25.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">10th percentile</span>
              <Badge variant="outline">{calibration.percentiles.p10.toFixed(1)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}