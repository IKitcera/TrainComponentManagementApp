import { Component, inject } from '@angular/core';
import { TrainComponentsList } from './train-components-list/train-components-list';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TrainComponentDialogComponent } from './train-component-dialog/train-component-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { TrainManagementApiService } from '../../core/services/train-management.api-service';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, switchMap, takeUntil, tap } from 'rxjs';
import { BaseComponent } from '../../shared/components/base.component';
import { Store } from '@ngrx/store';
import { selectIsAdminMode } from '../store/admin-settings/admin-settings.selectors';
import { toggleAdminMode, reloadComponentsList } from '../store/admin-settings/admin-settings.actions';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-train-components-management',
  imports: [
    TrainComponentsList,
    MatIcon,
    MatButton,
    MatIconButton,
    MatSlideToggle,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSuffix,
    ReactiveFormsModule
  ],
  templateUrl: './train-components-management.html',
  styleUrl: './train-components-management.css',
})
export class TrainComponentsManagement extends BaseComponent {
  private dialog = inject(MatDialog);
  private apiService = inject(TrainManagementApiService);
  private store = inject(Store);
  private toastr = inject(ToastrService);

  public searchControl = new FormControl<string>('', { nonNullable: true });

  public isAdminMode$ = this.store.select(selectIsAdminMode).pipe(takeUntil(this.destroyed$));
  public isAdminMode = toSignal(this.isAdminMode$, { initialValue: false });

  public search$ = this.searchControl.valueChanges.pipe(
    takeUntil(this.destroyed$),
    debounceTime(300),
    distinctUntilChanged(),
  );

  toggleAdminMode(): void {
    this.store.dispatch(toggleAdminMode());
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  openAddDialog(): void {
    this.dialog.open(TrainComponentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { mode: 'add' },
      disableClose: false,
    })
      .afterClosed()
      .pipe(
        takeUntil(this.destroyed$),
        filter(result => !!result),
        switchMap(result => this.apiService.addComponent(result).pipe(
          tap(() => {
            this.toastr.success(`Component "${result.name}" added successfully`, 'Success');
            this.store.dispatch(reloadComponentsList());
          }),
          catchError(err => {
            console.error('Error adding component:', err);
            return EMPTY;
          })
        ))
      )
      .subscribe();
  }
}
