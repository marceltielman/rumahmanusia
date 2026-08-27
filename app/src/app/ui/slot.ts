import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Photo placeholder. Renders the uploaded image when Sanity has one, and the
 * caption describing what belongs there when it does not.
 */
@Component({
  selector: 'rm-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'rm-slot' },
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="caption()" loading="lazy" decoding="async">
    } @else {
      <span>{{ caption() }}</span>
    }
  `,
})
export class Slot {
  readonly src = input<string | null>(null);
  readonly caption = input.required<string>();
}
