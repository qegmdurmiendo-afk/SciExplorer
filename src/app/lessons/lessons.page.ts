import { Component, OnInit } from '@angular/core';
import { LessonsService } from '../shared/services/lessons.service';
import { Lesson } from '../shared/models';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.page.html',
  styleUrls: ['./lessons.page.scss'],
  standalone: false,
})
export class LessonsPage implements OnInit {
  selectedSubject: 'All' | 'Science' | 'Math' = 'All';
  selectedGrade: number | 'All' = 'All';
  allLessons: Lesson[] = [];
  filtered: Lesson[] = [];

  constructor(private ls: LessonsService) {}

  ngOnInit() {
    this.allLessons = this.ls.getAll();
    this.applyFilters();
  }

  applyFilters() {
    this.filtered = this.allLessons.filter(l =>
      (this.selectedSubject === 'All' || l.subject === this.selectedSubject) &&
      (this.selectedGrade === 'All' || l.gradeLevel === this.selectedGrade)
    );
  }

  onFilterChange() {
    this.applyFilters();
  }
}