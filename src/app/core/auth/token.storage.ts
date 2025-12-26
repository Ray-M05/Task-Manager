import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('accessToken');
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem('accessToken', token);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  getUserRaw(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('currentUser');
  }

  setUserRaw(value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem('currentUser', value);
  }
}
