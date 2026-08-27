import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });

  it('adopts the theme the pre-paint script already applied', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('defaults to light when nothing has been applied', () => {
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });

  it('toggles the attribute, the label and the icon together', () => {
    const service = TestBed.inject(ThemeService);
    const lightIcon = service.iconPath();

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(service.label()).toBe('Switch to light mode');
    expect(service.iconPath()).not.toBe(lightIcon);

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(service.iconPath()).toBe(lightIcon);
  });

  it('persists the choice so a reload keeps it', () => {
    TestBed.inject(ThemeService).toggle();
    expect(localStorage.getItem('rm-theme')).toBe('dark');
  });
});
