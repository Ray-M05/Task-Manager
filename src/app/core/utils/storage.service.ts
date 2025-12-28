import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly memory = new Map<string, string>();

  get(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(key);
    return this.memory.get(key) ?? null;
  }

  set(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(key, value);
    else this.memory.set(key, value);
  }

  remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(key);
    else this.memory.delete(key);
  }
}
