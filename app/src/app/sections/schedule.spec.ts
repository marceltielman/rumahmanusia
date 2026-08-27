import { TestBed } from '@angular/core/testing';
import { Schedule } from './schedule';
import { ContentService } from '../content/content.service';

/**
 * The chart coordinates used to be hand-written into the SVG. They are now
 * derived from the month list, so these tests pin the derivation: labels, the
 * year suffix rule, and both charts' geometry.
 */
describe('Schedule', () => {
  function build(months: { month: string; topics: string[] }[]) {
    TestBed.configureTestingModule({
      providers: [{ provide: ContentService, useValue: stubContent(months) }],
    });
    const fixture = TestBed.createComponent(Schedule);
    // `months` is protected; reach it as the template does.
    return fixture.componentInstance as unknown as {
      months: () => ReadonlyArray<Record<string, number | string | readonly string[]>>;
    };
  }

  function stubContent(months: { month: string; topics: string[] }[]) {
    return {
      schedule: months,
      site: { autoplayMs: 2200 },
      sections: {
        schedule: { eyebrow: 'e', heading: 'h', playLabel: 'p', playHint: 'ph', chartLabel: 'c' },
      },
    };
  }

  const fourteen = Array.from({ length: 14 }, (_, i) => ({
    month: i < 12 ? `2026-${String(i + 1).padStart(2, '0')}` : `2027-${String(i - 11).padStart(2, '0')}`,
    topics: ['a', 'b', 'c'],
  }));

  it('labels months, adding the year only once it differs from the first', () => {
    const rows = build(fourteen).months();
    expect(rows[0]['label']).toBe('Jan');
    expect(rows[11]['label']).toBe('Dec');
    expect(rows[12]['label']).toBe('Jan 2027');
    expect(rows[13]['label']).toBe('Feb 2027');
  });

  it('spans the timeline from the left to the right inset', () => {
    const rows = build(fourteen).months();
    expect(rows[0]['x']).toBe(40);
    expect(rows[13]['x']).toBe(1040);
  });

  it('scales bar height to the topic count and keeps bars on the baseline', () => {
    const rows = build([
      { month: '2026-01', topics: ['a', 'b'] },
      { month: '2026-02', topics: ['a', 'b', 'c', 'd', 'e'] },
    ]).months();

    expect(rows[0]['barH']).toBe(20);
    expect(rows[0]['barY']).toBe(36);
    expect(rows[1]['barH']).toBe(50);
    expect(rows[1]['barY']).toBe(6);
  });

  it('caps a bar at the chart floor rather than overflowing the viewBox', () => {
    const rows = build([{ month: '2026-01', topics: Array(20).fill('t') }]).months();
    expect(rows[0]['barH']).toBe(56);
    expect(rows[0]['barY']).toBe(0);
  });

  it('redraws for a different month count instead of assuming fourteen', () => {
    const rows = build([
      { month: '2026-01', topics: ['a'] },
      { month: '2026-02', topics: ['a'] },
      { month: '2026-03', topics: ['a'] },
    ]).months();

    expect(rows).toHaveLength(3);
    expect(rows[0]['x']).toBe(40);
    expect(rows[2]['x']).toBe(1040);
    expect(rows[1]['x']).toBe(540);
  });

  it('alternates label position so adjacent labels cannot collide', () => {
    const rows = build(fourteen).months();
    expect(rows[0]['labelY']).not.toBe(rows[1]['labelY']);
    expect(rows[0]['labelY']).toBe(rows[2]['labelY']);
  });
});
