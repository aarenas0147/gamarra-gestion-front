import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogView } from './catalog-view';

describe('CatalogView', () => {
  let component: CatalogView;
  let fixture: ComponentFixture<CatalogView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
