import {
  ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal,
} from '@angular/core';
import { ContentService } from '../content/content.service';
import { Slot } from '../ui/slot';

const DURATION_MS = 1400;

@Component({
  selector: 'section[rmHero]',
  imports: [Slot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'top' },
  template: `
    <div style="max-width:1120px;margin:0 auto;padding:clamp(44px,6vw,88px) clamp(20px,4vw,40px) 0">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(32px,4vw,56px);align-items:start">
        <div class="rm-hero" [class.rm-lit]="lit()">
          <p class="rm-eyebrow rm-kick">{{ hero.eyebrow }}</p>
          <h1 style="font-size:clamp(34px,5.4vw,60px);line-height:1.06;letter-spacing:-0.03em;font-weight:500;margin:0 0 24px;text-wrap:pretty">{{ hero.heading }}</h1>
          <p style="font-size:clamp(17px,1.6vw,20px);line-height:1.55;color:var(--color-neutral-800);max-width:46ch;margin:0 0 32px">{{ hero.lead }}</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px">
            <a class="btn btn-primary" href="#contact">{{ site.cta }}</a>
            <a class="btn btn-secondary" [href]="hero.secondaryCta.href">{{ hero.secondaryCta.label }}</a>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            @for (tag of hero.tags; track $index) {
              <span class="tag tag-outline">{{ tag }}</span>
            }
          </div>
        </div>

        <div class="rm-panel" [class.rm-lit]="lit()"
             style="background:var(--color-surface);border-radius:24px;padding:12px;overflow:hidden">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            @for (stat of counted(); track stat.label) {
              <div class="rm-stat">
                <div class="rm-stat-v">{{ stat.shown }}</div>
                <div class="rm-stat-l">{{ stat.label }}</div>
              </div>
            }
          </div>
          <div class="grayscale" style="height:220px;border-radius:16px;overflow:hidden;margin-top:16px">
            <rm-slot [src]="hero.images.panel" [caption]="hero.slots.panel" />
          </div>
        </div>
      </div>

      <div class="grayscale" style="height:400px;margin-top:72px;border-radius:28px;overflow:hidden">
        <rm-slot [src]="hero.images.wide" [caption]="hero.slots.wide" />
      </div>
    </div>
  `,
})
export class Hero {
  private readonly content = inject(ContentService);
  protected readonly site = this.content.site;
  protected readonly hero = this.content.hero;

  /* Starts at 1 so the prerendered HTML carries the real figures — a visitor
   * without JavaScript must not be told there are 0 training programs. The
   * client rewinds to 0 and counts up, which is invisible because the hero is
   * still transparent until .rm-lit lands. */
  private readonly progress = signal(1);
  protected readonly lit = signal(false);

  protected readonly counted = computed(() =>
    this.hero.stats.map((stat) => ({
      label: stat.label,
      shown: Math.round(stat.from + (stat.to - stat.from) * this.progress()) + stat.suffix,
    }))
  );

  constructor() {
    // Browser only: during prerender the markup keeps its starting values.
    afterNextRender(() => {
      this.lit.set(true);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      this.progress.set(0);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        this.progress.set(1 - Math.pow(1 - t, 3));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
}
