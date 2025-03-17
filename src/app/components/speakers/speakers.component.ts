import { Component, inject, signal, OnInit, DestroyRef, computed, effect } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, tap, combineLatest, switchMap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SpeakerService } from '../../services/speaker.service';
import { Speaker, SpeakerInput } from '../../models/speaker.interface';
import { ApolloService } from '../../services/apollo-service';
import { checkBoxListVar } from '../../graphql/reactive-variables';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

@Component({
  selector: 'app-speaker',
  standalone: true,
  imports: [CommonModule, AsyncPipe, ToolbarComponent],
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakerComponent implements OnInit {
  private apollo = inject(Apollo);
  protected speakerService = inject(SpeakerService);
  private apolloService = inject(ApolloService);
  private destroyRef = inject(DestroyRef);
  protected speakers = signal<Speaker[]>([]);

  limit = signal(3);
  currentPage = signal(1);
  searchQuery = signal('');

  private params = computed(() => ({
    offset: (this.currentPage() - 1) * this.limit(),
    limit: this.limit()
  }));

  private watchQuery = computed(() => ({
    query: this.speakerService.GET_SPEAKERS_OFFSET_PAGINATED,
    variables: this.params(),
    fetchPolicy: 'cache-and-network' as const
  }));

  totalItems = signal(0);


  constructor() {
    console.log('SpeakerComponent constructor initialized');

    // Add effect to watch pagination changes
    effect(() => {
      console.log('Pagination params changed:', this.params());

      this.apollo.watchQuery<any>(this.watchQuery())
        .valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ data }) => {
            if (data?.speakers) {
              console.log('New page data:', data.speakers);
              this.speakers.set(data.speakers.datalist);
              this.totalItems.set(data.speakers.pageInfo.totalItemCount);
              //this.apolloService.updateAllSpeakerIds(data.speakers.datalist.map(s => s.id));
            }
          },
          error: (error) => console.error('Pagination query error:', error)
        });
    });
  }

  ngOnInit() {
    console.log('SpeakerComponent ngOnInit started');
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalItems()) {

      console.log('Changing to page:', page);
      this.currentPage.set(page);
      // params() will update automatically, triggering a new query
    }
  }

  onItemsPerPageChange(items: number) {
    this.limit.set(items);
    this.currentPage.set(1);
  }

  onAddSpeaker(data: { first: string, last: string, favorite: boolean }) {
    const speakerInput: SpeakerInput = {
      first: data.first,
      last: data.last,
      favorite: data.favorite
    };
    this.speakerService.addSpeaker(speakerInput)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onAddSpeakerOptimistic(data: { first: string, last: string, favorite: boolean }) {
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

  onSortByIdDescending() {
    this.speakerService.sortSpeakersDescending();
  }

  toggleSpeaker(id: number) {
    try {
      const currentList = checkBoxListVar().map(x => Number(x));
      const numericId = Number(id);

      if (isNaN(numericId)) {
        console.error('Invalid speaker ID:', id);
        return;
      }

      if (currentList.includes(numericId)) {
        checkBoxListVar(currentList.filter(x => x !== numericId));
      } else {
        checkBoxListVar([...currentList, numericId]);
      }

      // Force cache refresh for the specific speaker
      this.apollo.client.cache.modify({
        id: this.apollo.client.cache.identify({ __typename: 'Speaker', id: numericId }),
        fields: {
          checkBoxColumn: (existing) => !existing
        }
      });

    } catch (error) {
      console.error('Error toggling speaker selection:', error);
    }
  }
}
