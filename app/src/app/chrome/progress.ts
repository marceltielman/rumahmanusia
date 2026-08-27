import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  afterNextRender, inject, signal,
} from '@angular/core';

/**
 * Reading-progress bar, doubling as a scrub control. Also toggles the sticky
 * header's shrunk state, since both derive from the same scroll position and
 * one listener is cheaper than two.
 */
@Component({
  selector: 'div[rmProgress]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'rm-progress',
    'role': 'slider',
    'tabindex': '0',
    'aria-label': 'Scroll position',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'rounded()',
    '(click)': 'scrub($event)',
    '(keydown)': 'onKey($event)',
  },
  template: '<span [style.width.%]="percent()"></span>',
})
export class Progress {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly percent = signal(0);
  protected readonly rounded = signal(0);

  constructor() {
    afterNextRender(() => {
      const onScroll = () => {
        const max = this.max();
        const value = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
        this.percent.set(value);
        this.rounded.set(Math.round(value));
        document.querySelector('.rm-head')?.classList.toggle('rm-stuck', scrollY > 24);
      };

      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      onScroll();

      this.destroyRef.onDestroy(() => {
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onScroll);
      });
    });
  }

  private max() {
    return document.documentElement.scrollHeight - innerHeight;
  }

  protected scrub(event: MouseEvent) {
    const box = this.host.nativeElement.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    scrollTo({ top: this.max() * ratio, behavior: 'smooth' });
  }

  protected onKey(event: KeyboardEvent) {
    const page = innerHeight * 0.9;
    let top: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') top = Math.min(this.max(), scrollY + page);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') top = Math.max(0, scrollY - page);
    else if (event.key === 'Home') top = 0;
    else if (event.key === 'End') top = this.max();
    if (top === null) return;

    event.preventDefault();
    scrollTo({ top, behavior: 'smooth' });
  }
}
