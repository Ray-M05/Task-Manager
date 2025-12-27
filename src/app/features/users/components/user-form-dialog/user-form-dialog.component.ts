import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { User, UserRole } from '../../../../core/models/user.model';

export type UserFormDialogData = {
  mode: 'create' | 'edit';
  user?: User;
  canEditRole?: boolean; 
};

export type UserFormValueCreate = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UserFormValueEdit = {
  name: string;
  email: string;
  role: UserRole;
};

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent {
  roles: Array<{ value: UserRole; label: string }> = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  form!: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    role: FormControl<UserRole>;
    password: FormControl<string>;
  }>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData
  ) {
    this.form = this.fb.nonNullable.group({
      name: [this.data.user?.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
      role: [(this.data.user?.role ?? 'user') as UserRole, [Validators.required]],

      password: ['', this.data.mode === 'create'
        ? [Validators.required, Validators.minLength(6)]
        : []],
    });

    if (this.data.mode === 'edit') {
      this.form.controls.password.disable();
    }

    if (this.data.mode === 'edit' && this.data.canEditRole === false) {
      this.form.controls.role.disable(); 
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.data.mode === 'edit') {
      const value: any = {
        name: raw.name,
        email: raw.email,
      };

      if (this.data.canEditRole !== false) {
        value.role = raw.role;
      }

      this.dialogRef.close(value);
      return;
    }

    if (this.data.mode === 'create') {
      const value: UserFormValueCreate = {
        name: raw.name,
        email: raw.email,
        role: raw.role,
        password: raw.password,
      };
      this.dialogRef.close(value);
      return;
    }

    const value: UserFormValueEdit = {
      name: raw.name,
      email: raw.email,
      role: raw.role,
    };
    this.dialogRef.close(value);
  }
}
