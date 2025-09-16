import { Task } from '@/types/task';
import { calculateTaskMetrics } from '@/utils/taskCalculations';
import { TaskCard } from '@/components/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function EisenhowerMatrix({ tasks, onTaskClick }: EisenhowerMatrixProps) {
  // Group tasks by quadrant
  const quadrants = {
    1: tasks.filter(task => calculateTaskMetrics(task).eisenhowerQuadrant === 1),
    2: tasks.filter(task => calculateTaskMetrics(task).eisenhowerQuadrant === 2),
    3: tasks.filter(task => calculateTaskMetrics(task).eisenhowerQuadrant === 3),
    4: tasks.filter(task => calculateTaskMetrics(task).eisenhowerQuadrant === 4),
  };

  const quadrantConfig = {
    1: {
      title: 'Do First',
      subtitle: 'Urgent & Important',
      description: 'Crisis situations, emergencies, deadline-driven projects',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      badgeColor: 'bg-red-100 text-red-800',
    },
    2: {
      title: 'Schedule',
      subtitle: 'Important, Not Urgent',
      description: 'Strategic planning, skill development, relationship building',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      badgeColor: 'bg-green-100 text-green-800',
    },
    3: {
      title: 'Delegate',
      subtitle: 'Urgent, Not Important',
      description: 'Interruptions, some calls, some emails, some meetings',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    4: {
      title: 'Eliminate',
      subtitle: 'Neither Urgent nor Important',
      description: 'Time wasters, excessive social media, pointless activities',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600',
      badgeColor: 'bg-gray-100 text-gray-600',
    },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Eisenhower Decision Matrix</h2>
        <p className="text-muted-foreground">
          Organize tasks by urgency and importance to optimize decision-making
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((quadrant) => {
          const config = quadrantConfig[quadrant as keyof typeof quadrantConfig];
          const quadrantTasks = quadrants[quadrant as keyof typeof quadrants];
          
          return (
            <Card 
              key={quadrant} 
              className={`${config.bgColor} ${config.borderColor} border-2`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-lg font-bold ${config.textColor}`}>
                      Quadrant {quadrant}: {config.title}
                    </CardTitle>
                    <p className={`text-sm font-medium ${config.textColor} opacity-80`}>
                      {config.subtitle}
                    </p>
                  </div>
                  <Badge className={`${config.badgeColor} font-mono`}>
                    {quadrantTasks.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {config.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {quadrantTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in this quadrant</p>
                  </div>
                ) : (
                  quadrantTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      compact={true}
                      showMetrics={false}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-surface">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-danger">{quadrants[1].length}</div>
              <div className="text-sm text-muted-foreground">Crisis Mode</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{quadrants[2].length}</div>
              <div className="text-sm text-muted-foreground">Strategic Work</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{quadrants[3].length}</div>
              <div className="text-sm text-muted-foreground">Distractions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">{quadrants[4].length}</div>
              <div className="text-sm text-muted-foreground">Time Wasters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}