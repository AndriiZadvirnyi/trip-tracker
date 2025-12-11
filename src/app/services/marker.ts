import { Injectable } from '@angular/core';
import { GPSPoint, MarkerType } from '../models/daily-report';

type MapMarker = google.maps.marker.AdvancedMarkerElement;

interface TrackedMarker {
  marker: MapMarker;
  type: 'START' | 'END' | 'STOP' | 'MOVEMENT';
  id: string;
}

interface ZoomLevelConfig {
  minZoom: number;
  maxZoom: number;
  movementSamplingRate: number;
  maxMovementMarkers: number;
}

const MARKER_ZOOM_CONFIG: ZoomLevelConfig[] = [
  { minZoom: 1, maxZoom: 10, movementSamplingRate: 0, maxMovementMarkers: 0 },
  { minZoom: 11, maxZoom: 13, movementSamplingRate: 5, maxMovementMarkers: 300 },
  { minZoom: 14, maxZoom: 16, movementSamplingRate: 2, maxMovementMarkers: 1000 },
  { minZoom: 17, maxZoom: 18, movementSamplingRate: 1, maxMovementMarkers: Infinity },
  { minZoom: 19, maxZoom: 25, movementSamplingRate: 1, maxMovementMarkers: Infinity },
];

@Injectable({
  providedIn: 'root',
})
export class Marker {
  private markers: TrackedMarker[] = [];

  createStartMarker(point: GPSPoint): google.maps.marker.AdvancedMarkerElement {
    const pin = new google.maps.marker.PinElement({
      background: '#0F9D58',
      borderColor: '#0b8043',
      glyphColor: 'white',
      scale: 1.1,
    });

    return new google.maps.marker.AdvancedMarkerElement({
      position: { lat: point.latitude, lng: point.longitude },
      title: 'Route Start',
      content: pin.element,
      zIndex: 100,
    });
  }

  createEndMarker(point: GPSPoint): google.maps.marker.AdvancedMarkerElement {
    const pin = new google.maps.marker.PinElement({
      background: '#DB4437',
      borderColor: '#c53929',
      glyphColor: 'white',
      scale: 1.1,
    });

    return new google.maps.marker.AdvancedMarkerElement({
      position: { lat: point.latitude, lng: point.longitude },
      title: 'Route End',
      content: pin.element,
      zIndex: 100,
    });
  }

  createStopMarker(stop: {
    point: GPSPoint;
    duration: number;
  }): google.maps.marker.AdvancedMarkerElement {
    const durationMinutes = Math.round(stop.duration / 60000);
    const pin = new google.maps.marker.PinElement({
      background: '#4340f1ff',
      borderColor: '#4340f1ff',
      glyphColor: 'white',
      glyph: 'P',
      scale: 0.9,
    });

    return new google.maps.marker.AdvancedMarkerElement({
      position: { lat: stop.point.latitude, lng: stop.point.longitude },
      title: `Stop: ${durationMinutes} min`,
      content: pin.element,
      zIndex: 50,
    });
  }

  createMovementMarker(point: GPSPoint): google.maps.marker.AdvancedMarkerElement {
    const container = document.createElement('div');
    container.style.transform = 'translateY(50%)';

    container.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 20 20" style="transform: rotate(${point.direction}deg); display: block;">
            <path d="M10 0 L20 20 L10 15 L0 20 Z" fill="#4285F4" stroke="white" stroke-width="2"/>
          </svg>
        `;

    return new google.maps.marker.AdvancedMarkerElement({
      position: { lat: point.latitude, lng: point.longitude },
      content: container,
      title: `Speed: ${point.speed} km/h`,
      zIndex: 10,
    });
  }

  addMarker(marker: MapMarker, type: MarkerType, id: string, map: google.maps.Map): void {
    marker.map = map;

    this.markers.push({
      marker,
      type,
      id,
    });
  }

  removeMarker(id: string): void {
    const index = this.markers.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.markers[index].marker.map = null;
      this.markers.splice(index, 1);
    }
  }

  getMarkersByType(type: MarkerType): TrackedMarker[] {
    return this.markers.filter((m) => m.type === type);
  }

  filterMovementPoints(points: GPSPoint[], zoom: number): GPSPoint[] {
    const config = this.getZoomConfig(zoom);
    const rate = config.movementSamplingRate;

    if (rate === 0) {
      return [];
    }

    if (rate === 1) {
      return points.slice(0, config.maxMovementMarkers);
    }

    const sampledPoints = points.filter((_, index) => index % rate === 0);

    return sampledPoints.slice(0, config.maxMovementMarkers);
  }

  private getZoomConfig(zoom: number): ZoomLevelConfig {
    const config = MARKER_ZOOM_CONFIG.find((c) => zoom >= c.minZoom && zoom <= c.maxZoom);

    return config || MARKER_ZOOM_CONFIG[0];
  }
}
