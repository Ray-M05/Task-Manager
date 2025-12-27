import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/http/api.config';
import { User, UserRole } from '../../../core/models/user.model';
import { AuthResponse } from '../../../core/models/auth.model';

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserDto = Partial<{
  name: string;
  email: string;
  role: UserRole;
}>;

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE_URL}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/${id}`);
  }

  createUser(dto: CreateUserDto): Observable<User> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/register`, dto)
      .pipe(map((res) => res.user));
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${API_BASE_URL}/users/${id}`, dto);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${id}`);
  }
}
