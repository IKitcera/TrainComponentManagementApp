import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TrainComponent } from '../../../core/services/train-management.api-service';

@Component({
  selector: 'app-view-component-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './view-component-dialog.component.html',
  styleUrl: './view-component-dialog.component.scss',
})
export class ViewComponentDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewComponentDialogComponent>);
  public data = inject<TrainComponent>(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
