import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Book { id: string; name?: string }
interface Chapter { id: string; number?: number; name?: string }
interface Verse { id: string; text?: string }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatFormFieldModule, MatSelectModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  protected readonly title = signal('trinity-web-app');

  // data stores
  chapters: WritableSignal<Chapter[]> = signal([]);
  verses: WritableSignal<Verse[]> = signal([]);

  selectedChapter = signal<string | null>(null);
  selectedVerse = signal<string | null>(null);

  verseText = signal<string | null>(null);
  // sanitized HTML (for content that contains markup) to render with innerHTML
  sanitizedVerseHtml: WritableSignal<SafeHtml | null> = signal(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Backend endpoints (ScriptureController):
  // GET /api/scripture/bibles/{bibleId}/books
  // GET /api/scripture/bibles/{bibleId}/books/{bookId}/chapters
  // GET /api/scripture/bibles/{bibleId}/chapters/{chapterId}/verses
  // GET /api/scripture/bibles/{bibleId}/verses/{verseId}

  // Predefined bible id (fixed per request)
  private readonly BIBLE_ID = '06125adad2d5898a-01';
  // Direct backend URL
  private readonly API_BASE = 'https://localhost:7271/api/Scripture';

  books: WritableSignal<Book[]> = signal([]);
  selectedBook = signal<string | null>(null);

  ngOnInit(): void {
    // Use the predefined bible id and fetch its books immediately
    this.selectedBook.set(null);
    this.fetchBooks(this.BIBLE_ID);
  }

  private fetchChapters(): void {
    this.loading.set(true);
    this.error.set(null);
  const bibleId = this.BIBLE_ID;
  const bookId = this.selectedBook();
  if (!bibleId || !bookId) {
      this.loading.set(false);
      return;
    }

    this.http.get<any>(`${this.API_BASE}/bibles/${bibleId}/books/${bookId}/chapters`, { observe: 'body' })
      .subscribe({
        next: (raw) => {
          // Defensive parsing: the API might wrap results differently
          const items = Array.isArray(raw) ? raw : (raw?.data || raw?.items || raw?.chapters || []);
          const mapped: Chapter[] = (items || []).map((it: any) => ({ id: it.id ?? it.chapterId ?? String(it.number), number: it.number, name: it.name ?? it.reference }));
          this.chapters.set(mapped);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.message || 'Failed to load chapters');
          this.loading.set(false);
        }
      });
  }

  // Bible is fixed; no fetchBibles or onBibleChange needed.

  private fetchBooks(bibleId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<any>(`${this.API_BASE}/bibles/${bibleId}/books`, { observe: 'response' })
      .subscribe({
        next: (resp) => {
          // DEBUG: log status and raw body for troubleshooting
          // eslint-disable-next-line no-console
          console.debug('fetchBooks response status:', resp.status, 'body:', resp.body);
          const raw = resp.body;
          const items = Array.isArray(raw) ? raw : (raw?.data || raw?.items || raw?.books || []);
          const mapped: Book[] = (items || []).map((it: any) => ({ id: it.id ?? it.bookId ?? it.abbreviation ?? it.name, name: it.name ?? it.abbreviation }));
          this.books.set(mapped);
          const first = mapped && mapped.length ? mapped[0].id : null;
          this.selectedBook.set(first);
          this.loading.set(false);
          if (first) this.fetchChapters();
        },
        error: (err: HttpErrorResponse) => {
          // eslint-disable-next-line no-console
          console.error('fetchBooks error', err);
          this.error.set(err.message || 'Failed to load books');
          this.loading.set(false);
        }
      });
  }

  protected onBookChange(bookId: string | null) {
    this.selectedBook.set(bookId);
    this.chapters.set([]);
    this.verses.set([]);
    this.verseText.set(null);
    if (!bookId) return;
    this.fetchChapters();
  }

  protected onChapterChange(chapterId: string | null) {
    this.selectedChapter.set(chapterId);
    this.selectedVerse.set(null);
    this.verseText.set(null);
    this.verses.set([]);

  if (!chapterId) return;
    this.loading.set(true);
    this.error.set(null);

  const bibleId = this.BIBLE_ID;
    this.http.get<any>(`${this.API_BASE}/bibles/${bibleId}/chapters/${chapterId}/verses`, { observe: 'body' })
      .subscribe({
        next: (raw) => {
          const items = Array.isArray(raw) ? raw : (raw?.data || raw?.items || raw?.verses || []);
          const mapped: Verse[] = (items || []).map((it: any) => ({ id: it.id ?? it.verseId ?? it.number, text: it.text ?? it.content }));
          this.verses.set(mapped);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.message || 'Failed to load verses');
          this.loading.set(false);
        }
      });
  }

  protected onVerseChange(verseId: string | null) {
    this.selectedVerse.set(verseId);
    this.verseText.set(null);
    if (!verseId || !this.selectedChapter()) return;

    this.loading.set(true);
    this.error.set(null);

  const chapterId = this.selectedChapter();
  const bibleId = this.BIBLE_ID;
    this.http.get<any>(`${this.API_BASE}/bibles/${bibleId}/verses/${verseId}`, { observe: 'body' })
      .subscribe({
        next: (raw) => {
          const body = raw?.data || raw;
          const htmlOrText = body?.content || body?.text || body?.verse?.text || body?.data?.content || body;

          // reset
          this.sanitizedVerseHtml.set(null);
          this.verseText.set(null);

          if (typeof htmlOrText === 'string' && htmlOrText.trim().length) {
            const s = String(htmlOrText).trim();
            if (s.startsWith('<') && s.includes('>')) {
              // likely HTML; parse and extract meaningful parts
              const parsed = this.parseVerseHtml(s);
              if (parsed.html) {
                // sanitize and set
                const safe = this.sanitizer.bypassSecurityTrustHtml(parsed.html);
                this.sanitizedVerseHtml.set(safe);
                this.verseText.set(parsed.text ?? null);
              } else {
                this.verseText.set(parsed.text ?? s.replace(/<[^>]+>/g, ''));
              }
            } else {
              // plain text
              this.verseText.set(s);
            }
          }

          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.message || 'Failed to load verse');
          this.loading.set(false);
        }
      });
  }

  // Parse a returned HTML fragment from the API and return a cleaned HTML and plain text.
  private parseVerseHtml(html: string): { number?: string; text?: string; html?: string } {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // prefer paragraph content
      const p = doc.querySelector('p') || doc.body.firstElementChild as HTMLElement | null;
      let number: string | undefined;
      let text: string | undefined;
      let outHtml: string | undefined;

      if (p) {
        // find span with data-number or class 'v'
        const span = p.querySelector('span[data-number], span.v, span[data-sid]');
        if (span) {
          number = span.getAttribute('data-number') || span.textContent?.trim();
          // remove the numbering span for text extraction
          const clone = p.cloneNode(true) as HTMLElement;
          const sp = clone.querySelector('span[data-number], span.v, span[data-sid]');
          if (sp) sp.remove();
          text = clone.textContent?.trim() || undefined;
          // build a cleaned HTML snippet keeping number in bold
          outHtml = `<div class="verse"><strong class="verse-number">${number ?? ''}</strong> <span class="verse-text">${this.escapeHtml(text ?? '')}</span></div>`;
        } else {
          text = p.textContent?.trim() || undefined;
          outHtml = `<div class="verse"><span class="verse-text">${this.escapeHtml(text ?? '')}</span></div>`;
        }
      } else {
        text = doc.body.textContent?.trim() || undefined;
        outHtml = `<div class="verse"><span class="verse-text">${this.escapeHtml(text ?? '')}</span></div>`;
      }

      return { number, text, html: outHtml };
    } catch (e) {
      // fallback: strip tags
      const stripped = html.replace(/<[^>]+>/g, '');
      return { text: stripped, html: `<div>${this.escapeHtml(stripped)}</div>` };
    }
  }

  private escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
