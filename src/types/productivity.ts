export interface ProductivityWeights {
  importance: number;
  urgency: number;
  impact: number;
  effort: number;
  learningVelocity: number;
  decisionEnablement: number;
  energyRequired: number;
  skillGrowth: number;
  momentum: number;
}

export interface SchedulingPreferences {
  algorithm: 'weighted' | 'matrixHybrid' | 'oodaOptimized';
  maxTasksPerDay: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  preferBatching: boolean;
  energyManagement: boolean;
  maxCognitiveHours: number;
  deepWorkBlocks: number;
}

export interface UserProductivityProfile {
  id?: string;
  userId: string;
  profileName: string;
  basedOnTemplate: string;
  scoringWeights: ProductivityWeights;
  schedulingPreferences: SchedulingPreferences;
  energyCurve: number[]; // 6 values for different times of day
  adaptiveLearningEnabled: boolean;
  autoAdjustWeights: boolean;
  completionRateTarget: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductivityPersonality {
  id: string;
  name: string;
  description: string;
  icon: string;
  scoringWeights: ProductivityWeights;
  schedulingPreferences: SchedulingPreferences;
  energyCurve: number[];
}

export interface TaskWithPersonalizedScore extends Task {
  personalizedScore?: number;
  personalizedQuadrant?: 1 | 2 | 3 | 4;
  energyAlignment?: number;
  batchingBonus?: number;
}

import { Task } from './task';