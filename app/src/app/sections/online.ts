import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Slot } from '../ui/slot';

@Component({
  selector: 'section[rmOnline]',
  imports: [Slot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'online' },
  template: `
    <div class="rm-wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:clamp(32px,4vw,56px);align-items:start">
      <div>
        <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
        <h2 class="rm-h2" style="font-size:34px">{{ copy.heading }}</h2>
        <p class="rm-lead" style="font-size:16px">{{ copy.lead }}</p>
        <div class="grayscale" style="height:240px;margin-top:28px;border-radius:20px;overflow:hidden">
          <rm-slot [src]="copy.image" [caption]="copy.slot" />
        </div>
      </div>
      <div>
        <p class="rm-eyebrow rm-kick">{{ copy.modulesLabel }}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:40px">
          @for (item of online.modules; track $index) {
            <div class="rm-card" style="background:var(--color-surface);border-radius:12px;padding:22px 18px;font-family:var(--font-heading);font-weight:400;font-size:17px">{{ item }}</div>
          }
        </div>
        <p class="rm-eyebrow rm-kick">{{ copy.webinarsLabel }}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          @for (item of online.webinars; track $index) {
            <div class="rm-card" style="background:var(--color-surface);border-radius:12px;padding:22px 18px;font-family:var(--font-heading);font-weight:400;font-size:17px">{{ item }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Online {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.online;
  protected readonly online = this.content.online;
}
