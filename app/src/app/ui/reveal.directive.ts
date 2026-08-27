import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { RevealService } from './reveal.service';

/**
 * Marks a section for scroll reveal. Applies the `rm-rise` class itself so the
 * stylesheet and the behaviour cannot drift apart.
 *
 * Deliberately used on native elements (`<section rmReveal>`) — the stylesheet
 * staggers `.rm-rise > *` by :nth-child, so a component host element between
 * the section and its wrapper would break the stagger.
 */
@Directive({
  selector: '[rmReveal]',
  host: { 'class': 'rm-rise' },
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reveals = inject(RevealService);

  constructor() {
    // Browser only. During prerender the class stays off and the CSS keeps the
    // section at opacity 0 — which is why the failsafes above matter.
    afterNextRender(() => this.reveals.register(this.host.nativeElement));
  }
}
