import { Task } from '@/types/task';
import { calculateTaskMetrics, getPriorityLabel, getQuadrantLabel, getQuadrantColor } from '@/utils/taskCalculations';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Target, Zap, Weight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showMetrics?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, onClick, showMetrics = true, compact = false }: TaskCardProps) {
  const metrics = calculateTaskMetrics(task);
  const quadrantColor = getQuadrantColor(metrics.eisenhowerQuadrant);
  
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'complete': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.02] border-l-4",
        compact ? "p-3" : "p-4"
      )}
      style={{ borderLeftColor: quadrantColor }}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-card-foreground line-clamp-1",
              compact ? "text-sm" : "text-base"
            )}>
              {task.title}
            </h3>
            {task.description && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getStatusColor(task.status)} variant="secondary">
              {task.status.replace('-', ' ')}
            </Badge>
            {showMetrics && (
              <Badge variant="outline" className="font-mono text-xs">
                {metrics.priorityScore.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        {/* Category and Quadrant */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {task.category}
          </Badge>
          <span 
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ backgroundColor: `${quadrantColor}20`, color: quadrantColor }}
          >
            {getQuadrantLabel(metrics.eisenhowerQuadrant)}
          </span>
        </div>

        {/* Metrics Grid */}
        {showMetrics && !compact && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-analytics" />
              <span className="text-muted-foreground">Impact:</span>
              <span className="font-medium">{task.impact}/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Weight className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">Effort:</span>
              <span className="font-medium">{task.effort}/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-danger" />
              <span className="text-muted-foreground">Urgency:</span>
              <span className="font-medium">{task.urgency}/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{formatTime(task.estimatedTime)}</span>
            </div>
          </div>
        )}

        {/* Priority and Scheduling Weight */}
        {showMetrics && !compact && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs">
              <span className="text-muted-foreground">Priority:</span>
              <span className="ml-1 font-semibold text-primary">
                {getPriorityLabel(metrics.priorityScore)}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Weight:</span>
              <span className="ml-1 font-mono font-medium">
                {metrics.schedulingWeight.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due: {task.deadline.toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}