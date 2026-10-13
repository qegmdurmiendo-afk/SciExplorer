import { Injectable } from '@angular/core';
import { Lesson } from '../models';

@Injectable({ providedIn: 'root' })
export class LessonsService {
  private lessons: Lesson[] = [
    {
      id: 'sci7-weather',
      title: 'Weather & Climate in the PH',
      subject: 'Science',
      gradeLevel: 7,
      description: 'Amihan, Habagat & PAGASA monitoring',
      content: 'Amihan = cool dry air (Nov–Feb)\nHabagat = warm rain (May–Oct)',
      progress: 65
    },
    {
      id: 'math8-farming',
      title: 'Measurement for Farming',
      subject: 'Math',
      gradeLevel: 8,
      description: 'Hectares, cavans & harvest calculations',
      content: '1 hectare = 10,000 m²\n1 cavan ≈ 50kg rice',
      progress: 30
    }
  ];

  getAll(): Lesson[] {
    return this.lessons;
  }

  getBySubject(subject: string): Lesson[] {
    return this.lessons.filter(l => l.subject === subject);
  }
}