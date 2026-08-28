import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { ContentService } from '../content/content.service';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ENDPOINT = '/api/enquiry';

type State = 'idle' | 'sending' | 'sent' | 'failed';

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

        <!-- Real action and method, so a submit without JavaScript is a normal
             POST that the Function answers with a readable page. -->
        <form [formGroup]="form" method="post" [action]="endpoint" (ngSubmit)="submit($event)">
          @for (field of copy.fields; track field.name) {
            <div class="field" style="margin-bottom:16px">
              <label [for]="'rm-' + field.name">{{ field.label }}</label>
              <input class="input" [id]="'rm-' + field.name" [formControlName]="field.name"
                     [name]="field.name" [type]="field.type"
                     [attr.placeholder]="field.placeholder ?? null"
                     [attr.required]="field.required ? '' : null"
                     [attr.aria-invalid]="state() === 'failed' ? 'true' : null">
            </div>
          }

          <!-- Spam signals. The honeypot is hidden from people and from
               assistive technology; a bot fills every field it finds. -->
          <div hidden aria-hidden="true">
            <label for="rm-company-website">Company website</label>
            <input id="rm-company-website" name="company_website" type="text"
                   tabindex="-1" autocomplete="off">
          </div>
          <input type="hidden" name="rendered_at" [value]="renderedAt">

          <button type="submit" class="btn btn-primary btn-block" [disabled]="state() === 'sending'">
            {{ buttonLabel() }}
          </button>

          <p role="status" aria-live="polite"
             style="margin-top:14px;font-size:13px;min-height:20px"
             [style.color]="state() === 'failed' ? 'var(--color-accent-700)' : 'var(--color-accent-700)'">{{ note() }}</p>

          @if (state() === 'failed') {
            <p style="margin:0;font-size:13px">
              <a [href]="mailtoFallback()">Send it by email instead</a>
            </p>
          }
        </form>
      </div>
    </div>
  `,
})
export class Contact {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.contact;
  protected readonly site = this.content.site;
  protected readonly endpoint = ENDPOINT;

  protected readonly state = signal<State>('idle');
  protected readonly note = signal('');

  /* Stamped when the component renders. The Function rejects submissions that
     arrive implausibly fast. Zero during prerender, which the Function treats
     as "no signal" rather than as suspicious. */
  protected readonly renderedAt = typeof window === 'undefined' ? 0 : Date.now();

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    org: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL)],
    }),
    topic: new FormControl('', { nonNullable: true }),
  });

  protected readonly buttonLabel = computed(() =>
    this.state() === 'sending' ? 'Sending…' : this.site.cta
  );

  constructor() {
    this.form.valueChanges.subscribe(() => {
      if (this.state() !== 'sending') {
        this.state.set('idle');
        this.note.set('');
      }
    });
  }

  /** Last resort when the endpoint itself is unreachable. */
  protected readonly mailtoFallback = computed(() => {
    const { name, org, email, topic } = this.form.getRawValue();
    const subject = 'Program request' + (topic.trim() ? `: ${topic.trim()}` : '');
    const body = [
      `Name: ${name.trim()}`,
      `Organization: ${org.trim() || '—'}`,
      `Email: ${email.trim()}`,
      `Program of interest: ${topic.trim() || '—'}`,
    ].join('\n');
    return `mailto:${this.site.email}?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;
  });

  protected async submit(event: Event) {
    event.preventDefault();
    if (this.state() === 'sending') return;

    const { name, org, email, topic } = this.form.getRawValue();

    if (!name.trim() || !email.trim()) {
      this.state.set('failed');
      this.note.set('Please add your name and email.');
      return;
    }
    if (!EMAIL.test(email.trim())) {
      this.state.set('failed');
      this.note.set('That email address looks incomplete.');
      return;
    }

    this.state.set('sending');
    this.note.set('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          org: org.trim(),
          email: email.trim(),
          topic: topic.trim(),
          rendered_at: this.renderedAt,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (response.ok && result?.ok) {
        this.state.set('sent');
        this.note.set(result.message ?? 'Thank you — your request has been sent.');
        this.form.reset();
        return;
      }

      this.state.set('failed');
      this.note.set(result?.message ?? 'We could not send that just now.');
    } catch {
      // Offline, blocked, or the endpoint is not deployed yet.
      this.state.set('failed');
      this.note.set('We could not reach the server.');
    }
  }
}
