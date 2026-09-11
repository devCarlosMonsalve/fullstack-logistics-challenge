import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentCreate } from './shipment-create';

describe('ShipmentCreate', () => {
  let component: ShipmentCreate;
  let fixture: ComponentFixture<ShipmentCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
