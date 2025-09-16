import { Task } from '@/types/task';
import { calculateTaskMetrics } from '@/utils/taskCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid3x3, TrendingUp, Target, Zap, Clock } from 'lucide-react';
import { useState } from 'react';

interface UnifiedInfographicProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task | null) => void;
}

export function UnifiedInfographic({ tasks, selectedTask, onTaskSelect }: UnifiedInfographicProps) {
  const [viewMode, setViewMode] = useState<'eisenhower' | 'impact-cost'>('eisenhower');

  const incompleteTasks = tasks.filter(t => t.status !== 'complete');

  const renderEisenhowerMatrix = () => {
    const quadrants = {
      urgent_important: incompleteTasks.filter(t => t.urgency >= 3 && t.importance >= 3),
      not_urgent_important: incompleteTasks.filter(t => t.urgency < 3 && t.importance >= 3),
      urgent_not_important: incompleteTasks.filter(t => t.urgency >= 3 && t.importance < 3),
      not_urgent_not_important: incompleteTasks.filter(t => t.urgency < 3 && t.importance < 3),
    };

    const QuadrantCard = ({ 
      title, 
      subtitle, 
      tasks, 
      bgColor 
    }: { 
      title: string; 
      subtitle: string; 
      tasks: Task[]; 
      bgColor: string; 
    }) => (
      <div className={`p-3 rounded-lg border ${bgColor} min-h-[120px]`}>
        <div className="text-xs font-semibold text-foreground mb-1">{title}</div>
        <div className="text-xs text-muted-foreground mb-2">{subtitle}</div>
        <div className="space-y-1">
          {tasks.slice(0, 3).map(task => (
            <div 
              key={task.id}
              className={`text-xs p-2 rounded cursor-pointer hover:bg-background/50 ${
                selectedTask?.id === task.id ? 'bg-primary/20 border border-primary/30' : 'bg-background/30'
              }`}
              onClick={() => onTaskSelect(task)}
            >
              <div className="font-medium truncate">{task.title}</div>
              <div className="text-muted-foreground">
                Score: {calculateTaskMetrics(task).priorityScore.toFixed(1)}
              </div>
            </div>
          ))}
          {tasks.length > 3 && (
            <div className="text-xs text-muted-foreground">+{tasks.length - 3} more</div>
          )}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-3">
        <QuadrantCard
          title="DO FIRST"
          subtitle="Urgent & Important"
          tasks={quadrants.urgent_important}
          bgColor="bg-destructive/10 border-destructive/20"
        />
        <QuadrantCard
          title="SCHEDULE"
          subtitle="Important, Not Urgent"
          tasks={quadrants.not_urgent_important}
          bgColor="bg-success/10 border-success/20"
        />
        <QuadrantCard
          title="DELEGATE"
          subtitle="Urgent, Not Important"
          tasks={quadrants.urgent_not_important}
          bgColor="bg-warning/10 border-warning/20"
        />
        <QuadrantCard
          title="ELIMINATE"
          subtitle="Neither Urgent nor Important"
          tasks={quadrants.not_urgent_not_important}
          bgColor="bg-muted/10 border-muted/20"
        />
      </div>
    );
  };

  const renderImpactCostPlot = () => {
    const maxImpact = Math.max(...incompleteTasks.map(t => t.impact), 3);
    const maxEffort = Math.max(...incompleteTasks.map(t => t.effort), 3);

    return (
      <div className="relative h-64 bg-muted/10 rounded-lg border p-4">
        {/* Axes */}
        <div className="absolute bottom-4 left-4 right-4 h-px bg-border"></div>
        <div className="absolute bottom-4 left-4 top-4 w-px bg-border"></div>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
          Effort →
        </div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-muted-foreground origin-center">
          Impact →
        </div>

        {/* Quadrant Labels */}
        <div className="absolute top-6 left-6 text-xs font-semibold text-success">High Impact<br/>Low Effort</div>
        <div className="absolute top-6 right-6 text-xs font-semibold text-warning">High Impact<br/>High Effort</div>
        <div className="absolute bottom-12 left-6 text-xs font-semibold text-muted-foreground">Low Impact<br/>Low Effort</div>
        <div className="absolute bottom-12 right-6 text-xs font-semibold text-destructive">Low Impact<br/>High Effort</div>

        {/* Tasks as dots */}
        {incompleteTasks.map(task => {
          const x = (task.effort / maxEffort) * 80 + 5; // 5% to 85% of width
          const y = 80 - (task.impact / maxImpact) * 70; // Invert Y axis, 10% to 80% of height
          const metrics = calculateTaskMetrics(task);
          
          return (
            <div
              key={task.id}
                 className={`absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                selectedTask?.id === task.id 
                  ? 'bg-primary scale-150 ring-2 ring-primary/50' 
                  : metrics.priorityScore >= 6 
                    ? 'bg-destructive hover:scale-125'
                    : metrics.priorityScore >= 4 
                      ? 'bg-warning hover:scale-125'
                      : 'bg-success hover:scale-125'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onTaskSelect(task)}
              title={`${task.title} (Impact: ${task.impact}, Effort: ${task.effort})`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {viewMode === 'eisenhower' ? <Grid3x3 className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
            Strategic Analysis
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'eisenhower' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('eisenhower')}
              className="text-xs"
            >
              Matrix
            </Button>
            <Button
              variant={viewMode === 'impact-cost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('impact-cost')}
              className="text-xs"
            >
              Plot
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'eisenhower' ? renderEisenhowerMatrix() : renderImpactCostPlot()}
        
        {/* Selected Task Details */}
        {selectedTask && (
          <div className="p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">{selectedTask.title}</h4>
              <Badge variant="outline" className="text-xs">
                {selectedTask.category}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Priority: {calculateTaskMetrics(selectedTask).priorityScore.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time: {Math.floor(selectedTask.estimatedTime / 60)}h {selectedTask.estimatedTime % 60}m
              </div>
              <div>Importance: {selectedTask.importance}/3</div>
              <div>Urgency: {selectedTask.urgency}/3</div>
              <div>Impact: {selectedTask.impact}/3</div>
              <div>Effort: {selectedTask.effort}/3</div>
            </div>
            {selectedTask.description && (
              <p className="text-sm text-muted-foreground mt-2">{selectedTask.description}</p>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-success/10 rounded border border-success/20">
            <div className="font-semibold text-success">{incompleteTasks.filter(t => calculateTaskMetrics(t).priorityScore < 4).length}</div>
            <div className="text-muted-foreground">Low Priority</div>
          </div>
          <div className="p-2 bg-warning/10 rounded border border-warning/20">
            <div className="font-semibold text-warning">{incompleteTasks.filter(t => {
              const score = calculateTaskMetrics(t).priorityScore;
              return score >= 4 && score < 6;
            }).length}</div>
            <div className="text-muted-foreground">Medium Priority</div>
          </div>
          <div className="p-2 bg-destructive/10 rounded border border-destructive/20">
            <div className="font-semibold text-destructive">{incompleteTasks.filter(t => calculateTaskMetrics(t).priorityScore >= 6).length}</div>
            <div className="text-muted-foreground">High Priority</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}