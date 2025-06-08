import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowadderComponent } from './rowadder.component';

describe('RowadderComponent', () => {
  let component: RowadderComponent;
  let fixture: ComponentFixture<RowadderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RowadderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RowadderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
