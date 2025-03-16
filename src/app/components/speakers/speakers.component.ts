import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SpeakerService } from '../../services/speaker.service';
import { Speaker } from '../../models/speaker.interface';

@Component({
  selector: 'app-speaker',
  standalone: true,
  imports: [CommonModule, AsyncPipe, ToolbarComponent],
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakerComponent implements OnInit {
  protected speakerService = inject(SpeakerService);
  private destroyRef = inject(DestroyRef);
  protected speakers = signal<Speaker[]>([]);

  ngOnInit() {
    this.speakerService.getSpeakers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(speakers => this.speakers.set(speakers));
  }

  onAddSpeaker(data: {first: string, last: string, favorite: boolean}) {
    this.speakerService.addSpeaker(data.first, data.last, data.favorite)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  toggleFavorite(id: number) {
    this.speakerService.toggleFavorite(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updatedSpeaker => {
        const currentSpeakers = this.speakers();
        const updatedSpeakers = currentSpeakers.map(speaker => 
          speaker.id === updatedSpeaker.id ? updatedSpeaker : speaker
        );
        this.speakers.set(updatedSpeakers);
      });
  }

  deleteSpeaker(id: number) {
    this.speakerService.deleteSpeaker(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const filteredSpeakers = this.speakers()
          .filter(speaker => speaker.id !== id);
        this.speakers.set(filteredSpeakers);
      });
  }
}
