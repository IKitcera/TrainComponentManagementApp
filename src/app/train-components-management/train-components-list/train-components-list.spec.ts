import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainComponentsList } from './train-components-list';

describe('TrainComponentsList', () => {
  let component: TrainComponentsList;
  let fixture: ComponentFixture<TrainComponentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainComponentsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainComponentsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
