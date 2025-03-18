import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakerCardComponent } from './speaker-card.component';
import { SpeakerDataLoaderService } from '../../services/speaker-data-loader.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Speaker } from '../../models/speaker-data-loader.interface';
import { PaginationParams } from '../../models/speaker.interface';

@Component({
  selector: 'app-speaker-data-loader',
  standalone: true,
  imports: [CommonModule, SpeakerCardComponent],
  templateUrl: './speaker-data-loader.component.html',
  styleUrls: ['./speaker-data-loader.component.scss']
})
export class SpeakerDataLoaderComponent {
  private speakerService = inject(SpeakerDataLoaderService);
  
  speakers = signal<Speaker[]>([]);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  errorMessage = signal<string>('');
  private params:PaginationParams = { offset: 0, limit: 5 };
  constructor() {
    this.fetchSpeakers();
  }

  private fetchSpeakers(): void {
    this.loading.set(true);
    this.error.set(false);
    
    this.speakerService.getSpeakers(this.params).subscribe({
      next: (data) => {
        this.speakers.set(data.speakers.datalist);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(true);
        this.loading.set(false);
        this.errorMessage.set(err.message || 'An error occurred while fetching speakers');
      }
    });
  }
}