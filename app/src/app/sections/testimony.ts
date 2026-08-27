import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content/content.service';
import { alternateQuote } from '../ui/anim';

@Component({
  selector: 'section[rmTestimony]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'testimony' },
  template: `
    <div style="max-width:1120px;margin:0 auto;padding:clamp(20px,4vw,40px)">
      <div style="background:var(--color-accent-100);border-radius:28px;padding:clamp(28px,4vw,56px) clamp(24px,4vw,48px);border-left:6px solid var(--color-accent-2)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:36px">
          <p class="rm-eyebrow rm-kick" style="margin:0">{{ copy.eyebrow }}</p>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;letter-spacing:0.1em;color:var(--color-neutral-700)">{{ counter() }}</span>
            <button type="button" class="btn rm-arrow" aria-label="Previous testimony" (click)="step(-1)">←</button>
            <button type="button" class="btn rm-arrow" aria-label="Next testimony" (click)="step(1)">→</button>
          </div>
        </div>
        <div aria-live="polite">
          @for (item of testimonials; track $index; let i = $index) {
            <div [hidden]="i !== active()" [style.animation]="i === active() ? anim() : null">
              <blockquote class="rm-quotetext" [attr.lang]="item.lang">“{{ item.quote }}”</blockquote>
              <div class="rm-quotesrc">{{ item.source }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Testimony {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.testimony;
  protected readonly testimonials = this.content.testimonials;

  protected readonly active = signal(0);
  private readonly forward = signal(true);
  private readonly tick = signal(0);

  protected readonly counter = computed(
    () => `${this.active() + 1} / ${this.testimonials.length}`
  );
  protected readonly anim = computed(() =>
    alternateQuote(this.forward(), this.tick(), 460)
  );

  protected step(direction: 1 | -1) {
    const total = this.testimonials.length;
    this.forward.set(direction === 1);
    this.tick.update((t) => t + 1);
    this.active.update((i) => (i + direction + total) % total);
  }
}
