import {SortDirection} from '@angular/material/sort';

export interface TrainComponentsFilterModel<T> {
  search: string;
  pageSize: number;
  pageIndex: number;
  sortActive: keyof T;
  sortDirection: SortDirection;
}
