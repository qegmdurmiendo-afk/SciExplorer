import { beforeEach, describe, expect, it } from 'vitest';
import { LearningCoachService } from './learning-coach.service';
import { Topic, Competency, QuizQuestion } from '../models';

describe('LearningCoachService', () => {
  let service: LearningCoachService;

  const competencyBasic: Competency = {
    id: 'basic-genetics',
    title: 'Basic genetic concepts',
    description: 'Understand DNA, genes, and inheritance basics.',
    topicId: 'genetics',
    lessonRef: 'genetics-basics',
  };

  const competencyInheritance: Competency = {
    id: 'inheritance-patterns',
    title: 'Inheritance patterns',
    description: 'Use Mendelian reasoning to predict traits.',
    topicId: 'genetics',
    lessonRef: 'genetics-inheritance',
  };

  const sampleTopic: Topic = {
    id: 'genetics',
    title: 'Genetics',
    subject: 'Science',
    summary: 'Genes carry instructions ...',
    description: 'Example topic.',
    introduction: 'Introduction',
    keyConcepts: ['DNA', 'Genes'],
    example: 'Example',
    didYouKnow: 'Did you know?',
    takeaways: ['Takeaway'],
    activity: {
      prompt: 'Which is an inherited trait?',
      options: ['Eye color', 'Book color', 'Weather', 'School uniform'],
      correct: 'Eye color',
      explanation: 'Inherited traits are passed from parents to children through genes.',
      competencyId: 'basic-genetics',
    },
    competencies: [competencyBasic, competencyInheritance],
    quiz: [
      {
        id: 'q1',
        question: 'What does DNA contain?',
        options: ['Food energy', 'Genetic instructions', 'Sound waves', 'Plant roots'],
        correct: 'Genetic instructions',
        explanation: 'DNA carries instructions.',
        competencyId: 'basic-genetics',
      },
      {
        id: 'q2',
        question: 'Which trait is inherited?',
        options: ['Blood type', 'Favorite song', 'Laptop brand', 'Daily schedule'],
        correct: 'Blood type',
        explanation: 'Blood type is inherited.',
        competencyId: 'inheritance-patterns',
      },
      {
        id: 'q3',
        question: 'What are genes?',
        options: ['Sections of DNA', 'Types of cells', 'Weather systems', 'Electric currents'],
        correct: 'Sections of DNA',
        explanation: 'Genes are sections of DNA.',
        competencyId: 'inheritance-patterns',
      },
    ] as QuizQuestion[],
  };

  beforeEach(() => {
    service = new LearningCoachService();
  });

  it('recommends the weakest competency when one area needs practice', () => {
    const recommendation = service.generateRecommendation(sampleTopic, [
      { competencyId: 'basic-genetics', isCorrect: true },
      { competencyId: 'inheritance-patterns', isCorrect: false },
      { competencyId: 'inheritance-patterns', isCorrect: false },
    ]);

    expect(recommendation.competencyId).toBe('inheritance-patterns');
    expect(recommendation.action).toContain('inheritance');
    expect(recommendation.summary.toLowerCase()).toContain('needs more practice');
  });

  it('recommends moving forward when the learner is already strong', () => {
    const recommendation = service.generateRecommendation(sampleTopic, [
      { competencyId: 'basic-genetics', isCorrect: true },
      { competencyId: 'inheritance-patterns', isCorrect: true },
      { competencyId: 'inheritance-patterns', isCorrect: true },
    ]);

    expect(recommendation.action).toContain('next concept');
    expect(recommendation.priority).toBe('low');
  });
});
