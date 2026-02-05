import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Users } from './users';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ZXingScannerModule, NoopAnimationsModule, Users],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start scanning when startScan is called', () => {
    component.startScan();
    expect(component.isScanning).toBe(true);
    expect(component.scannerEnabled).toBe(true);
    expect(component.scanResult).toBeNull();
  });

  it('should stop scanning when stopScan is called', () => {
    component.startScan();
    component.stopScan();
    expect(component.isScanning).toBe(false);
    expect(component.scannerEnabled).toBe(false);
  });

  it('should set scan result on successful scan', () => {
    const mockScanResult = 'test-scan-result';
    component.onScanSuccess(mockScanResult);
    expect(component.scanResult).toBe(mockScanResult);
    expect(component.isScanning).toBe(false);
    expect(component.scannerEnabled).toBe(false);
  });

  it('should set available devices on cameras found', () => {
    const mockDevices: MediaDeviceInfo[] = [
      {
        deviceId: '1',
        kind: 'videoinput',
        label: 'Camera 1',
        groupId: '1',
        toJSON: () => ({}),
      },
      {
        deviceId: '2',
        kind: 'videoinput',
        label: 'Camera 2',
        groupId: '1',
        toJSON: () => ({}),
      },
    ];
    component.onCamerasFound(mockDevices);
    expect(component.availableDevices).toEqual(mockDevices);
    expect(component.selectedDevice).toEqual(mockDevices[0]);
  });
});