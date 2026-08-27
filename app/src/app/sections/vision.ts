import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'section[rmVision]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2" style="max-width:30ch">{{ copy.heading }}</h2>
      <p class="rm-lead" style="margin-bottom:48px">{{ copy.lead }}</p>
      <p class="rm-eyebrow rm-kick">{{ copy.missionEyebrow }}</p>
      <div class="rm-grid">
        @for (card of copy.mission; track card.title) {
          <div class="rm-card rm-panelcard">
            <h4 class="rm-cardtitle">{{ card.title }}</h4>
            <p class="rm-cardbody">{{ card.body }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class Vision {
  protected readonly copy = inject(ContentService).sections.vision;
}
