import { Task } from '@/types/task';
import { calculateTaskMetrics } from '@/utils/taskCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImpactCostPlotProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function ImpactCostPlot({ tasks, onTaskClick }: ImpactCostPlotProps) {
  const plotWidth = 400;
  const plotHeight = 300;
  const padding = 40;

  // Filter out completed tasks for cleaner visualization
  const activeTasks = tasks.filter(task => task.status !== 'complete');

  const getPositionFromTask = (task: Task) => {
    // Impact (1-5) -> Y axis (high impact = top)
    const y = padding + ((5 - task.impact) / 4) * (plotHeight - 2 * padding);
    
    // Effort (1-5) -> X axis (low effort = left, high effort = right)
    const x = padding + ((task.effort - 1) / 4) * (plotWidth - 2 * padding);
    
    return { x, y };
  };

  const getQuadrantInfo = (impact: number, effort: number) => {
    if (impact >= 3.5 && effort <= 2.5) {
      return { 
        label: 'Quick Wins', 
        color: 'hsl(var(--success))',
        description: 'High impact, low effort - prioritize these!'
      };
    } else if (impact >= 3.5 && effort > 2.5) {
      return { 
        label: 'Major Projects', 
        color: 'hsl(var(--primary))',
        description: 'High impact, high effort - strategic investments'
      };
    } else if (impact < 3.5 && effort <= 2.5) {
      return { 
        label: 'Fill Ins', 
        color: 'hsl(var(--warning))',
        description: 'Low impact, low effort - filler tasks'
      };
    } else {
      return { 
        label: 'Thankless Tasks', 
        color: 'hsl(var(--danger))',
        description: 'Low impact, high effort - consider eliminating'
      };
    }
  };

  // Group tasks by quadrants for statistics
  const quadrantStats = {
    quickWins: activeTasks.filter(t => t.impact >= 3.5 && t.effort <= 2.5),
    majorProjects: activeTasks.filter(t => t.impact >= 3.5 && t.effort > 2.5),
    fillIns: activeTasks.filter(t => t.impact < 3.5 && t.effort <= 2.5),
    thanklessTasks: activeTasks.filter(t => t.impact < 3.5 && t.effort > 2.5),
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Impact vs Effort Analysis</h2>
        <p className="text-muted-foreground">
          Visualize task positioning to identify quick wins and strategic investments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Plot */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Positioning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative bg-surface border rounded-lg" style={{ width: plotWidth, height: plotHeight }}>
                  {/* Grid lines */}
                  <svg className="absolute inset-0" width={plotWidth} height={plotHeight}>
                    {/* Vertical grid lines */}
                    {[1, 2, 3, 4, 5].map(i => (
                      <line
                        key={`v-${i}`}
                        x1={padding + ((i - 1) / 4) * (plotWidth - 2 * padding)}
                        y1={padding}
                        x2={padding + ((i - 1) / 4) * (plotWidth - 2 * padding)}
                        y2={plotHeight - padding}
                        stroke="hsl(var(--border))"
                        strokeDasharray="2,2"
                      />
                    ))}
                    
                    {/* Horizontal grid lines */}
                    {[1, 2, 3, 4, 5].map(i => (
                      <line
                        key={`h-${i}`}
                        x1={padding}
                        y1={padding + ((5 - i) / 4) * (plotHeight - 2 * padding)}
                        x2={plotWidth - padding}
                        y2={padding + ((5 - i) / 4) * (plotHeight - 2 * padding)}
                        stroke="hsl(var(--border))"
                        strokeDasharray="2,2"
                      />
                    ))}

                    {/* Quadrant separator lines */}
                    <line
                      x1={plotWidth / 2}
                      y1={padding}
                      x2={plotWidth / 2}
                      y2={plotHeight - padding}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <line
                      x1={padding}
                      y1={plotHeight / 2}
                      x2={plotWidth - padding}
                      y2={plotHeight / 2}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      opacity="0.3"
                    />

                    {/* Axis labels */}
                    <text x={plotWidth / 2} y={plotHeight - 10} textAnchor="middle" className="fill-muted-foreground text-xs">
                      Effort →
                    </text>
                    <text x={15} y={plotHeight / 2} textAnchor="middle" className="fill-muted-foreground text-xs" transform={`rotate(-90, 15, ${plotHeight / 2})`}>
                      Impact →
                    </text>
                  </svg>

                  {/* Task points */}
                  <TooltipProvider>
                    {activeTasks.map((task) => {
                      const position = getPositionFromTask(task);
                      const metrics = calculateTaskMetrics(task);
                      const quadrant = getQuadrantInfo(task.impact, task.effort);
                      
                      return (
                        <Tooltip key={task.id}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-sm"
                              style={{
                                left: position.x - 8,
                                top: position.y - 8,
                                backgroundColor: quadrant.color,
                              }}
                              onClick={() => onTaskClick?.(task)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-sm">{task.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Impact: {task.impact}/5 • Effort: {task.effort}/5
                              </div>
                              <div className="text-xs" style={{ color: quadrant.color }}>
                                {quadrant.label}: {quadrant.description}
                              </div>
                              <div className="text-xs font-mono">
                                Priority Score: {metrics.priorityScore.toFixed(1)}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>

                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-2 text-xs font-medium text-success">Quick Wins</div>
                  <div className="absolute top-2 right-2 text-xs font-medium text-primary">Major Projects</div>
                  <div className="absolute bottom-8 left-2 text-xs font-medium text-warning">Fill Ins</div>
                  <div className="absolute bottom-8 right-2 text-xs font-medium text-danger">Thankless Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel */}
        <div className="space-y-4">
          <Card className="bg-gradient-success text-success-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{quadrantStats.quickWins.length}</div>
                <div className="text-sm opacity-90">Quick Wins</div>
                <div className="text-xs mt-2 opacity-75">High impact, low effort</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{quadrantStats.majorProjects.length}</div>
                <div className="text-sm opacity-90">Major Projects</div>
                <div className="text-xs mt-2 opacity-75">High impact, high effort</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning text-warning-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{quadrantStats.fillIns.length}</div>
                <div className="text-sm opacity-90">Fill Ins</div>
                <div className="text-xs mt-2 opacity-75">Low impact, low effort</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-danger text-danger-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{quadrantStats.thanklessTasks.length}</div>
                <div className="text-sm opacity-90">Avoid These</div>
                <div className="text-xs mt-2 opacity-75">Low impact, high effort</div>
              </div>
            </CardContent>
          </Card>

          {/* OODA Loop Insight */}
          <Card className="bg-analytics text-analytics-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-lg font-bold mb-2">OODA Optimization</div>
                <div className="text-sm opacity-90 mb-2">
                  Focus on Quick Wins first
                </div>
                <div className="text-xs opacity-75">
                  Complete {quadrantStats.quickWins.length} high-value, low-effort tasks to maximize decision-making cycles
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}