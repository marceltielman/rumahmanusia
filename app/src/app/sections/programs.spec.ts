import { TestBed } from '@angular/core/testing';
import { Programs } from './programs';
import { ContentService } from '../content/content.service';

const SOFT = Array.from({ length: 51 }, (_, i) => `SOFT PROGRAM ${i + 1}`);
const HARD = [
  ...Array.from({ length: 17 }, (_, i) => `HARD PROGRAM ${i + 1}`),
  'HARD PROGRAM 1', // the real catalogue repeats a title; @for must tolerate it
];

describe('Programs', () => {
  function build() {
    TestBed.configureTestingModule({
      providers: [{
        provide: ContentService,
        useValue: {
          programs: { tracks: [{ name: 'Soft', programs: SOFT }, { name: 'Hard', programs: HARD }] },
          site: { collapsedPrograms: 15 },
          sections: {
            programs: {
              eyebrow: 'e', heading: 'h', searchLabel: 's',
              searchPlaceholder: 'p', emptyNote: 'nothing found',
            },
          },
        },
      }],
    });
    const fixture = TestBed.createComponent(Programs);
    return fixture.componentInstance as unknown as {
      track: { set(v: number): void };
      query: { set(v: string): void };
      shown: () => Set<number>;
      countLabel: () => string;
      emptyNote: () => string;
      showToggle: () => boolean;
      toggleLabel: () => string;
      toggle(): void;
    };
  }

  it('collapses to the configured limit before any interaction', () => {
    const c = build();
    expect(c.shown().size).toBe(15);
    expect(c.countLabel()).toBe('15 of 51 programs');
    expect(c.toggleLabel()).toBe('Show all 51 programs');
  });

  it('expands to the full list and offers to collapse again', () => {
    const c = build();
    c.toggle();
    expect(c.shown().size).toBe(51);
    expect(c.countLabel()).toBe('51 of 51 programs');
    expect(c.toggleLabel()).toBe('Show fewer');
  });

  it('filters on a search term, ignoring the collapse limit', () => {
    const c = build();
    c.query.set('program 5');
    // "SOFT PROGRAM 5" plus 50-59 => 5, 50, 51 within 51 entries
    expect(c.shown().size).toBe(3);
    expect(c.emptyNote()).toBe('');
  });

  it('reports the empty note when nothing matches', () => {
    const c = build();
    c.query.set('zzzz');
    expect(c.shown().size).toBe(0);
    expect(c.emptyNote()).toBe('nothing found');
  });

  it('is case insensitive', () => {
    const c = build();
    c.query.set('sOfT pRoGrAm 1');
    expect(c.shown().size).toBeGreaterThan(0);
  });

  // Regression: expanding one track then switching used to carry "show all"
  // across, so the other track opened fully expanded.
  it('re-collapses when the track changes', () => {
    const c = build();
    c.toggle();
    expect(c.shown().size).toBe(51);

    c.track.set(1);
    expect(c.shown().size).toBe(15);
    expect(c.countLabel()).toBe('15 of 18 programs');

    c.track.set(0);
    expect(c.countLabel()).toBe('15 of 51 programs');
  });

  it('hides the toggle when a track is shorter than the limit', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{
        provide: ContentService,
        useValue: {
          programs: { tracks: [{ name: 'Tiny', programs: ['ONE', 'TWO'] }] },
          site: { collapsedPrograms: 15 },
          sections: { programs: { eyebrow: '', heading: '', searchLabel: '', searchPlaceholder: '', emptyNote: '' } },
        },
      }],
    });
    const c = TestBed.createComponent(Programs).componentInstance as unknown as {
      showToggle: () => boolean; shown: () => Set<number>;
    };
    expect(c.shown().size).toBe(2);
    expect(c.showToggle()).toBe(false);
  });
});
