import {Component, computed, inject, Input, OnInit, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {TrainComponent, TrainManagementApiService} from '../../../core/services/train-management.api-service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import {BaseComponent} from '../../../shared/components/base.component';
import {TrainComponentsFilterModel} from '../../../core/models/train-components-filter.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {ViewComponentDialogComponent} from '../view-component-dialog/view-component-dialog.component';
import {AssignQuantityDialogComponent} from '../assign-quantity-dialog/assign-quantity-dialog.component';
import {Store} from '@ngrx/store';
import {selectIsAdminMode, selectReloadTrigger} from '../../store/admin-settings/admin-settings.selectors';
import {reloadComponentsList} from '../../store/admin-settings/admin-settings.actions';
import {TrainComponentDialogComponent} from '../train-component-dialog/train-component-dialog.component';

@Component({
  selector: 'app-train-components-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './train-components-list.html',
  styleUrl: './train-components-list.scss',
})
export class TrainComponentsList extends BaseComponent implements OnInit {
  @Input({required: true}) public search!: Observable<string>;

  private trainService = inject(TrainManagementApiService);
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private toastr = inject(ToastrService);

  public isLoading = signal(false);
  public allColumns: (keyof TrainComponent | 'actions') [] = ['id', 'name', 'uniqueNumber', 'canAssignQuantity', 'quantity', 'actions'];
  public userColumns = this.allColumns.filter(col => col !== 'canAssignQuantity');
  public displayedColumns = computed(() => this.isAdminMode()
    ? this.allColumns
    : this.userColumns
  );
  public isAdminMode = toSignal(
    this.store.select(selectIsAdminMode).pipe(
      takeUntil(this.destroyed$)
    ),
    {initialValue: false});

  public filter$ = new BehaviorSubject<TrainComponentsFilterModel<TrainComponent>>({
    search: '',
    pageIndex: 0,
    pageSize: 10,
    sortActive: 'name',
    sortDirection: ''
  });
  private reloadTrigger$ = this.store.select(selectReloadTrigger);
  private source$ = combineLatest([
    this.filter$,
    this.reloadTrigger$
  ]).pipe(
    debounceTime(200), // Debounce rapid filter changes to prevent API spam
    takeUntil(this.destroyed$),
    tap(() => this.isLoading.set(true)),
    switchMap(([filter]) =>
      this.trainService.getAllComponents(filter)),
    tap(() => this.isLoading.set(false)),
    catchError(() => {
      this.isLoading.set(false);
      return EMPTY;
    })
  );
  public totalItems = toSignal(this.source$.pipe(
    takeUntil(this.destroyed$),
    map(list => list.totalItems)
  ));
  public tableSource$ = this.source$.pipe(
    takeUntil(this.destroyed$),
    map(list => list.items)
  );

  ngOnInit() {
    this.search.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
      tap(searchTerm => this.filter$.next({...this.filter$.value, search: searchTerm}))
    ).subscribe();
  }

  openViewDialog(component: TrainComponent): void {
    this.dialog.open(ViewComponentDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: component,
    });
  }

  openAssignQuantityDialog(component: TrainComponent): void {
    this.dialog.open(AssignQuantityDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: component,
    })
      .afterClosed()
      .pipe(
        takeUntil(this.destroyed$),
        filter(quantity => quantity !== undefined && quantity !== component.quantity),
        switchMap(quantity => this.trainService.updateComponentQuantity(component.id, quantity).pipe(
          tap(() => {
            this.toastr.success(`Quantity assigned to "${component.name}" successfully`, 'Success');
            this.store.dispatch(reloadComponentsList());
          }),
          catchError((err) => {
            console.error('Error assigning quantity:', err);
            return EMPTY;
          })
        ))
      )
      .subscribe();
  }

  openEditDialog(component: TrainComponent): void {
    this.dialog.open(TrainComponentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {mode: 'edit', component},
      disableClose: false,
    })
      .afterClosed()
      .pipe(
        takeUntil(this.destroyed$),
        filter(result => !!result),
        tap(_ => this.isLoading.set(true)),
        switchMap((result: TrainComponent) => this.trainService.updateComponent(result.id, result).pipe(
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

  openDeleteDialog(component: TrainComponent): void {
    if (!confirm(`Are you sure you want to delete ${component.name}?`)) {
      return;
    }
    this.isLoading.set(true);
    this.trainService.deleteComponent(component.id).pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        this.toastr.success(`Component "${component.name}" deleted successfully`, 'Success');
        this.store.dispatch(reloadComponentsList());
      }),
      catchError((err) => {
        console.error('Error deleting component:', err);
        return EMPTY;
      })
    ).subscribe();
  }

  public updateFilterWithSorting(sort: Sort) {
    this.filter$.next({
      ...this.filter$.value,
      sortActive: sort.active as keyof TrainComponent,
      sortDirection: sort.direction
    });
  }

  public updateFilterWithPageInfo(pageInfo: PageEvent) {
    this.filter$.next({
      ...this.filter$.value,
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize
    });
  }
}
