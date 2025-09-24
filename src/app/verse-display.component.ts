import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'verse-display',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div *ngIf="html" class="verse-html" [innerHTML]="html"></div>
    <div *ngIf="!html && text" class="verse-text">{{ text }}</div>
    <div class="verse-actions">
      <button
        type="button"
        class="save-btn"
        mat-icon-button
        disabled
        aria-label="Save"
      >
        <mat-icon>save</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .verse-html {
        white-space: pre-wrap;
        font-size: 1.05rem;
      }
      .verse-text {
        font-size: 1.05rem;
        white-space: pre-wrap;
      }
      .verse-number {
        color: #8b0000;
        margin-right: 0.5rem;
      }

      .verse-actions {
        margin-top: 0.75rem;
      }
      .save-btn {
        background: #1976d2;
        color: #fff;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        cursor: not-allowed;
        font-size: 0.95rem;
        opacity: 0.65;
      }

      .save-btn:disabled {
        cursor: not-allowed;
      }
    `,
  ],
})
export class VerseDisplay {
  @Input() html: any | null = null; // SafeHtml or null
  @Input() text: string | null = null;
}
