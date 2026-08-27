import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { ContentService } from '../content/content.service';

const WA = 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2m5.8 14c-.25.7-1.45 1.35-2.01 1.4-.56.06-1.08.28-3.62-.75-2.99-1.22-4.86-4.34-5-4.54-.15-.2-1.19-1.62-1.19-3.09s.77-2.19 1.04-2.49c.27-.3.59-.37.79-.37s.4.01.57.01c.18 0 .43-.07.67.51.25.6.84 2.06.91 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.18 1.42';
const CLOSE = 'M18 6 6 18M6 6l12 12';

@Component({
  selector: 'div[rmWhatsapp]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'rm-fab',
    '[attr.data-open]': 'open()',
    '(document:keydown.escape)': 'open.set(false)',
    '(document:pointerdown)': 'onDocumentDown($event)',
  },
  template: `
    <div class="rm-fabcard" id="rm-fabcard">
      <div style="background:#128c7e;color:#ffffff;padding:16px 18px;display:flex;align-items:center;gap:12px">
        <span style="width:38px;height:38px;border-radius:999px;background:#ffffff;display:flex;align-items:center;justify-content:center;flex:0 0 auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#128c7e" aria-hidden="true"><path [attr.d]="waPath"></path></svg>
        </span>
        <span>
          <span style="display:block;font-family:var(--font-heading);font-weight:500;font-size:15px">Rumah Manusia</span>
          <span style="display:block;font-size:12px;opacity:0.85">Typically replies within an hour</span>
        </span>
      </div>
      <div style="padding:16px 18px 18px;display:flex;flex-direction:column;gap:10px">
        <p style="margin:0 0 4px;font-size:14px;color:var(--color-neutral-800)">Hello. What would you like to ask about?</p>
        @for (ask of site.quickAsks; track $index) {
          <button type="button" class="rm-quick" (click)="send(ask)">{{ ask }}</button>
        }
        <a [href]="plainLink" target="_blank" rel="noopener"
           style="margin-top:4px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Or write your own message</a>
      </div>
    </div>

    <button type="button" class="rm-fabbtn" style="position:relative"
            [attr.aria-label]="open() ? 'Close chat' : 'Chat on WhatsApp'"
            [attr.aria-expanded]="open()" aria-controls="rm-fabcard"
            (click)="open.set(!open())">
      <span class="rm-fabpulse"></span>
      <svg width="28" height="28" viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round"
           stroke-linejoin="round" style="position:relative" aria-hidden="true"
           [attr.fill]="open() ? 'none' : '#ffffff'" [attr.stroke]="open() ? '#ffffff' : 'none'">
        <path [attr.d]="open() ? closePath : waPath"></path>
      </svg>
    </button>
  `,
})
export class Whatsapp {
  protected readonly site = inject(ContentService).site;
  protected readonly open = signal(false);
  protected readonly waPath = WA;
  protected readonly closePath = CLOSE;
  protected readonly plainLink = `https://wa.me/${this.site.whatsapp}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected send(message: string) {
    window.open(`${this.plainLink}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    this.open.set(false);
  }

  protected onDocumentDown(event: Event) {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
