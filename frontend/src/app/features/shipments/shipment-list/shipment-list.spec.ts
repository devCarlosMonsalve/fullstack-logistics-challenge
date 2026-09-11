import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ShipmentList } from './shipment-list';

describe('ShipmentList', () => {
  let component: ShipmentList;
  let fixture: ComponentFixture<ShipmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentList],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
