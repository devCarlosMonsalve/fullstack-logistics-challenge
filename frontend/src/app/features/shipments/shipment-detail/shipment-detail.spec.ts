import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentDetail } from './shipment-detail';

describe('ShipmentDetail', () => {
  let component: ShipmentDetail;
  let fixture: ComponentFixture<ShipmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
