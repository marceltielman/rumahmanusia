import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Icon } from '../ui/icon';
import { Tabs } from '../ui/tabs';
import { alternate } from '../ui/anim';

@Component({
  selector: 'section[rmStrategies]',
  imports: [Icon, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'strategies' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>
      <p class="rm-lead">{{ copy.lead }}</p>

      <div rmTabs group="rm-strat" label="Core strategies" style="margin:36px 0 0"
           [labels]="names()" [(selected)]="selected"></div>

      @for (strategy of strategies; track strategy.name; let i = $index) {
        <div class="rm-grid rm-tabpanel" role="tabpanel"
             [id]="'rm-strat-' + i" [attr.aria-labelledby]="'rm-strat-tab-' + i"
             [hidden]="i !== selected()"
             [style.animation]="i === selected() ? anim() : null"
             style="margin-top:28px">
          @for (item of strategy.items; track item.name; let n = $index) {
            <div class="rm-card" style="background:var(--color-surface);border-radius:16px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;min-height:118px">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <svg [rmIcon]="item.icon"></svg>
                <span class="rm-cardnum">{{ pad(n + 1) }}</span>
              </div>
              <span style="font-family:var(--font-heading);font-weight:500;font-size:18px;line-height:1.25;letter-spacing:-0.01em;margin-top:20px">{{ item.name }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class Strategies {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.strategies;
  protected readonly strategies = this.content.strategies;

  protected readonly selected = signal(0);
  protected readonly names = computed(() => this.strategies.map((s) => s.name));
  protected readonly anim = computed(() => alternate('rm-t', this.selected(), 420));

  protected pad = (n: number) => String(n).padStart(2, '0');
}
