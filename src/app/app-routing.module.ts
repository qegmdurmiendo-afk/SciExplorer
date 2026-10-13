import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LessonsPage } from './lessons/lessons.page';

const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'lessons', component: LessonsPage },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}