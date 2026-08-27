import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideSanityImageLoader } from './ui/sanity-image-loader';
import { provideSeo } from './seo/seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withIncrementalHydration()),
    provideSanityImageLoader(),
    provideSeo(),
  ],
};
