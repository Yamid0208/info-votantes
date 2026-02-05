import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanerComponent } from './scaner.component';

describe('ScanerComponent', () => {
  let component: ScanerComponent;
  let fixture: ComponentFixture<ScanerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScanerComponent]
    });
    fixture = TestBed.createComponent(ScanerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
