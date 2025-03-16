import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSpeakerModalComponent } from '../add-speaker-modal/add-speaker-modal.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, AddSpeakerModalComponent],
  template: `
    <div class="container my-4">
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary" (click)="openModal()">
          <i class="bi bi-plus-lg"></i> Add Speaker
        </button>
      </div>
    </div>
    <app-add-speaker-modal (insertSpeaker)="onInsertSpeaker($event)"></app-add-speaker-modal>
  `
})
export class ToolbarComponent {
  @Output() insertSpeaker = new EventEmitter<{first: string, last: string, favorite: boolean}>();
  @ViewChild(AddSpeakerModalComponent) modal!: AddSpeakerModalComponent;

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
}
