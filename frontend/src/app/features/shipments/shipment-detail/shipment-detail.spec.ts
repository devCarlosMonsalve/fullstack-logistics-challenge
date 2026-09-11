import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ShipmentDetail } from './shipment-detail';

describe('ShipmentDetail', () => {
  let component: ShipmentDetail;
  let fixture: ComponentFixture<ShipmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
