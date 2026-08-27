import { Injectable, computed, signal } from '@angular/core';

const MOON = 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z';
const SUN = 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4'
  + 'M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';

export type Theme = 'light' | 'dark';

/**
 * The theme is resolved and applied by an inline script in index.html before
 * first paint, so a dark-mode reload never flashes white. This service adopts
 * whatever that script decided and owns the toggle from then on.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly current = signal<Theme>(this.initial());

  readonly theme = this.current.asReadonly();
  readonly iconPath = computed(() => (this.current() === 'dark' ? SUN : MOON));
  readonly label = computed(() =>
    this.current() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );

  toggle() {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  private set(next: Theme) {
    this.current.set(next);
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('rm-theme', next);
    } catch {
      /* private browsing — the choice simply will not persist */
    }
  }

  /** Runs during prerender too, where there is no document; light is the default. */
  private initial(): Theme {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
}
