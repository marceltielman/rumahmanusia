import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'footer[rmFooter]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'style': 'margin:clamp(32px,5vw,56px) clamp(16px,4vw,40px) clamp(24px,4vw,40px);background:#0a0f12;color:#ccdae1;border-radius:28px;overflow:hidden',
  },
  template: `
    <div style="max-width:1120px;margin:0 auto;padding:clamp(36px,5vw,56px) clamp(24px,4vw,40px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:32px">
      <div>
        <img src="assets/logo-mark.png" [alt]="site.wordmark" width="438" height="320"
             style="height:52px;width:auto;background:#ffffff;border-radius:10px;padding:6px 8px;display:block;margin-bottom:14px">
        <div style="font-family:var(--font-heading);font-weight:500;font-size:18px;color:#ffffff">{{ site.wordmark }}</div>
        <p style="margin:10px 0 0;font-size:14px">{{ site.tagline }}</p>
      </div>
      <div>
        <p class="rm-footlabel">Services</p>
        <p class="rm-footlist">
          @for (s of site.footer.services; track $index) {{{ s }}<br>}
        </p>
      </div>
      <div>
        <p class="rm-footlabel">Explore</p>
        <nav class="rm-footnav">
          @for (link of site.footer.explore; track link.href) {
            <a [href]="link.href">{{ link.label }}</a>
          }
        </nav>
      </div>
      <div>
        <p class="rm-footlabel">Follow</p>
        <p class="rm-footlist">
          @for (f of site.footer.follow; track $index) {{{ f }}<br>}
        </p>
      </div>
    </div>
    <div style="border-top:1px solid #222f35">
      <div style="max-width:1120px;margin:0 auto;padding:20px clamp(24px,4vw,40px);font-size:13px;color:#7d919c">{{ site.footer.legal }}</div>
    </div>
  `,
})
export class Footer {
  protected readonly site = inject(ContentService).site;
}
