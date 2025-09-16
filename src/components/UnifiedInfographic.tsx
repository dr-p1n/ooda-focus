import { Task } from '@/types/task';
import { calculateTaskMetrics } from '@/utils/taskCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Target, Clock } from 'lucide-react';

interface UnifiedInfographicProps {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task | null) => void;
}

export function UnifiedInfographic({ tasks, selectedTask, onTaskSelect }: UnifiedInfographicProps) {
  const incompleteTasks = tasks.filter(t => t.status !== 'complete');

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
    <div className={`p-3 rounded-lg border ${bgColor} min-h-[160px] relative`}>
      <div className="text-xs font-semibold text-foreground mb-1">{title}</div>
      <div className="text-xs text-muted-foreground mb-2">{subtitle}</div>
      
      {/* Plot dots positioned within quadrant */}
      <div className="absolute inset-3 top-8">
        {tasks.map(task => {
          const metrics = calculateTaskMetrics(task);
          // Position based on impact (y) and effort (x) within the quadrant
          const x = ((task.effort - 1) / 2) * 70 + 15; // 15% to 85% of quadrant width
          const y = 70 - ((task.impact - 1) / 2) * 60; // 10% to 70% of quadrant height
          
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
              title={`${task.title} (Priority: ${metrics.priorityScore.toFixed(1)})`}
            />
          );
        })}
      </div>
      
      {/* Task count */}
      <div className="absolute bottom-2 right-2 text-xs font-semibold text-muted-foreground">
        {tasks.length}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5" />
          Strategic Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combined Matrix with Plot Dots */}
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