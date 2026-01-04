import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog.component';

import { TasksService } from '../../services/tasks.service';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { UsersService } from '../../../users/services/users.service';

type TaskFilter = {
  name: string;
  status: TaskStatus | 'all';
  userId: number | 'all'; 
};

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatPaginatorModule,
    MatSortModule,

    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly isAdmin = signal(false);

  displayedColumns = ['title', 'status', 'userId', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);

  usersById = new Map<number, User>();
  private usersList: User[] = [];

  statuses: Array<{ value: TaskFilter['status']; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'done', label: 'Completada' },
  ];

  filterForm = this.fb.nonNullable.group({
    name: [''],
    status: ['all' as TaskFilter['status']],
    userId: ['all' as TaskFilter['userId']], 
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly tasksService: TasksService,
    private readonly dialog: MatDialog,
    private readonly auth: AuthService,
    private readonly usersService: UsersService
  ) {
    this.dataSource.filterPredicate = (task: Task, raw: string) => {
      const f = JSON.parse(raw) as TaskFilter;

      const nameOk = !f.name || task.title.toLowerCase().includes(f.name.toLowerCase());

      const statusOk = f.status === 'all' ? true : task.status === f.status;

      const userOk = !this.isAdmin() || f.userId === 'all' ? true : task.userId === f.userId;

      return nameOk && statusOk && userOk;
    };

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyFilter();
        this.dataSource.paginator?.firstPage();
      });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.auth.hasRole('admin'));
    this.applyFilter();
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private applyFilter(): void {
    const raw = this.filterForm.getRawValue();
    const filter: TaskFilter = {
      name: raw.name ?? '',
      status: (raw.status ?? 'all') as TaskFilter['status'],
      userId: (raw.userId ?? 'all') as TaskFilter['userId'],
    };
    this.dataSource.filter = JSON.stringify(filter);
  }

  userLabel(userId: number): string {
    const u = this.usersById.get(userId);
    if (!u) return `#${userId}`;
    return u.name?.trim() ? u.name : u.email;
  }

  reload(): void {
    const me = this.auth.getCurrentUser();
    const meId = me?.id;

    const tasks$ = this.isAdmin() || !meId
      ? this.tasksService.getTasks()
      : this.tasksService.getTasks({ userId: meId });

    const users$ = this.isAdmin() ? this.usersService.getUsers() : of(me ? [me] : []);

    forkJoin({ tasks: tasks$, users: users$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tasks, users }) => {
          this.dataSource.data = tasks;

          this.usersList = users;
          this.usersById.clear();
          users.forEach((u) => this.usersById.set(u.id, u));

          this.applyFilter();
        },
        error: () => {
          this.dataSource.data = [];
          this.usersList = [];
          this.usersById.clear();
        },
      });
  }

  private usersForDialog(): Array<{ id: number; name: string; email: string }> {
    return this.usersList.map((u) => ({
      id: u.id,
      name: u.name ?? '',
      email: u.email,
    }));
  }

  openCreate(): void {
    const canAssign = this.isAdmin();
    const defaultUserId = this.auth.getCurrentUser()?.id ?? 0;

    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      data: {
        mode: 'create',
        canAssign,
        defaultUserId,
        users: canAssign ? this.usersForDialog() : undefined,
      },
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;
      this.tasksService.createTask(value).subscribe(() => this.reload());
    });
  }

  openEdit(task: Task): void {
    const canAssign = this.isAdmin();

    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      data: {
        mode: 'edit',
        task,
        canAssign,
        defaultUserId: task.userId,
        users: canAssign ? this.usersForDialog() : undefined,
      },
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;
      this.tasksService.updateTask(task.id, value).subscribe(() => this.reload());
    });
  }

  delete(task: Task): void {
    const ok = confirm(`Eliminar tarea "${task.title}"?`);
    if (!ok) return;

    this.tasksService.deleteTask(task.id).subscribe(() => this.reload());
  }

  changeStatus(task: Task, status: TaskStatus): void {
    this.tasksService.updateTask(task.id, { status }).subscribe(() => this.reload());
  }

  get adminUsers(): User[] {
    return this.usersList;
  }
}
