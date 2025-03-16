import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
declare var bootstrap: any; // Add this at the top to declare Bootstrap

@Component({
    selector: 'app-add-speaker-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-speaker-modal.component.html',
    styleUrls: ['./add-speaker-modal.component.scss']
})
export class AddSpeakerModalComponent implements OnInit {
    @Output() insertSpeaker = new EventEmitter<{ first: string, last: string, favorite: boolean }>();

    first = '';
    last = '';
    favorite = false;

    private modalInstance: BootstrapModal | null = null;

    ngOnInit() {
        const modalEl = document.getElementById('addSpeakerModal');
        if (modalEl) {
            this.modalInstance = new bootstrap.Modal(modalEl, {
                backdrop: 'static',
                keyboard: false
            });
        }
    }

    onSubmit() {
        if (this.modalInstance) {
            this.insertSpeaker.emit({ first: this.first, last: this.last, favorite: this.favorite });
            this.modalInstance.hide();
            this.first = '';
            this.last = '';
            this.favorite = false;
        }
    }
}
