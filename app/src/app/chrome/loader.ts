import {
  ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal,
} from '@angular/core';
import { ContentService } from '../content/content.service';

const SETTLE_MS = 380;    // brief hold so the mark is seen rather than flashed
const FAILSAFE_MS = 2600; // a stalled image must never leave the page covered

@Component({
  selector: 'div[rmLoader]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'rm-loader', 'aria-hidden': 'true', '[attr.data-done]': 'done()' },
  template: `
    <img src="assets/logo-mark.png" [alt]="wordmark" width="438" height="320">
    <div class="rm-loadtrack"><i></i></div>
    <div class="rm-loadword">We understand human</div>
  `,
})
export class Loader {
  protected readonly wordmark = inject(ContentService).site.wordmark;
  protected readonly done = signal(false);

  constructor() {
    const timers: ReturnType<typeof setTimeout>[] = [];

    afterNextRender(() => {
      const dismiss = () => this.done.set(true);
      timers.push(setTimeout(dismiss, FAILSAFE_MS));

      if (document.readyState === 'complete') {
        timers.push(setTimeout(dismiss, SETTLE_MS));
      } else {
        addEventListener('load', () => timers.push(setTimeout(dismiss, SETTLE_MS)), {
          once: true,
        });
      }
    });

    inject(DestroyRef).onDestroy(() => timers.forEach(clearTimeout));
  }
}
