import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { API_BASE_URL } from '../http/api.config';
import { AuthResponse } from '../models/auth.model';
import { User, UserRole } from '../models/user.model';
import { StorageService } from '../utils/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject: BehaviorSubject<User | null>;
  readonly currentUser$: Observable<User | null>;

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly storage: StorageService
  ) {
    this.userSubject = new BehaviorSubject<User | null>(this.loadUser());
    this.currentUser$ = this.userSubject.asObservable();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/login`, { email, password }).pipe(
      tap((res) => {
        this.storage.set(this.TOKEN_KEY, res.accessToken);
        this.storage.set(this.USER_KEY, JSON.stringify(res.user));

        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.USER_KEY);

    this.userSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.storage.get(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    return this.userSubject.value?.role === role;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  private loadUser(): User | null {
    const raw = this.storage.get(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.storage.remove(this.USER_KEY);
      return null;
    }
  }
}
