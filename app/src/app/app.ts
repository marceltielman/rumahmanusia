import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from './ui/reveal.directive';
import { Loader } from './chrome/loader';
import { Whatsapp } from './chrome/whatsapp';
import { Progress } from './chrome/progress';
import { Header } from './sections/header';
import { Hero } from './sections/hero';
import { Clients } from './sections/clients';
import { Vision } from './sections/vision';
import { What } from './sections/what';
import { Strategies } from './sections/strategies';
import { Formats } from './sections/formats';
import { Programs } from './sections/programs';
import { Schedule } from './sections/schedule';
import { Online } from './sections/online';
import { Advantages } from './sections/advantages';
import { Testimony } from './sections/testimony';
import { Team } from './sections/team';
import { Cta } from './sections/cta';
import { Contact } from './sections/contact';
import { Footer } from './sections/footer';

@Component({
  selector: 'rm-root',
  imports: [
    Reveal, Loader, Whatsapp, Progress,
    Header, Hero, Clients, Vision, What, Strategies, Formats, Programs,
    Schedule, Online, Advantages, Testimony, Team, Cta, Contact, Footer,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div rmLoader></div>
    <div rmWhatsapp></div>
    <div rmProgress></div>

    <header rmHeader></header>

    <section rmHero></section>
    <section rmClients rmReveal></section>
    <section rmVision rmReveal></section>
    <section rmWhat rmReveal></section>
    <section rmStrategies rmReveal></section>
    <section rmFormats rmReveal></section>
    <section rmPrograms rmReveal></section>
    <section rmSchedule rmReveal></section>
    <section rmOnline rmReveal></section>
    <section rmAdvantages rmReveal></section>
    <section rmTestimony rmReveal></section>
    <section rmTeam rmReveal></section>
    <section rmCta rmReveal></section>
    <section rmContact rmReveal></section>

    <footer rmFooter></footer>
  `,
})
export class App {}
