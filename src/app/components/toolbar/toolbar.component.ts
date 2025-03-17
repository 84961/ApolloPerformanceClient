import { Component, Output, EventEmitter, ViewChild, inject, computed, effect, signal, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSpeakerModalComponent } from '../add-speaker-modal/add-speaker-modal.component';
import { ApolloService } from '../../services/apollo-service';
import { currentThemeVar } from '../../app.config';
import { checkBoxListVar, allSpeakerIdsVar } from '../../graphql/reactive-variables';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, AddSpeakerModalComponent,FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Output() insertSpeaker = new EventEmitter<{first: string, last: string, favorite: boolean}>();
  @Output() sortByIdDescending = new EventEmitter<void>();
  @ViewChild(AddSpeakerModalComponent) modal!: AddSpeakerModalComponent;
  
  currentPage = input<number>(1);
  totalItems = input<number>(0);
  itemsPerPage = input<number>(6);
  
  private apolloService = inject(ApolloService);
  private readonly apollo = inject(Apollo);
  private selectedCount = signal(0);
  private totalCount = signal(0);
  
  pageChange = output<number>();
  itemsPerPageChange = output<number>();
  
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPageChange.emit(value);
  }
  
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
