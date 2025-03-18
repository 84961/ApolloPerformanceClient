import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeakersLoadMoreComponent } from './components/speaker-load-more/speaker-load-more.component';
import { SessionsLoadMoreComponent } from './components/session-load-more/session-load-more.component';
import { SpeakerDataLoaderComponent } from './components/dataloader/speaker-data-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpeakersLoadMoreComponent, SessionsLoadMoreComponent, SpeakerDataLoaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {
    console.log('AppComponent initialized');
  }
}
