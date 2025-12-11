import { Component } from '@angular/core';
import { MapContainer } from './components/map-container/map-container';

@Component({
  selector: 'app-root',
  imports: [MapContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
