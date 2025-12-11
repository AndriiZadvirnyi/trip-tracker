import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyReport, GPSPoint } from '../models/daily-report';

@Injectable({
  providedIn: 'root',
})
export class GetData {
  private readonly dataUrl = '/data/daily-report-data.json';

  private http = inject(HttpClient);

  loadDailyReport(): Observable<DailyReport[]> {
    return this.http.get<DailyReport[]>(this.dataUrl);
  }

  getAllStops(data: DailyReport[]): { point: GPSPoint; duration: number }[] {
    if (!data || data.length === 0) {
      return [];
    }

    return data
      .filter((bar) => !bar.isDrivingBar && bar.points && bar.points.length === 1)
      .map((bar) => {
        const startMs = +new Date(bar.eventStart);
        const endMs = +new Date(bar.eventStop);

        const duration = endMs - startMs;

        return {
          point: bar.points![0],
          duration: duration,
        };
      });
  }

  getAllDrivingPoints(data: DailyReport[]): GPSPoint[] {
    return data.flatMap((bar) => (bar.isDrivingBar && bar.points ? bar.points : []));
  }
}
