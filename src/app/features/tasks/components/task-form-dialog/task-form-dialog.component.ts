import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Task, TaskStatus } from '../../../../core/models/task.model';

export type TaskFormDialogData = {
  mode: 'create' | 'edit';
  task?: Task;
  canAssign: boolean;          
  users?: Array<{ id: number; name: string; email: string }>; 
  defaultUserId?: number;    
};

@Component({
  selector: 'app-task-form-dialog',
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
  templateUrl: './task-form-dialog.component.html',
})
export class TaskFormDialogComponent {
  statuses: Array<{ value: TaskStatus; label: string }> = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'done', label: 'Completada' },
  ];

  form;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormDialogData
  ) {
    this.form = this.fb.nonNullable.group({
      title: [this.data.task?.title ?? '', [Validators.required, Validators.minLength(3)]],
      description: [this.data.task?.description ?? ''],
      status: [this.data.task?.status ?? ('pending' as TaskStatus), [Validators.required]],
      userId: [this.data.task?.userId ?? (this.data.defaultUserId ?? 0), [Validators.required, Validators.min(1)]],
    });

    if (this.data.mode === 'create') {
      this.form.controls.status.setValue('pending');
      this.form.controls.status.disable(); 
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

    const value = this.form.getRawValue();

    if (!this.data.canAssign) {
      value.userId = this.data.task?.userId ?? this.data.defaultUserId ?? value.userId;
    }

    this.dialogRef.close(value);
  }
}
