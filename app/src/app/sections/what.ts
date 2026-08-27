import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Icon } from '../ui/icon';

@Component({
  selector: 'section[rmWhat]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'what' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>
      <p class="rm-lead" style="margin-bottom:48px">{{ copy.lead }}</p>
      <div class="rm-grid">
        @for (service of services; track service.num) {
          <div class="rm-card rm-panelcard">
            <div class="rm-cardhead">
              <svg [rmIcon]="service.icon"></svg>
              <span class="rm-cardnum">{{ service.num }}</span>
            </div>
            <h4 class="rm-cardtitle">{{ service.name }}</h4>
            <p class="rm-cardbody">{{ service.body }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class What {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.what;
  protected readonly services = this.content.services;
}
