import { Injectable } from '@angular/core';

export interface Competency {
  id: string;
  title: string;
  description: string;
  topicId: string;
  lessonRef: string;
}

export interface QuizAnswerRecord {
  competencyId: string;
  isCorrect: boolean;
}

export interface LearningCoachRecommendation {
  competencyId: string;
  competencyTitle: string;
  summary: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TopicWithCompetencies {
  id: string;
  title: string;
  competencies?: Competency[];
}

@Injectable({ providedIn: 'root' })
export class LearningCoachService {
  generateRecommendation(
    topic: TopicWithCompetencies,
    answerHistory: QuizAnswerRecord[] = [],
  ): LearningCoachRecommendation {
    if (!answerHistory.length) {
      return {
        competencyId: topic.id,
        competencyTitle: 'Topic review',
        summary: 'No quiz data is available yet, so the coach will guide you through the topic basics first.',
        action: 'Review the lesson and complete the activity before moving to the next concept.',
        priority: 'medium',
      };
    }

    const competencyMap = new Map((topic.competencies ?? []).map((competency) => [competency.id, competency]));
    const summary = new Map<string, { total: number; correct: number }>();

    for (const record of answerHistory) {
      const competencyId = record.competencyId || topic.id;
      const current = summary.get(competencyId) ?? { total: 0, correct: 0 };

      current.total += 1;
      if (record.isCorrect) {
        current.correct += 1;
      }

      summary.set(competencyId, current);
    }

    let weakestCompetencyId = topic.id;
    let weakestAccuracy = 1;

    for (const [competencyId, stats] of summary.entries()) {
      const accuracy = stats.total === 0 ? 1 : stats.correct / stats.total;

      if (accuracy < weakestAccuracy) {
        weakestAccuracy = accuracy;
        weakestCompetencyId = competencyId;
      }
    }

    const competency = competencyMap.get(weakestCompetencyId) ?? {
      id: weakestCompetencyId,
      title: 'Topic review',
      description: 'Review the concept again before continuing.',
      topicId: topic.id,
      lessonRef: 'lesson-review',
    };

    if (weakestAccuracy < 0.6) {
      return {
        competencyId: competency.id,
        competencyTitle: competency.title,
        summary: `${competency.title} needs more practice before you move on to the next concept.`,
        action: `Review the ${competency.title.toLowerCase()} lesson and complete the related activity before taking the next quiz.`,
        priority: 'high',
      };
    }

    if (weakestAccuracy < 0.8) {
      return {
        competencyId: competency.id,
        competencyTitle: competency.title,
        summary: `${competency.title} is improving, but a quick review will help strengthen your understanding.`,
        action: `Spend a few minutes revising the ${competency.title.toLowerCase()} lesson and try one more practice check.`,
        priority: 'medium',
      };
    }

    return {
      competencyId: competency.id,
      competencyTitle: competency.title,
      summary: `You are showing strong understanding in ${competency.title.toLowerCase()}. You are ready for the next concept.`,
      action: 'Great work — move to the next concept or try a short reassessment when you are ready.',
      priority: 'low',
    };
  }
}
