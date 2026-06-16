import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenDashboard } from './almacen-dashboard';

describe('AlmacenDashboard', () => {
  let component: AlmacenDashboard;
  let fixture: ComponentFixture<AlmacenDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlmacenDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmacenDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
