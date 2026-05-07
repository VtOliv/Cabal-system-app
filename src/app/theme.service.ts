import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode = signal(false);

  constructor() {
    this.initializeTheme();
    
    // Efeito para aplicar tema sempre que o signal muda
    effect(() => {
      this.applyTheme(this.darkMode());
    });
  }

  private initializeTheme(): void {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved === 'true';
    this.darkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleDarkMode(): void {
    const newValue = !this.darkMode();
    this.darkMode.set(newValue);
    localStorage.setItem('darkMode', String(newValue));
    console.log('Dark mode toggled:', newValue);
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
      console.log('Dark class added');
    } else {
      htmlElement.classList.remove('dark');
      console.log('Dark class removed');
    }
  }
}

