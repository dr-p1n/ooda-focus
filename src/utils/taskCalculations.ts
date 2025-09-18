import { Task, TaskMetrics } from '@/types/task';
import { UserProductivityProfile, ProductivityWeights } from '@/types/productivity';

export function calculateTaskMetrics(task: Task, profile?: UserProductivityProfile): TaskMetrics {
  const weights = profile?.scoringWeights || getDefaultWeights();
  
  // Personalized Priority Score using configured weights
  const priorityScore = 
    (task.importance * weights.importance) +
    (task.urgency * weights.urgency) +
    (task.impact * weights.impact) -
    (task.effort * weights.effort) +
    (task.importance * weights.learningVelocity * 0.2) + // Learning velocity factor
    (task.impact * weights.skillGrowth * 0.15); // Skill growth factor
  
  // Scheduling Weight based on selected algorithm
  let schedulingWeight: number;
  const algorithm = profile?.schedulingPreferences.algorithm || 'weighted';
  
  switch (algorithm) {
    case 'matrixHybrid':
      schedulingWeight = calculateMatrixHybridScore(task, weights);
      break;
    case 'oodaOptimized':
      schedulingWeight = calculateOODAScore(task, weights);
      break;
    default:
      schedulingWeight = calculateWeightedScore(task, weights);
  }
  
  // Eisenhower Quadrant based on importance and urgency (with personalized thresholds)
  const importanceThreshold = 3 * (weights.importance / 1.0);
  const urgencyThreshold = 3 * (weights.urgency / 1.0);
  
  let eisenhowerQuadrant: 1 | 2 | 3 | 4;
  if (task.urgency >= urgencyThreshold && task.importance >= importanceThreshold) {
    eisenhowerQuadrant = 1; // Urgent + Important (Do First)
  } else if (task.urgency < urgencyThreshold && task.importance >= importanceThreshold) {
    eisenhowerQuadrant = 2; // Important but not Urgent (Schedule)
  } else if (task.urgency >= urgencyThreshold && task.importance < importanceThreshold) {
    eisenhowerQuadrant = 3; // Urgent but not Important (Delegate)
  } else {
    eisenhowerQuadrant = 4; // Neither (Eliminate)
  }
  
  // Impact/Effort Ratio with personalized weighting
  const impactEffortRatio = (task.impact * weights.impact) / Math.max(task.effort * weights.effort, 0.1);
  
  return {
    priorityScore,
    schedulingWeight,
    eisenhowerQuadrant,
    impactEffortRatio,
  };
}

function getDefaultWeights(): ProductivityWeights {
  return {
    importance: 1.0,
    urgency: 1.0,
    impact: 1.0,
    effort: 1.0,
    learningVelocity: 1.0,
    decisionEnablement: 1.0,
    energyRequired: 1.0,
    skillGrowth: 1.0,
    momentum: 1.0
  };
}

function calculateWeightedScore(task: Task, weights: ProductivityWeights): number {
  const timeWeight = Math.max(task.estimatedTime / 60, 0.1);
  const effortWeight = Math.max(task.effort * weights.effort, 0.1);
  const energyFactor = 1 / Math.max(weights.energyRequired, 0.1);
  
  return ((task.importance * weights.importance) * (task.impact * weights.impact) * energyFactor) / 
         (effortWeight * timeWeight);
}

function calculateMatrixHybridScore(task: Task, weights: ProductivityWeights): number {
  const eisenhowerScore = (task.importance * weights.importance) * (task.urgency * weights.urgency);
  const impactCostRatio = (task.impact * weights.impact) / Math.max(task.effort * weights.effort, 0.1);
  const timeEfficiency = (task.impact * weights.impact) / Math.max(task.estimatedTime / 60, 0.1);
  const momentumBonus = weights.momentum * 0.5;
  
  return eisenhowerScore + impactCostRatio + timeEfficiency + momentumBonus;
}

function calculateOODAScore(task: Task, weights: ProductivityWeights): number {
  // OODA Loop: Observe, Orient, Decide, Act
  const learningCycle = 
    (task.importance * weights.learningVelocity) + // Learning potential
    (task.impact * weights.decisionEnablement) + // Decision enabling
    (task.importance * weights.skillGrowth * 0.3); // Skill development
  
  const timeToValue = (task.impact * weights.impact) / 
                     ((task.estimatedTime / 60) * Math.max(task.effort * weights.effort, 0.1));
  
  const momentum = (task.urgency * weights.momentum) * 0.4;
  
  return learningCycle + timeToValue + momentum;
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
  if (score >= 6) return 'Critical';
  if (score >= 4) return 'High';
  if (score >= 2) return 'Medium';
  if (score >= 0) return 'Low';
  return 'Very Low';
}

export function sortTasks(tasks: Task[], sortBy: string, profile?: UserProductivityProfile): Task[] {
  return [...tasks].sort((a, b) => {
    const aMetrics = calculateTaskMetrics(a, profile);
    const bMetrics = calculateTaskMetrics(b, profile);
    
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

export function generateOptimalSchedule(tasks: Task[], profile?: UserProductivityProfile): Task[] {
  // Time cost balance optimization: prioritize high-value, low-effort tasks first
  return sortTasks(tasks.filter(t => t.status !== 'complete'), 'scheduling-weight-desc', profile);
}