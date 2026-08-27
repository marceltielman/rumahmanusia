import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentService } from '../content/content.service';
import { ThemeService } from '../ui/theme.service';

const BURGER = 'M3 6h18M3 12h18M3 18h18';
const CLOSE = 'M18 6 6 18M6 6l12 12';

@Component({
  selector: 'header[rmHeader]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'rm-head',
    'style': 'position:sticky;top:0;z-index:50;background:var(--color-bg);border-bottom:1px solid var(--color-divider)',
  },
  template: `
    <div class="rm-headinner" style="max-width:1120px;margin:0 auto;padding:12px clamp(20px,4vw,40px);min-height:76px;display:flex;align-items:center;gap:32px;flex-wrap:wrap">
      <a href="#top" style="display:flex;align-items:center;gap:12px;color:var(--color-text);text-decoration:none">
        <img src="assets/logo-mark.png" [alt]="site.wordmark" class="rm-brand rm-brandmark"
             width="438" height="320" style="height:42px;width:auto">
        <span class="rm-wordmark" style="font-family:var(--font-heading);font-weight:500;font-size:18px;letter-spacing:-0.02em">{{ site.wordmark }}</span>
      </a>

      <button type="button" class="rm-themebtn rm-iconbtn" style="order:2"
              [attr.aria-label]="theme.label()" [attr.title]="theme.label()"
              (click)="theme.toggle()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path [attr.d]="theme.iconPath()"></path>
        </svg>
      </button>

      <button type="button" class="rm-burger" style="order:3" aria-label="Menu"
              [attr.aria-expanded]="open()" aria-controls="rm-nav" (click)="toggle()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path [attr.d]="open() ? closePath : burgerPath"></path>
        </svg>
      </button>

      <nav class="rm-nav" id="rm-nav" [attr.data-open]="open()"
           style="display:flex;gap:20px;margin-left:auto;align-items:center;flex-wrap:wrap">
        @for (item of site.nav; track item.href) {
          <a [href]="item.href" class="rm-navlink" (click)="close()">{{ item.label }}</a>
        }
        <a class="btn btn-primary" href="#contact" style="text-decoration:none" (click)="close()">{{ site.cta }}</a>
      </nav>
    </div>
  `,
})
export class Header {
  protected readonly site = inject(ContentService).site;
  protected readonly theme = inject(ThemeService);
  protected readonly open = signal(false);
  protected readonly burgerPath = BURGER;
  protected readonly closePath = CLOSE;

  protected toggle() { this.open.update((v) => !v); }
  protected close() { this.open.set(false); }
}
