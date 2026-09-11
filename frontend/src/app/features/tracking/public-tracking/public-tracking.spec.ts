import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { PublicTracking } from './public-tracking';

describe('PublicTracking', () => {
  let component: PublicTracking;
  let fixture: ComponentFixture<PublicTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTracking],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
