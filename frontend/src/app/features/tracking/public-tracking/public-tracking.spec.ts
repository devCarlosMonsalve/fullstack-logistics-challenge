import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTracking } from './public-tracking';

describe('PublicTracking', () => {
  let component: PublicTracking;
  let fixture: ComponentFixture<PublicTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
