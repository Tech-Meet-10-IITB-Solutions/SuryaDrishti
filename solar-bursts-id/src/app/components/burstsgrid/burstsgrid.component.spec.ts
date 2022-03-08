import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BurstsgridComponent } from './burstsgrid.component';

describe('BurstsgridComponent', () => {
  let component: BurstsgridComponent;
  let fixture: ComponentFixture<BurstsgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BurstsgridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BurstsgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
