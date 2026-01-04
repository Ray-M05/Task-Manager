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

import { UsersService, CreateUserDto, UpdateUserDto } from '../../services/users.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { UserFormDialogComponent } from '../../components/user-form-dialog/user-form-dialog.component';
import { AuthService } from '../../../../core/auth/auth.service';

import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { TasksService } from '../../../tasks/services/tasks.service';


type UserFilter = {
  name: string;
  role: UserRole | 'all';
};

@Component({
  selector: 'app-users-page',
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
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly meId = signal<number | null>(null);

  displayedColumns = ['name', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  roleOptions: Array<{ value: UserFilter['role']; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  filterForm = this.fb.nonNullable.group({
    name: [''],
    role: ['all' as UserFilter['role']],
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly auth: AuthService,
    private readonly tasksService: TasksService
  ) {
    this.dataSource.filterPredicate = (user: User, raw: string) => {
      const f = JSON.parse(raw) as UserFilter;

      const q = f.name.toLowerCase();

      const nameOk = !f.name || (user.name ?? '').toLowerCase().includes(q)
      || user.email.toLowerCase().includes(q);

      const roleOk = f.role === 'all' ? true : user.role === f.role;

      return nameOk && roleOk;
    };

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyFilter();
        this.dataSource.paginator?.firstPage();
      });
  }

  ngOnInit(): void {
    this.meId.set(this.auth.getCurrentUser()?.id ?? null);
    this.applyFilter();
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private applyFilter(): void {
    const raw = this.filterForm.getRawValue();
    const filter: UserFilter = {
      name: raw.name ?? '',
      role: (raw.role ?? 'all') as UserFilter['role'],
    };
    this.dataSource.filter = JSON.stringify(filter);
  }

  reload(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.dataSource.data = users;
          this.applyFilter();
        },
        error: () => (this.dataSource.data = []),
      });
  }

  openCreate(): void {
    const ref = this.dialog.open(UserFormDialogComponent, {
      width: '520px',
      data: { mode: 'create' },
    });

    ref.afterClosed().subscribe((value: CreateUserDto | null) => {
      if (!value) return;
      this.usersService.createUser(value).subscribe(() => this.reload());
    });
  }

  openEdit(user: User): void {
    const canEditRole = user.id !== this.meId();
    const ref = this.dialog.open(UserFormDialogComponent, {
      width: '520px',
      data: { mode: 'edit', user, canEditRole },
    });

    ref.afterClosed().subscribe((value: UpdateUserDto | null) => {
      if (!value) return;

      if (user.id === this.meId()) {
        const { role, ...safe } = value as any;
        this.usersService.updateUser(user.id, safe).subscribe(() => this.reload());
        return;
      }

      this.usersService.updateUser(user.id, value).subscribe(() => this.reload());
    });
  }

  delete(user: User): void {
    if (user.id === this.meId()) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }

    const ok = confirm(`Eliminar usuario "${user.name ?? user.email}" y sus tareas?`);
    if (!ok) return;

    this.tasksService
      .getTasks({ userId: user.id })
      .pipe(
        switchMap((tasks) => {
          if (!tasks.length) return of([]);

          return forkJoin(
            tasks.map((t) =>
              this.tasksService.deleteTask(t.id).pipe(catchError(() => of(void 0)))
            )
          );
        }),
        switchMap(() => this.usersService.deleteUser(user.id)),
        finalize(() => this.reload())
      )
      .subscribe({
        next: () => {},
        error: () => alert('No se pudo eliminar el usuario.'),
      });
  }
}
