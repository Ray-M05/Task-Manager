import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { TasksPageComponent } from './features/tasks/pages/tasks-page/tasks-page.component';
import { UsersPageComponent } from './features/users/pages/users-page/users-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'tasks', component: TasksPageComponent },
      { path: 'users', component: UsersPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'tasks' },
    ],
  },

  { path: '**', redirectTo: 'tasks' },
];
