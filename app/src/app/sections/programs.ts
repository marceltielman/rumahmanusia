import {
  ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal,
} from '@angular/core';
import { ContentService } from '../content/content.service';
import { Tabs } from '../ui/tabs';
import { alternate } from '../ui/anim';

@Component({
  selector: 'section[rmPrograms]',
  imports: [Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'programs' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px;flex-wrap:wrap">
        <div>
          <h2 class="rm-h2" style="margin-bottom:10px">{{ copy.heading }}</h2>
          <p class="text-muted" style="margin:0;font-size:14px" role="status">{{ countLabel() }}</p>
        </div>
        <div class="field" style="flex:1 1 260px;min-width:0;max-width:360px">
          <label for="rm-search">{{ copy.searchLabel }}</label>
          <input class="input" id="rm-search" type="search" autocomplete="off"
                 [placeholder]="copy.searchPlaceholder"
                 [value]="query()" (input)="onSearch($event)">
        </div>
      </div>

      <div rmTabs group="rm-track" label="Program tracks" style="margin-top:28px"
           [labels]="names()" [(selected)]="track"></div>

      @for (t of tracks; track t.name; let ti = $index) {
        <div class="rm-prog-grid rm-tabpanel" role="tabpanel"
             [id]="'rm-track-' + ti" [attr.aria-labelledby]="'rm-track-tab-' + ti"
             [hidden]="ti !== track()"
             [style.animation]="ti === track() ? anim() : null"
             style="margin-top:24px">
          @for (program of t.programs; track $index; let i = $index) {
            <div class="rm-row rm-prog" [hidden]="ti === track() && !shown().has(i)">
              <span class="rm-prog-no">{{ pad(i + 1) }}</span>
              <span class="rm-prog-name">{{ program }}</span>
            </div>
          }
        </div>
      }

      <p class="text-muted" style="margin-top:16px;font-size:14px">{{ emptyNote() }}</p>
      @if (showToggle()) {
        <button type="button" class="btn btn-secondary" style="margin-top:8px" (click)="toggle()">
          {{ toggleLabel() }}
        </button>
      }
    </div>
  `,
})
export class Programs {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.programs;
  protected readonly tracks = this.content.programs.tracks;
  private readonly limit = this.content.site.collapsedPrograms;

  protected readonly track = signal(0);
  protected readonly query = signal('');

  /* Collapses again whenever the track changes: the other track has its own
   * length, so carrying "show all" across would skip the collapse entirely. */
  private readonly showAll = linkedSignal<number, boolean>({
    source: this.track,
    computation: () => false,
  });

  protected readonly names = computed(() => this.tracks.map((t) => t.name));
  protected readonly anim = computed(() => alternate('rm-t', this.track(), 420));

  private readonly active = computed(() => this.tracks[this.track()].programs);

  /** Indices matching the search, before the collapse limit is applied. */
  private readonly matched = computed(() => {
    const needle = this.query().trim().toLowerCase();
    return this.active()
      .map((name, i) => ({ name, i }))
      .filter(({ name }) => !needle || name.toLowerCase().includes(needle))
      .map(({ i }) => i);
  });

  private readonly collapsed = computed(
    () => !this.showAll() && !this.query().trim() && this.matched().length > this.limit
  );

  /** Indices actually visible in the active track. */
  protected readonly shown = computed(() => {
    const matched = this.matched();
    return new Set(this.collapsed() ? matched.slice(0, this.limit) : matched);
  });

  protected readonly countLabel = computed(
    () => `${this.shown().size} of ${this.active().length} programs`
  );
  protected readonly emptyNote = computed(() =>
    this.matched().length ? '' : this.copy.emptyNote
  );
  protected readonly showToggle = computed(() => this.collapsed() || this.showAll());
  protected readonly toggleLabel = computed(() =>
    this.collapsed() ? `Show all ${this.active().length} programs` : 'Show fewer'
  );

  protected onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggle() {
    this.showAll.update((v) => !v);
  }

  protected pad = (n: number) => String(n).padStart(2, '0');
}
