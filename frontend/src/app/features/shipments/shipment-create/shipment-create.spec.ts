import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { ShipmentCreate } from './shipment-create';

describe('ShipmentCreate', () => {
  let component: ShipmentCreate;
  let fixture: ComponentFixture<ShipmentCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentCreate],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows a zero shipment weight', () => {
    const form = Reflect.get(component, 'shipmentForm') as FormGroup;

    form.get('weight')?.setValue(0);

    expect(form.get('weight')?.valid).toBe(true);
  });

  it('rejects a negative shipment weight', () => {
    const form = Reflect.get(component, 'shipmentForm') as FormGroup;

    form.get('weight')?.setValue(-0.01);

    expect(form.get('weight')?.hasError('nonNegative')).toBe(true);
  });
});
