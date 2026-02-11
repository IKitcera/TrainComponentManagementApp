import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TrainComponent} from '../../../core/services/train-management.api-service';
import {NonNegativeDirective} from '../../../shared/directives/non-negative.directive';
import {IntegerDirective} from '../../../shared/directives/integer.directive';

@Component({
  selector: 'app-assign-quantity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NonNegativeDirective,
    IntegerDirective,
  ],
  templateUrl: './assign-quantity-dialog.component.html',
  styleUrl: './assign-quantity-dialog.component.scss',
})
export class AssignQuantityDialogComponent {
  public data = inject<TrainComponent>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  public form = this.fb.group({
    quantity: [
      this.data.quantity || null,
      [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]
    ],
  });
  private dialogRef = inject(MatDialogRef<AssignQuantityDialogComponent>);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const quantity = this.form.controls.quantity?.value;
      this.dialogRef.close(quantity);
    } else {
      this.form.controls.quantity?.markAsTouched();
    }
  }

  getErrorMessage(): string {
    const control = this.form.controls.quantity;
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return 'Quantity is required';
    if (control.errors['min']) return 'Quantity must be at least 1';
    if (control.errors['pattern']) return 'Quantity must be a positive integer';

    return 'Invalid value';
  }
}
