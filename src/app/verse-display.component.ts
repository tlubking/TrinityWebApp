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

      /* Icon-only save button: fixed square, subtle border, raised look */
      .save-btn {
        width: 40px;
        height: 40px;
        min-width: 40px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        background: #1976d2;
        color: #fff;

        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 6px;

        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
        transition: box-shadow 120ms ease, transform 120ms ease;
      }

      /* Slightly less elevated when disabled, still visually distinct */
      .save-btn[disabled] {
        opacity: 0.9;
        filter: grayscale(6%);
        cursor: not-allowed;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }

      /* Icon sizing */
      .save-btn mat-icon {
        font-size: 20px;
        line-height: 20px;
      }
    `,
  ],
})
export class VerseDisplay {
  @Input() html: any | null = null; // SafeHtml or null
  @Input() text: string | null = null;
}
