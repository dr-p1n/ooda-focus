import { useState, useMemo } from 'react';
import { Task, ViewMode, FilterOptions, SortOption } from '@/types/task';
import { calculateTaskMetrics, sortTasks, generateOptimalSchedule } from '@/utils/taskCalculations';
import { TaskCard } from '@/components/TaskCard';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { ImpactCostPlot } from '@/components/ImpactCostPlot';
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
  Award
} from 'lucide-react';

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
        const metrics = calculateTaskMetrics(task);
        matchesScore = metrics.priorityScore >= filters.scoreRange[0] && 
                      metrics.priorityScore <= filters.scoreRange[1];
      }
      
      return matchesSearch && matchesStatus && matchesCategory && matchesScore;
    });

    return sortTasks(filtered, sortBy);
  }, [tasks, searchQuery, filters, sortBy]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const incompleteTasks = tasks.filter(t => t.status !== 'complete');
    const completedTasks = tasks.filter(t => t.status === 'complete');
    
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const averagePriority = incompleteTasks.length > 0 
      ? incompleteTasks.reduce((sum, task) => sum + calculateTaskMetrics(task).priorityScore, 0) / incompleteTasks.length
      : 0;
    
    const highPriorityTasks = incompleteTasks.filter(task => calculateTaskMetrics(task).priorityScore >= 7).length;
    
    const totalEstimatedTime = incompleteTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
    
    return {
      totalTasks,
      incompleteTasks: incompleteTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      averagePriority,
      highPriorityTasks,
      totalEstimatedTime,
    };
  }, [tasks]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const optimizedSchedule = generateOptimalSchedule(tasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenta</h1>
          <p className="text-muted-foreground">
            Time cost balance sheet through Eisenhower Matrix and Impact/Cost analysis
          </p>
        </div>
        <Button onClick={onCreateTask} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Dashboard Metrics */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{dashboardMetrics.incompleteTasks}</div>
                  <div className="text-sm text-muted-foreground">Active Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-success" />
                <div>
                  <div className="text-2xl font-bold">{dashboardMetrics.completionRate.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-warning" />
                <div>
                  <div className="text-2xl font-bold">{dashboardMetrics.highPriorityTasks}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-analytics" />
                <div>
                  <div className="text-2xl font-bold">{formatTime(dashboardMetrics.totalEstimatedTime)}</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tabs and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewMode)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="eisenhower" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Matrix
            </TabsTrigger>
            <TabsTrigger value="impact-cost" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Impact/Cost
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
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
      <div className="min-h-[600px]">
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Tasks ({filteredAndSortedTasks.length})
                </h3>
                <Badge variant="outline" className="font-mono">
                  Avg Priority: {dashboardMetrics.averagePriority.toFixed(1)}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredAndSortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
                {filteredAndSortedTasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Optimal Schedule Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-analytics" />
                    OODA Optimized Schedule
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Recommended task sequence for maximum decision velocity
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {optimizedSchedule.slice(0, 10).map((task, index) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick?.(task)}
                        compact={true}
                        showMetrics={false}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'eisenhower' && (
          <EisenhowerMatrix tasks={filteredAndSortedTasks} onTaskClick={onTaskClick} />
        )}

        {activeView === 'impact-cost' && (
          <ImpactCostPlot tasks={filteredAndSortedTasks} onTaskClick={onTaskClick} />
        )}

        {activeView === 'schedule' && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Schedule View</h3>
            <p className="text-muted-foreground">
              Advanced scheduling interface coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}