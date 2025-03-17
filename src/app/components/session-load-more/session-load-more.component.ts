import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsService } from '../../services/session.service';
import { SessionsCursorResponse, Session } from '../../models/speaker.interface';


@Component({
  selector: 'app-sessions-load-more',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-load-more.component.html',
  styleUrls: ['./session-load-more.component.scss']
})
export class SessionsLoadMoreComponent {
  private sessionsService = inject(SessionsService);

  sessions = signal<Session[]>([]);
  hasNextPage = signal(false);
  lastCursor = signal('');
  loading = signal(false);
  loadingMore = signal(false);
  error = signal(false);

  constructor() {
    this.loading.set(true);
    this.sessionsService.getSessions().subscribe({
      next: (response) => {
        this.sessions.set(response.sessionsConcat.datalist);
        this.hasNextPage.set(response.sessionsConcat.pageInfo.hasNextPage);
        this.lastCursor.set(response.sessionsConcat.pageInfo.lastCursor);
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
    this.sessionsService.getSessions(this.lastCursor()).subscribe({
      next: (response) => {
        this.sessions.update(current => [...current, ...response.sessionsConcat.datalist]);
        this.hasNextPage.set(response.sessionsConcat.pageInfo.hasNextPage);
        this.lastCursor.set(response.sessionsConcat.pageInfo.lastCursor);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loadingMore.set(false);
      }
    });
  }
}
