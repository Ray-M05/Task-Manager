import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/http/api.config';
import { Task } from '../../../core/models/task.model';

export type CreateTaskDto = Omit<Task, 'id'>;
export type UpdateTaskDto = Partial<Omit<Task, 'id'>>;

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}

  getTasks(filter?: { userId?: number }): Observable<Task[]> {
    let params = new HttpParams();
    if (filter?.userId) params = params.set('userId', String(filter.userId));

    return this.http.get<Task[]>(`${API_BASE_URL}/tasks`, { params });
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${API_BASE_URL}/tasks`, { ...dto, status: 'pending' });
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${API_BASE_URL}/tasks/${id}`, dto);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/tasks/${id}`);
  }
}
