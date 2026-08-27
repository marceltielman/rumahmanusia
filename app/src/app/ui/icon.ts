import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICON_PATHS } from './icons';
import type { IconName } from '../content/content.types';

/**
 * Attribute selector on the <svg> itself, so no wrapper element appears in the
 * DOM. That matters: the stylesheet reaches icons with descendant selectors
 * like `.rm-card:hover .rm-icon`, and structural selectors elsewhere count
 * direct children.
 */
@Component({
  selector: 'svg[rmIcon]',
  template: '<svg:path [attr.d]="path()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'rm-icon',
    'width': '26',
    'height': '26',
    'viewBox': '0 0 24 24',
    'fill': 'none',
    'stroke-width': '1.6',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    '[attr.stroke]': 'stroke()',
  },
})
export class Icon {
  readonly rmIcon = input.required<IconName>();
  readonly stroke = input('var(--color-accent)');
  protected readonly path = computed(() => ICON_PATHS[this.rmIcon()]);
}
