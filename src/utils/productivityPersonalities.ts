import { ProductivityPersonality } from '@/types/productivity';

export const PRODUCTIVITY_PERSONALITIES: ProductivityPersonality[] = [
  {
    id: 'optimizer',
    name: 'The Optimizer',
    description: 'Maximum efficiency with quick wins and low-effort tasks',
    icon: '⚡',
    scoringWeights: {
      importance: 1.2,
      urgency: 1.5,
      impact: 1.0,
      effort: 2.0, // Heavy penalty for high effort
      learningVelocity: 0.8,
      decisionEnablement: 1.3,
      energyRequired: 1.5, // Prefer low-energy tasks
      skillGrowth: 1.0,
      momentum: 2.0 // High value on quick wins
    },
    schedulingPreferences: {
      algorithm: 'weighted',
      maxTasksPerDay: 8,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      preferBatching: true,
      energyManagement: true,
      maxCognitiveHours: 5,
      deepWorkBlocks: 1
    },
    energyCurve: [0.7, 1.0, 0.9, 0.8, 0.6, 0.4]
  },
  {
    id: 'deepWorker',
    name: 'The Deep Worker',
    description: 'Maximum impact through focused, transformational work',
    icon: '🎯',
    scoringWeights: {
      importance: 2.0,
      urgency: 0.7, // Less concerned with urgency
      impact: 2.5, // Heavily weight transformational work
      effort: 0.5, // Don\'t penalize high effort
      learningVelocity: 1.8,
      decisionEnablement: 1.5,
      energyRequired: 0.8, // Willing to invest energy
      skillGrowth: 2.0,
      momentum: 0.6 // Less need for quick wins
    },
    schedulingPreferences: {
      algorithm: 'matrixHybrid',
      maxTasksPerDay: 3,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      preferBatching: false,
      energyManagement: true,
      maxCognitiveHours: 7,
      deepWorkBlocks: 3
    },
    energyCurve: [0.8, 1.0, 1.0, 0.9, 0.7, 0.5]
  },
  {
    id: 'firefighter',
    name: 'The Firefighter',
    description: 'Reactive crisis mode with urgency-driven prioritization',
    icon: '🚨',
    scoringWeights: {
      importance: 1.0,
      urgency: 3.0, // Urgency dominates
      impact: 0.8,
      effort: 1.8, // Prefer quick fixes
      learningVelocity: 0.5,
      decisionEnablement: 2.0, // Unblock others quickly
      energyRequired: 1.2,
      skillGrowth: 0.7,
      momentum: 1.5
    },
    schedulingPreferences: {
      algorithm: 'weighted',
      maxTasksPerDay: 12,
      workingHoursStart: '08:00',
      workingHoursEnd: '18:00',
      preferBatching: false,
      energyManagement: false,
      maxCognitiveHours: 4,
      deepWorkBlocks: 1
    },
    energyCurve: [0.8, 0.9, 1.0, 1.0, 0.9, 0.7]
  },
  {
    id: 'learner',
    name: 'The Learner',
    description: 'Growth-focused with emphasis on skill development',
    icon: '📚',
    scoringWeights: {
      importance: 1.2,
      urgency: 0.9,
      impact: 1.3,
      effort: 0.7, // Don\'t mind effort if learning
      learningVelocity: 2.5, // Heavily weight learning
      decisionEnablement: 1.2,
      energyRequired: 0.8,
      skillGrowth: 2.0, // Prioritize skill development
      momentum: 1.1
    },
    schedulingPreferences: {
      algorithm: 'oodaOptimized',
      maxTasksPerDay: 5,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      preferBatching: true,
      energyManagement: true,
      maxCognitiveHours: 6,
      deepWorkBlocks: 2
    },
    energyCurve: [0.6, 0.8, 1.0, 0.9, 0.8, 0.6]
  },
  {
    id: 'balanced',
    name: 'The Balanced',
    description: 'Well-rounded approach balancing all factors equally',
    icon: '⚖️',
    scoringWeights: {
      importance: 1.0,
      urgency: 1.0,
      impact: 1.0,
      effort: 1.0,
      learningVelocity: 1.0,
      decisionEnablement: 1.0,
      energyRequired: 1.0,
      skillGrowth: 1.0,
      momentum: 1.0
    },
    schedulingPreferences: {
      algorithm: 'weighted',
      maxTasksPerDay: 6,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      preferBatching: true,
      energyManagement: true,
      maxCognitiveHours: 6,
      deepWorkBlocks: 2
    },
    energyCurve: [0.6, 0.9, 1.0, 0.8, 0.7, 0.5]
  }
];

export const getPersonalityById = (id: string): ProductivityPersonality | undefined => {
  return PRODUCTIVITY_PERSONALITIES.find(p => p.id === id);
};

export const getDefaultProfile = (userId: string): Omit<UserProductivityProfile, 'id' | 'createdAt' | 'updatedAt'> => {
  const balanced = getPersonalityById('balanced')!;
  return {
    userId,
    profileName: 'My Productivity Style',
    basedOnTemplate: 'balanced',
    scoringWeights: balanced.scoringWeights,
    schedulingPreferences: balanced.schedulingPreferences,
    energyCurve: balanced.energyCurve,
    adaptiveLearningEnabled: true,
    autoAdjustWeights: false,
    completionRateTarget: 0.80
  };
};

import { UserProductivityProfile } from '@/types/productivity';