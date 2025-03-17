import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { SpeakerService } from '../../services/speaker.service';
import { Speaker } from '../../models/speaker.interface';

@Component({
  selector: 'app-speakers-load-more',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speaker-load-more.component.html',
  styleUrls: ['./speaker-load-more.component.scss']
})
export class SpeakersLoadMoreComponent {
  private speakersService = inject(SpeakerService);

  speakers = signal<Speaker[]>([]);
  hasNextPage = signal(false);
  lastCursor = signal('');
  loading = signal(false);
  loadingMore = signal(false);
  error = signal(false);

  constructor() {
    this.loading.set(true);
    this.speakersService.getSpeakersCursorResponse().subscribe({
      next: (response) => {
        this.speakers.set(response.speakersConcat.datalist);
        this.hasNextPage.set(response.speakersConcat.pageInfo.hasNextPage);
        this.lastCursor.set(response.speakersConcat.pageInfo.lastCursor);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  loadMore() {
    this.loadingMore.set(true);
    this.speakersService.getSpeakersCursorResponse(this.lastCursor()).subscribe({
      next: (response) => {
        this.speakers.update(current => [...current, ...response.speakersConcat.datalist]);
        this.hasNextPage.set(response.speakersConcat.pageInfo.hasNextPage);
        this.lastCursor.set(response.speakersConcat.pageInfo.lastCursor);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loadingMore.set(false);
      }
    });
  }
}