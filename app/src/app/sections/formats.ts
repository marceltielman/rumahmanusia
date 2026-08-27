import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Slot } from '../ui/slot';
import { Tabs } from '../ui/tabs';
import { alternate } from '../ui/anim';

@Component({
  selector: 'section[rmFormats]',
  imports: [Slot, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'experiences' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>

      <div rmTabs group="rm-aud" label="Audiences" style="margin:36px 0 0"
           [labels]="names()" [(selected)]="selected"></div>

      @for (audience of audiences; track audience.name; let i = $index) {
        <div class="rm-grid rm-tabpanel" role="tabpanel"
             [id]="'rm-aud-' + i" [attr.aria-labelledby]="'rm-aud-tab-' + i"
             [hidden]="i !== selected()"
             [style.animation]="i === selected() ? anim() : null"
             style="margin-top:32px">
          @for (item of audience.items; track item.num) {
            <div class="rm-card rm-panelcard">
              <span class="tag tag-accent" style="margin-bottom:16px;display:inline-flex">{{ item.num }}</span>
              <h4 class="rm-cardtitle">{{ item.title }}</h4>
              <p class="rm-cardbody">{{ item.body }}</p>
            </div>
          }
        </div>
      }

      <div class="rm-grid" style="margin-top:16px">
        @for (caption of copy.slots; track caption; let i = $index) {
          <div class="grayscale" style="height:200px;border-radius:16px;overflow:hidden">
            <rm-slot [src]="photo(i)" [caption]="caption" />
          </div>
        }
      </div>
    </div>
  `,
})
export class Formats {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.formats;
  protected readonly audiences = this.content.audiences;

  protected readonly selected = signal(0);
  protected readonly names = computed(() => this.audiences.map((a) => a.name));
  protected readonly anim = computed(() => alternate('rm-t', this.selected(), 420));

  protected photo = (index: number) => this.copy.images?.[index] ?? null;
}
