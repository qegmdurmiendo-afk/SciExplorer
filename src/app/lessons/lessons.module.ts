import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { LessonsPage } from './lessons.page';
import { LessonsRoutingModule } from './lessons-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LessonsRoutingModule
  ],
  declarations: [LessonsPage]
})
export class LessonsPageModule {}