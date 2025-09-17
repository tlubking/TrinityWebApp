import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { BIBLE_VERSIONS, getDefaultBibleVersion } from './bible-versions';

interface Book {
  id: string;
  name?: string;
}
interface Chapter {
  id: string;
  number?: number;
  name?: string;
}
interface Verse {
  id: string;
  text?: string;
}

@Injectable({ providedIn: 'root' })
export class ScriptureService {
  // Default to the deployed backend; change if you deploy elsewhere or use runtime config.
  private readonly API_BASE =
    'https://trinitywebapi-production.up.railway.app/api/Scripture';

  // Default API bible id (resolved from our versions list). Keeps backwards compatibility
  // when callers pass either an internal id (e.g. 'esv') or the external apiId.
  private readonly BIBLE_ID = getDefaultBibleVersion().apiId;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  getBooks(bibleId: string = this.BIBLE_ID): Observable<Book[]> {
    const apiId = this.resolveBibleApiId(bibleId);
    return this.http.get<any>(`${this.API_BASE}/bibles/${apiId}/books`).pipe(
      map((raw) => {
        const items = Array.isArray(raw)
          ? raw
          : raw?.data || raw?.items || raw?.books || [];
        return (items || []).map((it: any) => ({
          id: it.id ?? it.bookId ?? it.abbreviation ?? it.name,
          name: it.name ?? it.abbreviation,
        }));
      })
    );
  }

  getChapters(bibleId: string, bookId: string): Observable<Chapter[]> {
    const apiId = this.resolveBibleApiId(bibleId);
    return this.http
      .get<any>(`${this.API_BASE}/bibles/${apiId}/books/${bookId}/chapters`)
      .pipe(
        map((raw) => {
          const items = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.items || raw?.chapters || [];
          return (items || []).map((it: any) => ({
            id: it.id ?? it.chapterId ?? String(it.number),
            number: it.number,
            name: it.name ?? it.reference,
          }));
        })
      );
  }

  getVerses(bibleId: string, chapterId: string): Observable<Verse[]> {
    const apiId = this.resolveBibleApiId(bibleId);
    return this.http
      .get<any>(`${this.API_BASE}/bibles/${apiId}/chapters/${chapterId}/verses`)
      .pipe(
        map((raw) => {
          const items = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.items || raw?.verses || [];
          return (items || []).map((it: any) => ({
            id: it.id ?? it.verseId ?? it.number,
            text: it.text ?? it.content,
          }));
        })
      );
  }

  // Returns an object with sanitized HTML (if available) and a plain-text fallback
  getVerse(
    bibleId: string,
    verseId: string
  ): Observable<{ text?: string; html?: SafeHtml }> {
    const apiId = this.resolveBibleApiId(bibleId);
    return this.http
      .get<any>(`${this.API_BASE}/bibles/${apiId}/verses/${verseId}`)
      .pipe(
        map((raw) => {
          const body = raw?.data || raw;
          const htmlOrText =
            body?.content ||
            body?.text ||
            body?.verse?.text ||
            body?.data?.content ||
            body;
          if (typeof htmlOrText === 'string' && htmlOrText.trim().length) {
            const s = String(htmlOrText).trim();
            if (s.startsWith('<') && s.includes('>')) {
              const parsed = this.parseVerseHtml(s);
              const safe = parsed.html
                ? this.sanitizer.bypassSecurityTrustHtml(parsed.html)
                : undefined;
              return { text: parsed.text, html: safe };
            }
            return { text: s };
          }
          return { text: undefined };
        })
      );
  }

  /**
   * Resolve a passed value (either our internal `id` like 'esv' or an external `apiId`)
   * to the API `apiId` the backend expects.
   */
  private resolveBibleApiId(bibleIdOrApiId?: string): string {
    if (!bibleIdOrApiId) return this.BIBLE_ID;
    const found = BIBLE_VERSIONS.find(
      (v) => v.id === bibleIdOrApiId || v.apiId === bibleIdOrApiId
    );
    if (found) return found.apiId;
    // If not found, assume caller provided a valid apiId already and return as-is.
    // Optionally you could warn here to help debugging.
    return bibleIdOrApiId;
  }

  private parseVerseHtml(html: string): {
    number?: string;
    text?: string;
    html?: string;
  } {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const p =
        doc.querySelector('p') ||
        (doc.body.firstElementChild as HTMLElement | null);
      let number: string | undefined;
      let text: string | undefined;
      let outHtml: string | undefined;

      if (p) {
        const span = p.querySelector(
          'span[data-number], span.v, span[data-sid]'
        );
        if (span) {
          number = span.getAttribute('data-number') || span.textContent?.trim();
          const clone = p.cloneNode(true) as HTMLElement;
          const sp = clone.querySelector(
            'span[data-number], span.v, span[data-sid]'
          );
          if (sp) sp.remove();
          text = clone.textContent?.trim() || undefined;
          outHtml = `<div class="verse"><strong class="verse-number">${
            number ?? ''
          }</strong> <span class="verse-text">${this.escapeHtml(
            text ?? ''
          )}</span></div>`;
        } else {
          text = p.textContent?.trim() || undefined;
          outHtml = `<div class="verse"><span class="verse-text">${this.escapeHtml(
            text ?? ''
          )}</span></div>`;
        }
      } else {
        text = doc.body.textContent?.trim() || undefined;
        outHtml = `<div class="verse"><span class="verse-text">${this.escapeHtml(
          text ?? ''
        )}</span></div>`;
      }

      return { number, text, html: outHtml };
    } catch (e) {
      const stripped = html.replace(/<[^>]+>/g, '');
      return {
        text: stripped,
        html: `<div>${this.escapeHtml(stripped)}</div>`,
      };
    }
  }

  private escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
