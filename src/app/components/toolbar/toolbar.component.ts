import { Component, Output, EventEmitter, ViewChild, inject, computed, effect, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSpeakerModalComponent } from '../add-speaker-modal/add-speaker-modal.component';
import { ApolloService } from '../../services/apollo-service';
import { currentThemeVar } from '../../app.config';
import { checkBoxListVar, allSpeakerIdsVar } from '../../graphql/reactive-variables';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, AddSpeakerModalComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Output() insertSpeaker = new EventEmitter<{first: string, last: string, favorite: boolean}>();
  @Output() sortByIdDescending = new EventEmitter<void>();
  @ViewChild(AddSpeakerModalComponent) modal!: AddSpeakerModalComponent;
  
  private apolloService = inject(ApolloService);
  private readonly apollo = inject(Apollo);
  private selectedCount = signal(0);
  private totalCount = signal(0);
  
  isDarkTheme = () => this.apolloService.getCurrentTheme() === 'dark';
  
  isAllSelected = computed(() => {
    return this.selectedCount() > 0 && this.selectedCount() === this.totalCount();
  });

  constructor() {
    effect(() => {
      document.body.classList.toggle('dark-theme', this.isDarkTheme());
    });
  }

  ngOnInit() {
    this.watchSelections();
  }

  private watchSelections() {
    this.apollo.watchQuery<any>({
      query: gql`
        query WatchSelections {
          selectedSpeakers @client
          allSpeakerIds @client
        }
      `
    }).valueChanges.subscribe(({ data }) => {
      console.log('Selection data from cache:', data);
      this.selectedCount.set(data.selectedSpeakers?.length || 0);
      this.totalCount.set(data.allSpeakerIds?.length || 0);
    });
  }

  toggleTheme(): void {
    const newTheme = this.apolloService.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.apolloService.setTheme(newTheme);
  }

  toggleAllSpeakers(): void {
    this.apolloService.toggleAll();
  }
  
  openModal() {
    const modalEl = document.getElementById('addSpeakerModal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.show();
    }
  }

  onInsertSpeaker(data: {first: string, last: string, favorite: boolean}) {
    this.insertSpeaker.emit(data);
  }

  onSortByIdDescending()
  {
     this.sortByIdDescending.emit();
  }
}
