import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MapsLoader } from './services';

export const GOOGLE_MAPS_API_KEY = environment.googleMapsApiKey;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAppInitializer(() => {
      const loader = inject(MapsLoader);
      return loader.load();
    }),
  ],
};
