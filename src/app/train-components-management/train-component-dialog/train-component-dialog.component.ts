import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { TrainComponent } from '../../../core/services/train-management.api-service';
import { NonNegativeDirective } from '../../../shared/directives/non-negative.directive';
import { IntegerDirective } from '../../../shared/directives/integer.directive';
import { BaseComponent } from '../../../shared/components/base.component';
import { takeUntil, tap } from 'rxjs';

export interface TrainComponentDialogData {
  mode: 'add' | 'edit';
  component?: TrainComponent;
}

@Component({
  selector: 'app-train-component-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    NonNegativeDirective,
    IntegerDirective,
  ],
  templateUrl: './train-component-dialog.component.html',
  styleUrl: './train-component-dialog.component.scss',
})
export class TrainComponentDialogComponent extends BaseComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TrainComponentDialogComponent>);
  public data = inject<TrainComponentDialogData>(MAT_DIALOG_DATA);

  public form = this.fb.group({
    name: [this.data.component?.name || '', [Validators.required, Validators.minLength(2)]],
    uniqueNumber: [
      this.data.component?.uniqueNumber || '',
      [Validators.required, Validators.pattern(/^[A-Z]{2,3}\d{3,4}$/)]
    ],
    canAssignQuantity: [this.data.component?.canAssignQuantity || false],
    quantity: [
      { value: this.data.component?.quantity || null, disabled: !this.data.component?.canAssignQuantity },
      [Validators.min(1)]
    ],
  });
  public isEditMode = this.data.mode === 'edit';
  public title = this.isEditMode ? 'Edit Train Component' : 'Add New Train Component';
  public showQuantityField = signal(false);

  constructor() {
    super();

    // Initialize quantity field visibility
    this.showQuantityField.set(this.data.component?.canAssignQuantity || false);

    // Watch canAssignQuantity changes
    this.form.controls['canAssignQuantity']?.valueChanges.pipe(
      takeUntil(this.destroyed$),
      tap((canAssign: boolean | null) => {
        this.showQuantityField.set(!!canAssign);
        const quantityControl = this.form.controls['quantity'];
        if (canAssign) {
          quantityControl?.enable();
        } else {
          quantityControl?.disable();
          quantityControl?.setValue(null);
        }
      })
    ).subscribe();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const result: Partial<TrainComponent> = {
        name: formValue.name || '',
        uniqueNumber: formValue.uniqueNumber || '',
        canAssignQuantity: formValue.canAssignQuantity || false,
        quantity: formValue.canAssignQuantity ? formValue.quantity : null,
      };

      if (this.isEditMode && this.data.component) {
        result.id = this.data.component.id;
      }

      this.dialogRef.close(result);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key as keyof typeof this.form.controls]?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.controls[fieldName as keyof typeof this.form.controls];
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minLength']) return `Minimum ${control.errors['minLength'].requiredLength} characters`;
    if (control.errors['pattern']) return 'Format: 2-3 uppercase letters + 3-4 digits (e.g., ENG123)';
    if (control.errors['min']) return 'Must be a positive number';

    return 'Invalid value';
  }
}
