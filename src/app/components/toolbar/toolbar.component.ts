import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSpeakerModalComponent } from '../add-speaker-modal/add-speaker-modal.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, AddSpeakerModalComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() insertSpeaker = new EventEmitter<{first: string, last: string, favorite: boolean}>();
  @Output() sortByIdDescending = new EventEmitter<void>();
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

  onSortByIdDescending()
  {
     this.sortByIdDescending.emit();
  }
}
