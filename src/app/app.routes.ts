import { Routes } from '@angular/router';
import { SpeakerComponent } from './components/speakers/speakers.component';

export const routes: Routes = [
  { path: '', component: SpeakerComponent },
  { path: '**', redirectTo: '' }
];
