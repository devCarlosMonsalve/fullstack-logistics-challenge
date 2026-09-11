import { provideHttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VehicleAssignmentComponent } from './vehicle-assignment';

describe('VehicleAssignmentComponent', () => {
  let component: VehicleAssignmentComponent;
  let fixture: ComponentFixture<VehicleAssignmentComponent>;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleAssignmentComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleAssignmentComponent);
    component = fixture.componentInstance;
    form = Reflect.get(component, 'assignmentForm') as FormGroup;
    await fixture.whenStable();
  });

  it('accepts UUID v4 shipment IDs', () => {
    form.get('shipmentIds')?.setValue('5cc70dd4-0018-45b1-8d89-31982b075508');

    expect(form.get('shipmentIds')?.valid).toBe(true);
  });

  it('rejects UUIDs from other versions', () => {
    form.get('shipmentIds')?.setValue('6ba7b810-9dad-11d1-80b4-00c04fd430c8');

    expect(form.get('shipmentIds')?.hasError('invalidShipmentIds')).toBe(true);
  });
});
