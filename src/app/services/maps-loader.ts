import { Injectable } from '@angular/core';
import { GOOGLE_MAPS_API_KEY } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class MapsLoader {
  private loader$: Promise<void> | null = null;
  private apiKey = GOOGLE_MAPS_API_KEY;

  load(): Promise<void> {
    if (this.loader$) {
      return this.loader$;
    }

    this.loader$ = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=marker`;
      script.async = true;

      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.loader$;
  }
}
