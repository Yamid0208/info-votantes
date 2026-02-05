
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-scaner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZXingScannerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './scaner.component.html',
  styleUrl: './scaner.component.css',
})
export class ScanerComponent {
  isScannerVisible = false;
  allowedFormats = [BarcodeFormat.PDF_417, BarcodeFormat.QR_CODE];

  startScanner() {
    this.isScannerVisible = true;
  }

  scanSuccessHandler(event: any) {
    const result = event;
    console.log('Datos escaneados:', result);
    this.isScannerVisible = false;
  }
}
