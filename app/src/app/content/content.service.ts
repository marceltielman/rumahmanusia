import { Injectable } from '@angular/core';
import data from '../../content/content.json';
import type { Content } from './content.types';

/**
 * Content is fetched from Sanity by tools/fetch-content.mjs before the build,
 * so it is a compile-time constant here. Exposed through a service rather than
 * a bare import so components can be tested against a stub.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly all = data as unknown as Content;

  readonly site = this.all.site;
  readonly hero = this.all.hero;
  readonly sections = this.all.sections;
  readonly services = this.all.services;
  readonly strategies = this.all.strategies;
  readonly audiences = this.all.audiences;
  readonly advantages = this.all.advantages;
  readonly online = this.all.online;
  readonly programs = this.all.programs;
  readonly schedule = this.all.schedule;
  readonly testimonials = this.all.testimonials;
  readonly clients = this.all.clients;
  readonly team = this.all.team;
}
