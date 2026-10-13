export interface Lesson {
  id: string;
  title: string;
  subject: 'Science' | 'Math';
  gradeLevel: number;
  description: string;
  content: string;
  progress: number;
}

export interface Feature {
  title: string;
  desc: string;
  icon: string;
  route: string;
  color: string;
}