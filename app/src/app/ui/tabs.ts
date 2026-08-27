import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Tab strip for the approach / formats / programs sections.
 *
 * Owns only the buttons; each section renders its own panels and keeps them in
 * the DOM with [hidden] rather than @if, so every panel's content reaches the
 * prerendered HTML. Using @if would drop the hard-skills programs from the
 * markup entirely.
 */
@Component({
  selector: 'div[rmTabs]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'rm-tabrow', 'role': 'tablist', '[attr.aria-label]': 'label()' },
  template: `
    @for (item of labels(); track item; let i = $index) {
      <button
        type="button"
        class="rm-tab"
        role="tab"
        [id]="group() + '-tab-' + i"
        [attr.aria-controls]="group() + '-' + i"
        [attr.aria-selected]="i === selected()"
        [tabIndex]="i === selected() ? 0 : -1"
        (click)="selected.set(i)"
        (keydown)="onKey($event, i)"
      >{{ item }}</button>
    }
  `,
})
export class Tabs {
  readonly labels = input.required<readonly string[]>();
  readonly group = input.required<string>();
  readonly label = input('');
  readonly selected = model(0);

  protected onKey(event: KeyboardEvent, index: number) {
    const count = this.labels().length;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next === null) return;

    event.preventDefault();
    this.selected.set(next);

    const target = event.currentTarget as HTMLElement;
    const buttons = target.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
    buttons?.[next]?.focus();
  }
}
