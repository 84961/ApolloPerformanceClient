import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SpeakerService } from '../../services/speaker.service';
import { Speaker, SpeakerInput } from '../../models/speaker.interface';

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
    this.speakerService.watchSpeakers()
      .pipe(
        tap(speakers => {
          console.log('Raw speakers data:', speakers); // Debug the raw data
          if (!speakers || speakers.length === 0) {
            console.warn('No speakers data received');
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (speakers) => {
          this.speakers.set(speakers);
          console.log('Speakers signal after update:', this.speakers()); // Verify signal update
        },
        error: (error) => console.error('Error loading speakers:', error)
      });
  }

  onAddSpeaker(data: {first: string, last: string, favorite: boolean}) {
    const speakerInput: SpeakerInput = {
      first: data.first,
      last: data.last,
      favorite: data.favorite
    };
    this.speakerService.addSpeaker(speakerInput)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onAddSpeakerOptimistic(data: {first: string, last: string, favorite: boolean}) {
    const speakerInput: SpeakerInput = {  
      first: data.first,
      last: data.last,
      favorite: data.favorite
    };
    this.speakerService.addSpeakerOptimistic(speakerInput)
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


  toggleFavoriteOptimistic(id: number) {
    const currentSpeakers = this.speakers();
    console.log('Current speakers array:', currentSpeakers); // Debug the current speakers array
    console.log('Looking for speaker with ID:', id); // Debug the ID we're looking for
    
    const speaker = currentSpeakers.find(s => {
      console.log('Comparing speaker:', s.id, 'with:', id, 'types:', typeof s.id, typeof id);
      return Number(s.id) === Number(id);
    });

    if (speaker) {
      console.log('Found speaker:', speaker);
      this.speakerService.toggleFavoriteOptimistic(Number(id), speaker)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => console.log('Toggle result:', result),
          error: (error) => console.error('Toggle error:', error)
        });
    } else {
      console.error(`No speaker found with id ${id}. Current speakers:`, currentSpeakers);
    }
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

  deleteSpeakerOptimistic(id: number) {
    const currentSpeakers = this.speakers();
    const speaker = currentSpeakers.find(s => Number(s.id) === Number(id));
    
    if (speaker) {
      console.log('Deleting speaker:', speaker);
      this.speakerService.deleteSpeakerOptimistic(Number(id), speaker)
        .pipe(
          tap(result => console.log('Delete result:', result)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => console.log('Delete successful'),
          error: (error) => console.error('Delete error:', error)
        });
    } else {
      console.error(`No speaker found with id ${id}`);
    }
  }

  onSortByIdDescending(){
    this.speakerService.sortSpeakersDescending();
  }
}
