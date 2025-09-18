import { useState, useMemo } from 'react';
import { Task, ViewMode, FilterOptions, SortOption } from '@/types/task';
import { calculateTaskMetrics, sortTasks, generateOptimalSchedule } from '@/utils/taskCalculations';
import { calculateScoreCalibration, calibrateTask, getScoreBadgeVariant } from '@/utils/scoringCalibration';
import { TaskCard } from '@/components/TaskCard';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { ImpactCostPlot } from '@/components/ImpactCostPlot';
import { CalibrationDashboard } from '@/components/CalibrationDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Grid3x3, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Search,
  Filter,
  SortDesc,
  Target,
  Zap,
  Clock,
  Award,
  Settings,
  BarChart3
} from 'lucide-react';
import { ProductivityConfigDialog } from './ProductivityConfigDialog';
import { useProductivityProfile } from '@/hooks/useProductivityProfile';

interface ProductivityDashboardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onCreateTask?: () => void;
}

export function ProductivityDashboard({ tasks, onTaskClick, onCreateTask }: ProductivityDashboardProps) {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ status: 'all' });
  const [sortBy, setSortBy] = useState<SortOption>('scheduling-weight-desc');
  const [configOpen, setConfigOpen] = useState(false);
  const { profile } = useProductivityProfile();

  // Calculate calibration first
  const calibration = useMemo(() => calculateScoreCalibration(tasks, profile), [tasks, profile]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      
      const matchesCategory = !filters.category || task.category === filters.category;
      
      let matchesScore = true;
      if (filters.scoreRange) {
        const metrics = calculateTaskMetrics(task, profile);
        matchesScore = metrics.priorityScore >= filters.scoreRange[0] && 
                      metrics.priorityScore <= filters.scoreRange[1];
      }
      
      return matchesSearch && matchesStatus && matchesCategory && matchesScore;
    });

    return sortTasks(filtered, sortBy, profile);
  }, [tasks, searchQuery, filters, sortBy, profile]);

  // Create calibrated tasks
  const calibratedTasks = useMemo(() => {
    return filteredAndSortedTasks.map(task => calibrateTask(task, calibration, profile));
  }, [filteredAndSortedTasks, calibration, profile]);

  // Calculate dashboard metrics using calibrated data
  const dashboardMetrics = useMemo(() => {
    const totalTasks = calibratedTasks.length;
    const completeTasks = calibratedTasks.filter(t => t.status === 'complete').length;
    const inProgressTasks = calibratedTasks.filter(t => t.status === 'in-progress').length;
    const incompleteTasks = calibratedTasks.filter(t => t.status === 'incomplete').length;
    
    const completionRate = totalTasks > 0 ? (completeTasks / totalTasks) * 100 : 0;
    const averageScore = calibration.averages.overall;
    
    const criticalTasks = calibratedTasks.filter(t => t.priorityLevel === 'critical').length;
    const highPriorityTasks = calibratedTasks.filter(t => t.priorityLevel === 'high').length;
    
    const totalEstimatedTime = calibratedTasks
      .filter(t => t.status !== 'complete')
      .reduce((sum, task) => sum + task.estimatedTime, 0);

    return {
      totalTasks,
      completeTasks,
      inProgressTasks, 
      incompleteTasks,
      completionRate,
      averageScore,
      criticalTasks,
      highPriorityTasks,
      totalEstimatedTime,
    };
  }, [calibratedTasks, calibration]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenta</h1>
          <p className="text-muted-foreground">
            Calibrated task prioritization with personalized productivity profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          <Button variant="outline" onClick={() => setConfigOpen(true)} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardMetrics.incompleteTasks} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.completionRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                Target: {((profile?.completionRateTarget || 0.8) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.averageScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardMetrics.averageScore >= calibration.percentiles.p75 ? 'Above average' : 
                 dashboardMetrics.averageScore >= calibration.percentiles.p50 ? 'Near average' : 'Below average'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardMetrics.criticalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardMetrics.highPriorityTasks}</div>
              <p className="text-xs text-muted-foreground">
                Schedule this week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tabs and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewMode)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calibration">Score Calibration</TabsTrigger>
            <TabsTrigger value="eisenhower">Eisenhower Matrix</TabsTrigger>
            <TabsTrigger value="impact-cost">Impact/Cost Plot</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-48">
              <SortDesc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduling-weight-desc">Scheduling Weight</SelectItem>
              <SelectItem value="priority-desc">Priority (High)</SelectItem>
              <SelectItem value="priority-asc">Priority (Low)</SelectItem>
              <SelectItem value="deadline-asc">Deadline</SelectItem>
              <SelectItem value="impact-desc">Impact</SelectItem>
              <SelectItem value="effort-asc">Effort</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'all'} onValueChange={(value) => 
            setFilters({...filters, status: value === 'all' ? 'all' : value as any})
          }>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewMode)}>
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <div className="text-sm text-muted-foreground">
                  Showing {calibratedTasks.length} calibrated tasks
                </div>
              </div>
              {calibratedTasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks found matching your criteria.</p>
              ) : (
                <div className="space-y-3">
                  {calibratedTasks.map((task) => (
                    <div key={task.id} className="relative">
                      <TaskCard 
                        task={task} 
                        onClick={() => onTaskClick?.(task)}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge variant={getScoreBadgeVariant(task.priorityLevel)}>
                          {task.calibratedScore}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(task.scorePercentile)}%
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {task.scoreInterpretation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Optimized Schedule</h3>
              <div className="text-sm text-muted-foreground mb-4">
                Based on your productivity profile and calibrated scoring
              </div>
              {generateOptimalSchedule(tasks, profile).slice(0, 8).map((task, index) => {
                const calibratedTask = calibrateTask(task, calibration, profile);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {calibratedTask.scoreInterpretation}
                      </div>
                    </div>
                    <Badge variant={getScoreBadgeVariant(calibratedTask.priorityLevel)} className="text-xs">
                      {calibratedTask.calibratedScore}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calibration" className="space-y-6">
          <CalibrationDashboard tasks={tasks} profile={profile} />
        </TabsContent>

        <TabsContent value="eisenhower" className="space-y-6">
          <EisenhowerMatrix tasks={filteredAndSortedTasks} onTaskClick={onTaskClick} />
        </TabsContent>

        <TabsContent value="impact-cost" className="space-y-6">
          <ImpactCostPlot tasks={filteredAndSortedTasks} onTaskClick={onTaskClick} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Schedule View</h3>
            <p className="text-muted-foreground">
              Advanced scheduling interface coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <ProductivityConfigDialog 
        open={configOpen} 
        onOpenChange={setConfigOpen} 
      />
    </div>
  );
}