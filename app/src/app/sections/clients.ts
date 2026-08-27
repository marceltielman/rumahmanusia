import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

@Component({
  selector: 'section[rmClients]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'clients' },
  template: `
    <div class="rm-wrap" style="padding:clamp(32px,4vw,48px) clamp(20px,4vw,40px)">
      <p class="rm-eyebrow">{{ copy.eyebrow }}</p>
      <div class="rm-marquee" style="position:relative;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)">
        <div class="rm-track" style="display:flex;gap:16px;width:max-content">
          @for (tile of loop(); track $index) {
            <div class="rm-logo">
              <div class="rm-logo-frame">
                <img [src]="tile.src" [alt]="tile.name" loading="lazy" width="32" height="32">
              </div>
              <span class="rm-logo-name">{{ tile.name }}</span>
            </div>
          }
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px">
        @for (name of clients.all; track $index) {
          <span class="rm-clientpill">{{ name }}</span>
        }
      </div>
    </div>
  `,
})
export class Clients {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.clients;
  protected readonly clients = this.content.clients;

  /* Duplicated once: the track animates to -50%, so the second pass is what
   * makes the loop seamless. */
  protected readonly loop = computed(() => {
    const tiles = this.clients.featured.map((c) => ({
      name: c.name,
      src: c.logo ?? `https://www.google.com/s2/favicons?domain=${c.domain}&sz=128`,
    }));
    return [...tiles, ...tiles];
  });
}
