import { Task, TaskMetrics } from '@/types/task';

export function calculateTaskMetrics(task: Task): TaskMetrics {
  // Priority Score: importance + urgency + impact - effort
  const priorityScore = task.importance + task.urgency + task.impact - task.effort;
  
  // Scheduling Weight: (Importance × Impact) / (Effort × Time_Required)
  // Prevent division by zero
  const timeWeight = Math.max(task.estimatedTime / 60, 0.1); // Convert to hours, min 0.1
  const effortWeight = Math.max(task.effort, 0.1);
  const schedulingWeight = (task.importance * task.impact) / (effortWeight * timeWeight);
  
  // Eisenhower Quadrant based on importance and urgency
  let eisenhowerQuadrant: 1 | 2 | 3 | 4;
  if (task.urgency >= 4 && task.importance >= 4) {
    eisenhowerQuadrant = 1; // Urgent + Important (Do First)
  } else if (task.urgency < 4 && task.importance >= 4) {
    eisenhowerQuadrant = 2; // Important but not Urgent (Schedule)
  } else if (task.urgency >= 4 && task.importance < 4) {
    eisenhowerQuadrant = 3; // Urgent but not Important (Delegate)
  } else {
    eisenhowerQuadrant = 4; // Neither (Eliminate)
  }
  
  // Impact/Effort Ratio
  const impactEffortRatio = task.impact / Math.max(task.effort, 0.1);
  
  return {
    priorityScore,
    schedulingWeight,
    eisenhowerQuadrant,
    impactEffortRatio,
  };
}

export function getQuadrantColor(quadrant: 1 | 2 | 3 | 4): string {
  const colors = {
    1: 'hsl(var(--quadrant-1))', // Red - Urgent + Important
    2: 'hsl(var(--quadrant-2))', // Green - Important
    3: 'hsl(var(--quadrant-3))', // Amber - Urgent
    4: 'hsl(var(--quadrant-4))', // Gray - Neither
  };
  return colors[quadrant];
}

export function getQuadrantLabel(quadrant: 1 | 2 | 3 | 4): string {
  const labels = {
    1: 'Do First',
    2: 'Schedule',
    3: 'Delegate',
    4: 'Eliminate',
  };
  return labels[quadrant];
}

export function getPriorityLabel(score: number): string {
  if (score >= 10) return 'Critical';
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  if (score >= 1) return 'Low';
  return 'Very Low';
}

export function sortTasks(tasks: Task[], sortBy: string): Task[] {
  return [...tasks].sort((a, b) => {
    const aMetrics = calculateTaskMetrics(a);
    const bMetrics = calculateTaskMetrics(b);
    
    switch (sortBy) {
      case 'priority-desc':
        return bMetrics.priorityScore - aMetrics.priorityScore;
      case 'priority-asc':
        return aMetrics.priorityScore - bMetrics.priorityScore;
      case 'scheduling-weight-desc':
        return bMetrics.schedulingWeight - aMetrics.schedulingWeight;
      case 'deadline-asc':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      case 'impact-desc':
        return b.impact - a.impact;
      case 'effort-asc':
        return a.effort - b.effort;
      default:
        return bMetrics.schedulingWeight - aMetrics.schedulingWeight;
    }
  });
}

export function generateOptimalSchedule(tasks: Task[]): Task[] {
  // OODA Loop optimization: prioritize high-value, low-effort tasks first
  return sortTasks(tasks.filter(t => t.status !== 'complete'), 'scheduling-weight-desc');
}