

import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CharacterSelector } from './components/character-selector/character-selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CharacterSelector],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'calculator-app';
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
