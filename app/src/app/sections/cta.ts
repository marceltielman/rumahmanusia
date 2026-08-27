import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'section[rmCta]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'style': 'padding:0 clamp(20px,4vw,40px)' },
  template: `
    <div style="max-width:1120px;margin:0 auto;background:var(--color-accent);color:#ffffff;border-radius:28px">
      <div style="max-width:1120px;margin:0 auto;padding:clamp(44px,6vw,88px) clamp(24px,4vw,40px);display:flex;gap:40px;justify-content:space-between;align-items:flex-end;flex-wrap:wrap">
        <div>
          <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 18px">{{ copy.eyebrow }}</p>
          <h2 style="font-size:clamp(28px,4vw,44px);line-height:1.1;letter-spacing:-0.02em;font-weight:500;margin:0;max-width:26ch">{{ copy.heading }}</h2>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn" href="#contact" style="background:#ffffff;color:var(--color-accent-800)">{{ site.cta }}</a>
          <a class="btn" [href]="copy.secondary.href" style="border:2px solid #ffffff;color:#ffffff">{{ copy.secondary.label }}</a>
        </div>
      </div>
    </div>
  `,
})
export class Cta {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.cta;
  protected readonly site = this.content.site;
}
