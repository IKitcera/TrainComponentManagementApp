import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base component with automatic subscription cleanup
 * Usage: Extend this component and use destroyed$ with takeUntil operator
 *
 * @example
 * export class MyComponent extends BaseComponent {
 *   ngOnInit() {
 *     this.myService.getData()
 *       .pipe(takeUntil(this.destroyed$))
 *       .subscribe(data => { ... });
 *   }
 * }
 */
@Component({
  template: '',
  standalone: true,
})
export abstract class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
