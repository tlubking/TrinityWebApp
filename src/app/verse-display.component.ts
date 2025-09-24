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

    <div *ngIf="!html && text" class="verse-text">
      <span class="verse-content">{{ text }}</span>
      <button
        type="button"
        class="save-btn"
        mat-icon-button
        disabled
        aria-label="Save"
        title="Save (disabled)"
      >
        <mat-icon>save</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .verse-text {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 1.05rem;
        white-space: pre-wrap;
      }

      .verse-content {
        flex: 1 1 auto;
      }

      .save-btn {
        width: 36px;
        height: 36px;
        min-width: 36px;
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

      .save-btn[disabled] {
        opacity: 0.9;
        filter: grayscale(6%);
        cursor: not-allowed;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }

      .save-btn mat-icon {
        font-size: 20px;
        line-height: 20px;
      }
    `,
  ],
})
export class VerseDisplay {
  @Input() html: any | null = null;
  @Input() text: string | null = null;
}
