import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/http/api.config';
import { User } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE_URL}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/${id}`);
  }
}
