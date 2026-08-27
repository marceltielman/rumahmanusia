import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ContentService } from '../content/content.service';

const COLUMNS = 9;   // the face grid resolves to nine columns at full width
const STEP_MS = 280;
const BASE_DELAY_MS = 450;

@Component({
  selector: 'section[rmTeam]',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'id': 'team' },
  template: `
    <div class="rm-wrap">
      <p class="rm-eyebrow rm-kick">{{ copy.eyebrow }}</p>
      <h2 class="rm-h2">{{ copy.heading }}</h2>
      <div style="display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start;margin-top:40px">
        <div style="flex:0 1 240px;min-width:200px">
          <div class="rm-founder">
            @if (team.founder.photo) {
              <!-- Responsive units only: NgOptimizedImage rejects pixel values in
                   sizes (NG02952). The frame is capped at 260px, so the
                   wide-viewport value is deliberately small. -->
              <img [ngSrc]="team.founder.photo" [alt]="team.founder.name"
                   width="260" height="260" sizes="(max-width: 700px) 60vw, 18vw">
            }
          </div>
          <h4 style="margin:18px 0 4px;font-weight:500">{{ team.founder.name }}</h4>
          <div class="rm-metalabel">{{ team.founder.role }}</div>
        </div>

        <div style="flex:1 1 640px;min-width:0">
          <div class="rm-facegrid">
            @for (face of faces(); track $index) {
              <div class="rm-face" [style.animation-delay.ms]="face.delay">
                @if (face.photo) {
                  <img [ngSrc]="face.photo" [alt]="face.name"
                       width="144" height="144" sizes="(max-width: 1040px) 20vw, 8vw">
                }
              </div>
            }
          </div>
          <p class="text-muted" style="margin-top:20px;font-size:14px">{{ team.note }}</p>
        </div>
      </div>
    </div>
  `,
})
export class Team {
  private readonly content = inject(ContentService);
  protected readonly copy = this.content.sections.team;
  protected readonly team = this.content.team;

  /* Diagonal scan reveal: the delay grows with column plus row, so the wipe
   * travels across the grid rather than along each line. */
  protected readonly faces = computed(() =>
    this.team.members.map((member, i) => ({
      photo: member.photo,
      name: member.name ?? 'Trainer',
      delay: BASE_DELAY_MS + ((i % COLUMNS) + Math.floor(i / COLUMNS)) * STEP_MS,
    }))
  );
}
