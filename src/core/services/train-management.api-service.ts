import {Injectable} from '@angular/core';
import {Observable, of, take, throwError} from 'rxjs';
import {delay} from 'rxjs/operators';
import {TrainComponentsFilterModel} from '../models/train-components-filter.model';
import {commonSortComparator} from '../../shared/functions/common-sort-comparator.function';
import {PagedList} from '../../shared/models/paged-list';

/**
 * Train Component Interface
 */
export interface TrainComponent {
  id: number;
  name: string;
  uniqueNumber: string;
  canAssignQuantity: boolean;
  quantity: number | null;
}

/**
 * Train Component API Service
 * Simulates API calls using localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class TrainManagementApiService {
  private readonly storageKey = 'trainComponents';
  private readonly networkDelay = 1000; // Simulate network delay in ms

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Get all components
   */
  getAllComponents(filter: TrainComponentsFilterModel<TrainComponent>): Observable<PagedList<TrainComponent>> {
    try {
      const data = localStorage.getItem(this.storageKey);
      let components: TrainComponent[] = data ? JSON.parse(data) : [];

      const searchTerm = filter.search?.trim()?.toLowerCase();
      if (searchTerm?.length) {
        components = components.filter(c =>
          c.id.toString().startsWith(searchTerm)
          || c.name.toLowerCase().includes(searchTerm)
          || c.uniqueNumber.toLowerCase().startsWith(searchTerm))
      }

      if (filter.sortActive && filter.sortDirection) {
        components = components.sort((a, b) =>
          commonSortComparator(
            a[filter.sortActive!],
            b[filter.sortActive!],
            filter.sortDirection === 'asc')
        );
      }
      const totalItems = components.length;
      if (filter.pageSize) {
        components = components.slice(filter.pageIndex * filter.pageSize, (filter.pageIndex + 1) * filter.pageSize);
      }

      return of({
        items: components,
        totalItems
      } as PagedList<TrainComponent>).pipe(
        delay(this.networkDelay),
        take(1)
      );
    } catch (error) {
      return throwError(() => new Error('Failed to fetch components: ' + (error as Error).message));
    }
  }

  /**
   * Get component by ID
   */
  getComponentById(id: number): Observable<TrainComponent> {
    try {
      const components: TrainComponent[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const component = components.find(c => c.id === id);

      if (!component) {
        return throwError(() => new Error('Component not found')).pipe(delay(this.networkDelay));
      }

      return of(component).pipe(delay(this.networkDelay));
    } catch (error) {
      return throwError(() => new Error('Failed to fetch component: ' + (error as Error).message));
    }
  }

  /**
   * Update component quantity
   */
  updateComponentQuantity(id: number, quantity: number): Observable<TrainComponent> {
    try {
      const components: TrainComponent[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const index = components.findIndex(c => c.id === id);

      if (index === -1) {
        return throwError(() => new Error('Component not found')).pipe(delay(this.networkDelay));
      }

      const component = components[index];

      if (!component.canAssignQuantity) {
        return throwError(() => new Error('Cannot assign quantity to this component')).pipe(delay(this.networkDelay));
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return throwError(() => new Error('Quantity must be a positive integer')).pipe(delay(this.networkDelay));
      }

      components[index].quantity = quantity;
      localStorage.setItem(this.storageKey, JSON.stringify(components));

      return of(components[index]).pipe(delay(this.networkDelay));
    } catch (error) {
      return throwError(() => new Error('Failed to update quantity: ' + (error as Error).message));
    }
  }

  /**
   * Update component (all fields)
   */
  updateComponent(id: number, component: Omit<TrainComponent, 'id'>): Observable<TrainComponent> {
    try {
      const components: TrainComponent[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const index = components.findIndex(c => c.id === id);

      if (index === -1) {
        return throwError(() => new Error('Component not found')).pipe(delay(this.networkDelay));
      }

      // Validate quantity if canAssignQuantity is true
      if (component.canAssignQuantity && component.quantity !== null) {
        if (!Number.isInteger(component.quantity) || component.quantity <= 0) {
          return throwError(() => new Error('Quantity must be a positive integer')).pipe(delay(this.networkDelay));
        }
      }

      // If canAssignQuantity is false, ensure quantity is null
      if (!component.canAssignQuantity) {
        component.quantity = null;
      }

      const updatedComponent: TrainComponent = {
        ...component,
        id
      };

      components[index] = updatedComponent;
      localStorage.setItem(this.storageKey, JSON.stringify(components));

      return of(updatedComponent).pipe(delay(this.networkDelay));
    } catch (error) {
      return throwError(() => new Error('Failed to update component: ' + (error as Error).message));
    }
  }

  /**
   * Add new component
   */
  addComponent(component: Omit<TrainComponent, 'id'>): Observable<TrainComponent> {
    try {
      const components: TrainComponent[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const maxId = components.length > 0 ? Math.max(...components.map(c => c.id)) : 0;
      const newComponent: TrainComponent = {
        ...component,
        id: maxId + 1
      };
      components.push(newComponent);
      localStorage.setItem(this.storageKey, JSON.stringify(components));

      return of(newComponent).pipe(delay(this.networkDelay));
    } catch (error) {
      return throwError(() => new Error('Failed to add component: ' + (error as Error).message));
    }
  }

  /**
   * Delete component
   */
  deleteComponent(id: number): Observable<void> {
    try {
      const components: TrainComponent[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const index = components.findIndex(c => c.id === id);

      if (index === -1) {
        return throwError(() => new Error('Component not found')).pipe(delay(this.networkDelay));
      }

      components.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(components));

      return of(void 0).pipe(delay(this.networkDelay));
    } catch (error) {
      return throwError(() => new Error('Failed to delete component: ' + (error as Error).message));
    }
  }

  /**
   * Reset all data to initial state
   */
  resetData(): Observable<void> {
    localStorage.removeItem(this.storageKey);
    this.initializeSampleData();
    return of(void 0);
  }

  /**
   * Initialize sample data if not exists
   */
  private initializeSampleData(): void {
    if (!localStorage.getItem(this.storageKey)) {
      const sampleData: TrainComponent[] = [
        {id: 1, name: "Engine", uniqueNumber: "ENG123", canAssignQuantity: false, quantity: null},
        {id: 2, name: "Passenger Car", uniqueNumber: "PAS456", canAssignQuantity: false, quantity: null},
        {id: 3, name: "Freight Car", uniqueNumber: "FRT789", canAssignQuantity: false, quantity: null},
        {id: 4, name: "Wheel", uniqueNumber: "WHL101", canAssignQuantity: true, quantity: null},
        {id: 5, name: "Seat", uniqueNumber: "STS234", canAssignQuantity: true, quantity: null},
        {id: 6, name: "Window", uniqueNumber: "WIN567", canAssignQuantity: true, quantity: null},
        {id: 7, name: "Door", uniqueNumber: "DR123", canAssignQuantity: true, quantity: null},
        {id: 8, name: "Control Panel", uniqueNumber: "CTL987", canAssignQuantity: true, quantity: null},
        {id: 9, name: "Light", uniqueNumber: "LGT456", canAssignQuantity: true, quantity: null},
        {id: 10, name: "Brake", uniqueNumber: "BRK789", canAssignQuantity: true, quantity: null},
        {id: 11, name: "Bolt", uniqueNumber: "BLT321", canAssignQuantity: true, quantity: null},
        {id: 12, name: "Nut", uniqueNumber: "NUT654", canAssignQuantity: true, quantity: null},
        {id: 13, name: "Engine Hood", uniqueNumber: "EH789", canAssignQuantity: false, quantity: null},
        {id: 14, name: "Axle", uniqueNumber: "AX456", canAssignQuantity: false, quantity: null},
        {id: 15, name: "Piston", uniqueNumber: "PST789", canAssignQuantity: false, quantity: null},
        {id: 16, name: "Handrail", uniqueNumber: "HND234", canAssignQuantity: true, quantity: null},
        {id: 17, name: "Step", uniqueNumber: "STP567", canAssignQuantity: true, quantity: null},
        {id: 18, name: "Roof", uniqueNumber: "RF123", canAssignQuantity: false, quantity: null},
        {id: 19, name: "Air Conditioner", uniqueNumber: "AC789", canAssignQuantity: false, quantity: null},
        {id: 20, name: "Flooring", uniqueNumber: "FLR456", canAssignQuantity: false, quantity: null},
        {id: 21, name: "Mirror", uniqueNumber: "MRR789", canAssignQuantity: true, quantity: null},
        {id: 22, name: "Horn", uniqueNumber: "HRN321", canAssignQuantity: false, quantity: null},
        {id: 23, name: "Coupler", uniqueNumber: "CPL654", canAssignQuantity: false, quantity: null},
        {id: 24, name: "Hinge", uniqueNumber: "HNG987", canAssignQuantity: true, quantity: null},
        {id: 25, name: "Ladder", uniqueNumber: "LDR456", canAssignQuantity: true, quantity: null},
        {id: 26, name: "Paint", uniqueNumber: "PNT789", canAssignQuantity: false, quantity: null},
        {id: 27, name: "Decal", uniqueNumber: "DCL321", canAssignQuantity: true, quantity: null},
        {id: 28, name: "Gauge", uniqueNumber: "GGS654", canAssignQuantity: true, quantity: null},
        {id: 29, name: "Battery", uniqueNumber: "BTR987", canAssignQuantity: false, quantity: null},
        {id: 30, name: "Radiator", uniqueNumber: "RDR456", canAssignQuantity: false, quantity: null}
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(sampleData));
    }
  }
}

