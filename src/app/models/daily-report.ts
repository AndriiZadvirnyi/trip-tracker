export interface GPSPoint {
  id: number;
  eventDateTime: string;
  longitude: number;
  latitude: number;
  odometer: number;
  direction: number;
  speed: number;
}

export interface DailyReport {
  isDrivingBar: boolean;
  eventStart: string;
  eventStop: string;
  distance: number;
  place: string | null;
  points: GPSPoint[];
}

export enum MarkerType {
  START = 'START',
  END = 'END',
  STOP = 'STOP',
  MOVEMENT = 'MOVEMENT',
}
