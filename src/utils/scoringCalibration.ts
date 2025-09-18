import { Task } from '@/types/task';
import { calculateTaskMetrics } from './taskCalculations';
import { UserProductivityProfile } from '@/types/productivity';

export interface ScoreCalibration {
  ranges: {
    critical: [number, number];    // 9+ 
    high: [number, number];        // 6-8.99
    medium: [number, number];      // 3-5.99
    low: [number, number];         // 0-2.99
  };
  percentiles: {
    p90: number;
    p75: number;
    p50: number;
    p25: number;
    p10: number;
  };
  averages: {
    overall: number;
    byStatus: {
      complete: number;
      'in-progress': number;
      incomplete: number;
    };
    byQuadrant: {
      1: number; // Do First
      2: number; // Schedule  
      3: number; // Delegate
      4: number; // Eliminate
    };
  };
  benchmarks: {
    fastCompletion: number;    // Tasks typically completed within 1 day
    weeklyTarget: number;      // Recommended weekly focus threshold
    dailyCapacity: number;     // Sustainable daily workload score
  };
}

export interface TaskWithCalibration extends Task {
  calibratedScore: number;
  scorePercentile: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  scoreInterpretation: string;
  benchmarkComparison: {
    isFastTrack: boolean;      // Above fast completion threshold
    isWeeklyFocus: boolean;    // Above weekly target
    isDailyCapacity: boolean;  // Within daily capacity
  };
}

export function calculateScoreCalibration(tasks: Task[], profile?: UserProductivityProfile): ScoreCalibration {
  if (tasks.length === 0) {
    // Default calibration for empty task list
    return {
      ranges: {
        critical: [9, 15],
        high: [6, 8.99],
        medium: [3, 5.99],
        low: [0, 2.99],
      },
      percentiles: { p90: 8, p75: 6, p50: 4, p25: 2, p10: 1 },
      averages: {
        overall: 4,
        byStatus: { complete: 5, 'in-progress': 4.5, incomplete: 3.5 },
        byQuadrant: { 1: 7, 2: 5, 3: 3, 4: 1 }
      },
      benchmarks: {
        fastCompletion: 7,
        weeklyTarget: 5,
        dailyCapacity: 20
      }
    };
  }

  const scores = tasks.map(task => calculateTaskMetrics(task, profile).priorityScore);
  const sortedScores = [...scores].sort((a, b) => b - a);
  
  // Calculate percentiles
  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * sortedScores.length) - 1;
    return sortedScores[Math.max(0, index)] || 0;
  };

  const percentiles = {
    p90: getPercentile(90),
    p75: getPercentile(75),
    p50: getPercentile(50),
    p25: getPercentile(25),
    p10: getPercentile(10),
  };

  // Calculate averages
  const overall = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const byStatus = {
    complete: calculateAverageByStatus(tasks, 'complete', profile),
    'in-progress': calculateAverageByStatus(tasks, 'in-progress', profile),
    incomplete: calculateAverageByStatus(tasks, 'incomplete', profile),
  };

  const byQuadrant = {
    1: calculateAverageByQuadrant(tasks, 1, profile),
    2: calculateAverageByQuadrant(tasks, 2, profile),
    3: calculateAverageByQuadrant(tasks, 3, profile),
    4: calculateAverageByQuadrant(tasks, 4, profile),
  };

  // Dynamic score ranges based on actual data distribution
  const ranges = {
    critical: [percentiles.p90, Math.max(percentiles.p90 * 1.5, sortedScores[0] || 15)] as [number, number],
    high: [percentiles.p75, percentiles.p90 - 0.01] as [number, number],
    medium: [percentiles.p25, percentiles.p75 - 0.01] as [number, number],
    low: [Math.min(0, sortedScores[sortedScores.length - 1] || 0), percentiles.p25 - 0.01] as [number, number],
  };

  // Intelligent benchmarks based on user behavior
  const benchmarks = {
    fastCompletion: percentiles.p75, // Top 25% typically completed quickly
    weeklyTarget: percentiles.p50,   // Median score for weekly planning
    dailyCapacity: overall * (profile?.schedulingPreferences.maxTasksPerDay || 6), // Sustainable daily load
  };

  return {
    ranges,
    percentiles,
    averages: { overall, byStatus, byQuadrant },
    benchmarks,
  };
}

