export interface CurriculumSource {
  authority: string;
  title: string;
  url: string;
  note: string;
}

export interface CurriculumInfo {
  gradeLevel: 11 | 12;
  strand: 'STEM' | 'ABM' | 'HUMSS' | 'ICT' | 'TVL';
  subject: string;
  quarter: number;
  competencyCode: string;
  competencyStatement: string;
  learningObjective: string;
  source: CurriculumSource;
}

export interface Lesson {
  id: string;
  title: string;
  subject: 'Science' | 'Math';
  gradeLevel: number;
  description: string;
  content: string;
  progress: number;
  curriculum?: CurriculumInfo;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  topicId: string;
  lessonRef: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  competencyId?: string;
}

export interface ActivityTask {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  competencyId?: string;
}

export interface Topic {
  id: string;
  title: string;
  subject: 'Science' | 'Mathematics';
  summary: string;
  description: string;
  introduction: string;
  keyConcepts: string[];
  example: string;
  didYouKnow: string;
  takeaways: string[];
  competencies: Competency[];
  activity: ActivityTask;
  quiz: QuizQuestion[];
}

export interface Feature {
  title: string;
  desc: string;
  icon: string;
  route: string;
  color: string;
}