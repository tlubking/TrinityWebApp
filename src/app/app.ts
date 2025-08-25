import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScriptureService } from './scripture.service';
import { VerseDisplay } from './verse-display.component';

interface Book { id: string; name?: string }
interface Chapter { id: string; number?: number; name?: string }
interface Verse { id: string; text?: string }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatFormFieldModule, MatSelectModule, MatCardModule, MatProgressSpinnerModule, VerseDisplay],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  private svc = inject(ScriptureService);

  protected readonly title = signal('trinity-web-app');

  // data stores
  chapters: WritableSignal<Chapter[]> = signal([]);
  verses: WritableSignal<Verse[]> = signal([]);

  selectedChapter = signal<string | null>(null);
  selectedVerse = signal<string | null>(null);

  verseText = signal<string | null>(null);
  // sanitized HTML (for content that contains markup) to render with innerHTML
  sanitizedVerseHtml: WritableSignal<any | null> = signal(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Backend endpoints (ScriptureController):
  // GET /api/scripture/bibles/{bibleId}/books
  // GET /api/scripture/bibles/{bibleId}/books/{bookId}/chapters
  // GET /api/scripture/bibles/{bibleId}/chapters/{chapterId}/verses
  // GET /api/scripture/bibles/{bibleId}/verses/{verseId}

  // Predefined bible id (fixed per request)
  private readonly BIBLE_ID = '06125adad2d5898a-01';

  books: WritableSignal<Book[]> = signal([]);
  selectedBook = signal<string | null>(null);

  ngOnInit(): void {
    // Use the predefined bible id and fetch its books immediately
    this.selectedBook.set(null);
    this.svc.getBooks(this.BIBLE_ID).subscribe({ next: (books) => {
      this.books.set(books);
      const first = books && books.length ? books[0].id : null;
      this.selectedBook.set(first);
      if (first) this.fetchChapters();
    }, error: (e) => { this.error.set(String(e)); } });
  }

  // theme toggle removed per user request

  private fetchChapters(): void {
    this.loading.set(true);
    this.error.set(null);
  const bibleId = this.BIBLE_ID;
  const bookId = this.selectedBook();
  if (!bibleId || !bookId) {
      this.loading.set(false);
      return;
    }

  this.svc.getChapters(bibleId, String(bookId)).subscribe({ next: (mapped) => { this.chapters.set(mapped); this.loading.set(false); }, error: (err) => { this.error.set(String(err)); this.loading.set(false); } });
  }

  // Bible is fixed; no fetchBibles or onBibleChange needed.

  private fetchBooks(bibleId: string) {
  // fetchBooks moved to ScriptureService; kept for API compatibility but not used
  this.svc.getBooks(bibleId).subscribe({ next: (mapped) => { this.books.set(mapped); const first = mapped && mapped.length ? mapped[0].id : null; this.selectedBook.set(first); this.loading.set(false); if (first) this.fetchChapters(); }, error: (err) => { this.error.set(String(err)); this.loading.set(false); } });
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
  this.svc.getVerses(bibleId, chapterId).subscribe({ next: (mapped) => { this.verses.set(mapped); this.loading.set(false); }, error: (err) => { this.error.set(String(err)); this.loading.set(false); } });
  }

  protected onVerseChange(verseId: string | null) {
    this.selectedVerse.set(verseId);
    this.verseText.set(null);
    if (!verseId || !this.selectedChapter()) return;

  this.loading.set(true);
  this.error.set(null);
  this.svc.getVerse(this.BIBLE_ID, String(verseId)).subscribe({ next: (res) => { this.sanitizedVerseHtml.set(res.html ?? null); this.verseText.set(res.text ?? null); this.loading.set(false); }, error: (err) => { this.error.set(String(err)); this.loading.set(false); } });
  }

  // parsing and sanitization moved to ScriptureService
}