function calculateAverageByStatus(tasks: Task[], status: Task['status'], profile?: UserProductivityProfile): number {
  const statusTasks = tasks.filter(t => t.status === status);
  if (statusTasks.length === 0) return 0;
  
  const scores = statusTasks.map(task => calculateTaskMetrics(task, profile).priorityScore);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function calculateAverageByQuadrant(tasks: Task[], quadrant: 1 | 2 | 3 | 4, profile?: UserProductivityProfile): number {
  const quadrantTasks = tasks.filter(task => {
    const metrics = calculateTaskMetrics(task, profile);
    return metrics.eisenhowerQuadrant === quadrant;
  });
  
  if (quadrantTasks.length === 0) return 0;
  
  const scores = quadrantTasks.map(task => calculateTaskMetrics(task, profile).priorityScore);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function calibrateTask(task: Task, calibration: ScoreCalibration, profile?: UserProductivityProfile): TaskWithCalibration {
  const metrics = calculateTaskMetrics(task, profile);
  const score = metrics.priorityScore;
  
  // Determine priority level
  let priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  if (score >= calibration.ranges.critical[0]) priorityLevel = 'critical';
  else if (score >= calibration.ranges.high[0]) priorityLevel = 'high';
  else if (score >= calibration.ranges.medium[0]) priorityLevel = 'medium';
  else priorityLevel = 'low';
  
  // Calculate percentile ranking
  const scorePercentile = calculatePercentileRank(score, calibration.percentiles);
  
  // Generate interpretation
  const scoreInterpretation = generateScoreInterpretation(score, priorityLevel, scorePercentile, calibration);
  
  // Benchmark comparisons
  const benchmarkComparison = {
    isFastTrack: score >= calibration.benchmarks.fastCompletion,
    isWeeklyFocus: score >= calibration.benchmarks.weeklyTarget,
    isDailyCapacity: true, // This would need more complex logic for daily planning
  };

  return {
    ...task,
    calibratedScore: Math.round(score * 10) / 10, // Round to 1 decimal
    scorePercentile,
    priorityLevel,
    scoreInterpretation,
    benchmarkComparison,
  };
}

function calculatePercentileRank(score: number, percentiles: ScoreCalibration['percentiles']): number {
  if (score >= percentiles.p90) return 90 + ((score - percentiles.p90) / (percentiles.p90 * 2)) * 10;
  if (score >= percentiles.p75) return 75 + ((score - percentiles.p75) / (percentiles.p90 - percentiles.p75)) * 15;
  if (score >= percentiles.p50) return 50 + ((score - percentiles.p50) / (percentiles.p75 - percentiles.p50)) * 25;
  if (score >= percentiles.p25) return 25 + ((score - percentiles.p25) / (percentiles.p50 - percentiles.p25)) * 25;
  if (score >= percentiles.p10) return 10 + ((score - percentiles.p10) / (percentiles.p25 - percentiles.p10)) * 15;
  return Math.max(0, (score / percentiles.p10) * 10);
}

function generateScoreInterpretation(
  score: number, 
  level: 'critical' | 'high' | 'medium' | 'low', 
  percentile: number,
  calibration: ScoreCalibration
): string {
  const roundedPercentile = Math.round(percentile);
  
  switch (level) {
    case 'critical':
      return `Critical priority (${score.toFixed(1)}) - Higher than ${roundedPercentile}% of tasks. Immediate attention required.`;
    case 'high':
      return `High priority (${score.toFixed(1)}) - Higher than ${roundedPercentile}% of tasks. Schedule this week.`;
    case 'medium':
      return `Medium priority (${score.toFixed(1)}) - Higher than ${roundedPercentile}% of tasks. Plan for upcoming weeks.`;
    case 'low':
      return `Low priority (${score.toFixed(1)}) - Higher than ${roundedPercentile}% of tasks. Consider delegating or eliminating.`;
    default:
      return `Priority score: ${score.toFixed(1)}`;
  }
}

export function getScoreBadgeVariant(level: 'critical' | 'high' | 'medium' | 'low'): 'destructive' | 'default' | 'secondary' | 'outline' {
  switch (level) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
  }
}