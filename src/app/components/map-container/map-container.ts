import { Component, signal, viewChild, AfterViewInit, inject } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { GetData } from '../../services';
import { Marker } from '../../services';
import { DailyReport, GPSPoint, MarkerType } from '../../models/daily-report';

@Component({
  selector: 'app-map-container',
  imports: [GoogleMap],
  templateUrl: './map-container.html',
  styleUrl: './map-container.css',
})
export class MapContainer implements AfterViewInit {
  private getData = inject(GetData);
  private marker = inject(Marker);

  readonly mapComponent = viewChild(GoogleMap);

  protected readonly zoom = signal(12);

  protected readonly mapOptions = signal<google.maps.MapOptions>({
    mapId: 'TRIP_TRACKER_MAP',
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  });

  private allDrivingPoints: GPSPoint[] = [];
  private currentMap!: google.maps.Map;

  ngAfterViewInit(): void {
    const mapComp = this.mapComponent();
    if (mapComp) {
      this.renderTrip(mapComp);
    }
  }

  private renderTrip(mapComp: GoogleMap): void {
    this.getData.loadDailyReport().subscribe((data: DailyReport[]) => {
      const map = mapComp.googleMap!;

      this.currentMap = map;
      const bounds = new google.maps.LatLngBounds();

      this.allDrivingPoints = this.getData.getAllDrivingPoints(data);

      const stops = this.getData.getAllStops(data);
      stops.forEach((stop) => {
        const stopMarker = this.marker.createStopMarker(stop);
        this.marker.addMarker(
          stopMarker,
          MarkerType.STOP,
          `stop-${stop.point.latitude}-${stop.point.longitude}`,
          map,
        );
        bounds.extend({ lat: stop.point.latitude, lng: stop.point.longitude });
      });

      const startPoint = data[0].points[0];
      if (startPoint) {
        const startMarker = this.marker.createStartMarker(startPoint);
        this.marker.addMarker(startMarker, MarkerType.START, 'start-marker', map);
        bounds.extend({ lat: startPoint.latitude, lng: startPoint.longitude });
      }

      const endPoint = data[data.length - 1].points[0];
      if (endPoint) {
        const endMarker = this.marker.createEndMarker(endPoint);
        this.marker.addMarker(endMarker, MarkerType.END, 'end-marker', map);
        bounds.extend({ lat: endPoint.latitude, lng: endPoint.longitude });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    });
  }

  protected onMapIdle(): void {
    const newZoom = this.currentMap.getZoom() ?? 12;
    this.zoom.set(newZoom);
    this.updateMovementMarkers(newZoom);
  }

  private updateMovementMarkers(zoom: number): void {
    const bounds = this.currentMap.getBounds()!;

    const pointsFilteredByZoom = this.marker.filterMovementPoints(this.allDrivingPoints, zoom);

    const requiredPoints = pointsFilteredByZoom.filter((point) =>
      bounds.contains({ lat: point.latitude, lng: point.longitude }),
    );

    const requiredIds = new Set(requiredPoints.map((p) => `movement-${p.id}`));

    const currentMarkers = this.marker.getMarkersByType(MarkerType.MOVEMENT);

    const existingMarkerIds = new Set(currentMarkers.map((m) => m.id));

    const markersToDelete: string[] = [];
    currentMarkers.forEach((tracked) => {
      if (!requiredIds.has(tracked.id)) {
        markersToDelete.push(tracked.id);
      }
    });

    markersToDelete.forEach((id) => {
      this.marker.removeMarker(id);
    });

    const pointsToRender = requiredPoints.filter((p) => !existingMarkerIds.has(`movement-${p.id}`));

    pointsToRender.forEach((point) => {
      const newMarker = this.marker.createMovementMarker(point);
      this.marker.addMarker(
        newMarker,
        MarkerType.MOVEMENT,
        `movement-${point.id}`,
        this.currentMap!,
      );
    });
  }
}
