import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Speaker } from '../../models/speaker-data-loader.interface';

@Component({
  selector: 'app-speaker-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speaker-card.component.html',
})
export class SpeakerCardComponent {
  @Input({ required: true }) speaker!: Speaker;
}