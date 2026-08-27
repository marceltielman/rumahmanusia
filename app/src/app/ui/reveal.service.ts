import { Injectable, OnDestroy } from '@angular/core';

/**
 * One IntersectionObserver shared by every revealed section, rather than one
 * per section.
 *
 * Sections start at opacity 0 in the stylesheet, so a failure here hides
 * content. Three safety nets, matching the vanilla build: anything already near
 * the viewport is revealed immediately, a sweep runs shortly after load, and if
 * IntersectionObserver is unavailable everything is revealed at once.
 */
@Injectable({ providedIn: 'root' })
export class RevealService implements OnDestroy {
  private observer?: IntersectionObserver;
  private readonly pending = new Set<HTMLElement>();
  private sweepTimer?: ReturnType<typeof setTimeout>;

  register(element: HTMLElement) {
    if (this.nearViewport(element)) {
      this.reveal(element);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.reveal(element);
      return;
    }

    this.pending.add(element);
    this.observerInstance().observe(element);
    this.scheduleSweep();
  }

  unregister(element: HTMLElement) {
    this.pending.delete(element);
    this.observer?.unobserve(element);
  }

  ngOnDestroy() {
    clearTimeout(this.sweepTimer);
    this.observer?.disconnect();
  }

  private observerInstance(): IntersectionObserver {
    this.observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -25% 0px', threshold: 0 }
    );
    return this.observer;
  }

  /** Catches sections whose position settles only after fonts and images land. */
  private scheduleSweep() {
    clearTimeout(this.sweepTimer);
    this.sweepTimer = setTimeout(() => {
      for (const element of [...this.pending]) {
        if (this.nearViewport(element)) this.reveal(element);
      }
    }, 600);
  }

  private nearViewport(element: HTMLElement) {
    return element.getBoundingClientRect().top < window.innerHeight * 0.75;
  }

  private reveal(element: HTMLElement) {
    element.classList.add('rm-in');
    this.unregister(element);
  }
}
