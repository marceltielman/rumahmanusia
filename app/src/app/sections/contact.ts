import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { ContentService } from '../content/content.service';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

@Component({
  selector: 'section[rmContact]',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'contact' },
  template: `
    <div class="rm-wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(32px,4vw,56px);align-items:start">
      <div>
        <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
        <h2 class="rm-h2" style="font-size:34px">{{ copy.heading }}</h2>
        <div style="border-top:1px solid var(--color-divider);margin-top:28px">
          @for (row of site.contacts; track row.label) {
            <div class="rm-contactrow"><span>{{ row.label }}</span><span>{{ row.value }}</span></div>
          }
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:28px;margin-top:32px">
          @for (office of site.offices; track office.city) {
            <div>
              <p class="rm-eyebrow" style="margin-bottom:8px">{{ office.city }}</p>
              <p style="margin:0;font-size:15px">
                @for (line of office.address; track $index) {{{ line }}<br>}
              </p>
            </div>
          }
        </div>
      </div>

      <div style="background:var(--color-surface);border-radius:24px;padding:clamp(24px,3vw,36px)">
        <h4 style="margin:0 0 20px;font-weight:500">{{ copy.formTitle }}</h4>
        <form [formGroup]="form" (ngSubmit)="submit()">
          @for (field of copy.fields; track field.name) {
            <div class="field" style="margin-bottom:16px">
              <label [for]="'rm-' + field.name">{{ field.label }}</label>
              <input class="input" [id]="'rm-' + field.name" [formControlName]="field.name"
                     [type]="field.type" [attr.placeholder]="field.placeholder ?? null"
                     [attr.required]="field.required ? '' : null">
            </div>
          }
          <button type="submit" class="btn btn-primary btn-block">{{ site.cta }}</button>
          <p role="status" style="margin-top:14px;font-size:13px;color:var(--color-accent-700);min-height:20px">{{ note() }}</p>
        </form>
      </div>
    </div>
  `,
})
export class Contact {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.contact;
  protected readonly site = this.content.site;
  protected readonly note = signal('');

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    org: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL)],
    }),
    topic: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.note.set(''));
  }

  /**
   * Hands off to the visitor's mail client. Fragile — on mobile and webmail it
   * often goes nowhere — and the reason a server-side handler is on the list.
   */
  protected submit() {
    const { name, org, email, topic } = this.form.getRawValue();

    if (!name.trim() || !email.trim()) {
      this.note.set('Please add your name and email.');
      return;
    }
    if (!EMAIL.test(email.trim())) {
      this.note.set('That email address looks incomplete.');
      return;
    }

    const to = this.site.email;
    const subject = 'Program request' + (topic.trim() ? `: ${topic.trim()}` : '');
    const body = [
      `Name: ${name.trim()}`,
      `Organization: ${org.trim() || '—'}`,
      `Email: ${email.trim()}`,
      `Program of interest: ${topic.trim() || '—'}`,
      '',
      `Sent from ${location.host}`,
    ].join('\n');

    location.href =
      `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.note.set(
      `Opening your email app with the request to ${to} — press send there.`
    );
  }
}
