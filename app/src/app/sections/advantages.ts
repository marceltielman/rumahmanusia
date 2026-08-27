import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Icon } from '../ui/icon';

@Component({
  selector: 'section[rmAdvantages]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'advantages' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>
      <div class="rm-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));margin-top:40px">
        @for (item of advantages; track item.num) {
          <div class="rm-card rm-panelcard">
            <div style="display:flex;align-items:center;gap:12px">
              <svg [rmIcon]="item.icon" stroke="var(--color-accent-2-800)"></svg>
              <span style="font-family:var(--font-heading);font-weight:500;font-size:22px;color:var(--color-accent-2-800);line-height:1">{{ item.num }}</span>
            </div>
            <h4 class="rm-cardtitle" style="margin:14px 0 10px">{{ item.title }}</h4>
            <p class="rm-cardbody">{{ item.body }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class Advantages {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.advantages;
  protected readonly advantages = this.content.advantages;
}
