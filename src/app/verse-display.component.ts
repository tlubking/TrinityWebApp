import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'verse-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="html" class="verse-html" [innerHTML]="html"></div>
    <div *ngIf="!html && text" class="verse-text">{{ text }}</div>
  `,
  styles: [
    `.verse-html { white-space: pre-wrap; font-size: 1.05rem; }
     .verse-text { font-size: 1.05rem; white-space: pre-wrap }
     .verse-number { color: #8b0000; margin-right: 0.5rem }
    `
  ]
})
export class VerseDisplay {
  @Input() html: any | null = null; // SafeHtml or null
  @Input() text: string | null = null;
}
