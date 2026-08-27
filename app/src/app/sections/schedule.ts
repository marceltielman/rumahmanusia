import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
} from '@angular/core';
import { ContentService } from '../content/content.service';
import { alternate } from '../ui/anim';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PLAY = 'M6 4l14 8-14 8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';

const TIMELINE_SPAN = 1000;   // drawing width inside a 1080 viewBox, inset 40
const BAR_TRACK = 196;        // usable width inside a 200 viewBox
const BAR_UNIT = 10;          // pixels of bar height per topic
const BAR_FLOOR = 56;

const ACCENT = 'var(--color-accent)';
const IDLE = 'var(--color-neutral-300)';

@Component({
  selector: 'section[rmSchedule]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'schedule' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>

      <div style="display:flex;align-items:center;gap:14px;margin-top:28px">
        <button type="button" class="btn btn-secondary" style="gap:10px"
                [attr.aria-pressed]="playing()" (click)="togglePlay()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path [attr.d]="playing() ? pausePath : playPath"></path>
          </svg>
          <span>{{ playing() ? 'Pause' : copy.playLabel }}</span>
        </button>
        <span class="text-muted" style="font-size:13px">{{ copy.playHint }}</span>
      </div>

      <div style="margin-top:16px;background:var(--color-surface);border-radius:24px;padding:20px 12px">
        <!-- Not aria-hidden: these nodes are the only way to change month on
             desktop, where the pill row is display:none. The decorative parts
             are hidden individually instead. -->
        <svg class="rm-tl rm-tl-svg" viewBox="0 0 1080 150" style="width:100%;height:auto"
             role="group" [attr.aria-label]="copy.eyebrow + ' timeline'">
          <line x1="40" y1="75" x2="1040" y2="75" stroke="var(--color-neutral-300)" stroke-width="2" aria-hidden="true"></line>
          @for (m of months(); track m.month) {
            <svg:g class="rm-tl-node" style="cursor:pointer" role="button" tabindex="0"
                   [attr.aria-label]="m.label" [attr.aria-pressed]="m.index === active()"
                   (click)="pick(m.index)" (keydown)="onKey($event, m.index)">
              <svg:line aria-hidden="true" [attr.x1]="m.x" [attr.y1]="m.tickY1" [attr.x2]="m.x" [attr.y2]="m.tickY2"
                        stroke="var(--color-neutral-300)" stroke-width="2" />
              <svg:circle [attr.cx]="m.x" cy="75"
                          [attr.r]="m.index === active() ? 9 : 5"
                          [attr.fill]="m.index === active() ? accent : idle" />
              <svg:text aria-hidden="true" [attr.x]="m.x" [attr.y]="m.labelY" text-anchor="middle"
                        font-family="Archivo" font-size="13"
                        [attr.font-weight]="m.index === active() ? 600 : 400"
                        fill="var(--color-text)">{{ m.label }}</svg:text>
              <svg:rect [attr.x]="m.x" y="20" width="1" height="110" fill="transparent" />
            </svg:g>
          }
        </svg>

        <div class="rm-tl-pills" style="display:none;gap:8px;overflow-x:auto;padding:4px 4px 8px">
          @for (m of months(); track m.month) {
            <button type="button" class="rm-mpill"
                    [attr.aria-selected]="m.index === active()" (click)="pick(m.index)">{{ m.label }}</button>
          }
        </div>
      </div>

      <div style="margin-top:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:32px;align-items:start">
        <div>
          <div [style.animation]="monthAnim()">
            <div class="rm-monthlabel">{{ current().label }}</div>
          </div>
          <svg class="rm-bar" viewBox="0 0 200 60" style="width:100%;height:auto;display:block;margin-top:20px"
               role="group" [attr.aria-label]="copy.chartLabel">
            @for (m of months(); track m.month) {
              <svg:g class="rm-bargroup" style="cursor:pointer" role="button" tabindex="0"
                     [attr.aria-label]="m.label + ', ' + m.count + ' topics'"
                     [attr.aria-pressed]="m.index === active()"
                     (click)="pick(m.index)" (keydown)="onKey($event, m.index)">
                <svg:rect [attr.x]="m.hitX" y="0" [attr.width]="m.hitW" height="60" fill="transparent" />
                <svg:rect [attr.x]="m.barX" [attr.y]="m.barY" [attr.width]="m.barW" [attr.height]="m.barH"
                          rx="3" [attr.fill]="m.index === active() ? accent : idle" />
              </svg:g>
            }
          </svg>
          <div class="rm-metalabel" style="margin-top:8px">{{ copy.chartLabel }}</div>
          <div class="rm-metalabel" style="margin-top:12px">{{ current().count }} topics</div>
        </div>

        <div>
          @for (m of months(); track m.month) {
            <ul class="rm-topics" [class.rm-play]="m.index === active()"
                [hidden]="m.index !== active()"
                [style.animation]="m.index === active() ? monthAnim() : null">
              @for (topic of m.topics; track $index) {
                <li>{{ topic }}</li>
              }
            </ul>
          }
        </div>
      </div>
    </div>
  `,
})
export class Schedule {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.schedule;
  protected readonly playPath = PLAY;
  protected readonly pausePath = PAUSE;
  protected readonly accent = ACCENT;
  protected readonly idle = IDLE;

  protected readonly active = signal(0);
  protected readonly playing = signal(false);
  private readonly tick = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  /* Labels and both charts derive from the stored YYYY-MM values, so adding or
   * removing a month redraws everything without touching coordinates. */
  protected readonly months = computed(() => {
    const source = this.content.schedule;
    const total = source.length;
    const step = total > 1 ? TIMELINE_SPAN / (total - 1) : 0;
    const pitch = BAR_TRACK / total;
    const firstYear = Number(source[0].month.slice(0, 4));
    const round = (n: number) => Math.round(n * 100) / 100;

    return source.map((m, index) => {
      const [year, month] = m.month.split('-').map(Number);
      const above = index % 2 === 1;
      const barH = Math.min(m.topics.length * BAR_UNIT, BAR_FLOOR);

      return {
        index,
        month: m.month,
        topics: m.topics,
        count: m.topics.length,
        label: MONTH_NAMES[month - 1] + (year === firstYear ? '' : ` ${year}`),
        x: round(40 + index * step),
        labelY: above ? 34 : 116,
        tickY1: above ? 44 : 106,
        tickY2: above ? 66 : 84,
        hitX: round(2 + index * pitch),
        hitW: round(pitch),
        barX: round(4 + index * pitch),
        barW: round(Math.max(2, pitch - 4)),
        barY: BAR_FLOOR - barH,
        barH,
      };
    });
  });

  protected readonly current = computed(() => this.months()[this.active()]);
  protected readonly monthAnim = computed(() => alternate('rm-in', this.tick(), 420));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected pick(index: number) {
    this.stop();
    this.select(index);
  }

  protected onKey(event: KeyboardEvent, index: number) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.pick(index);
  }

  protected togglePlay() {
    if (this.playing()) {
      this.stop();
      return;
    }
    this.playing.set(true);
    this.timer = setInterval(
      () => this.select((this.active() + 1) % this.months().length),
      this.content.site.autoplayMs
    );
  }

  private select(index: number) {
    this.active.set(index);
    this.tick.update((t) => t + 1);
  }

  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.playing.set(false);
  }
}
