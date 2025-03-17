import { Routes } from '@angular/router';
import { SpeakerComponent } from './components/speakers/speakers.component';
import { SpeakersLoadMoreComponent } from './components/speaker-load-more/speaker-load-more.component';

export const routes: Routes = [
  { path: '', component: SpeakerComponent },
  { path: 'speaker/loadmore', component: SpeakersLoadMoreComponent },
  { path: '**', redirectTo: '' }
];
