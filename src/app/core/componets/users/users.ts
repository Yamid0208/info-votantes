import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare const cv: any;

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private stream!: MediaStream;
  private cap!: any;
  private animationId!: number;
  isScanning: boolean = false;
  documentDetected: boolean = false;
  private detectionConfidence: number = 0;
  private consecutiveDetections: number = 0;
  private readonly requiredDetections: number = 3;
  private hasLoggedBindingError: boolean = false;

  // Mats persistentes
  private src!: any;
  private gray!: any;
  private edges!: any;
  private hsv!: any;
  private mask!: any;

  ngAfterViewInit(): void {
    // No iniciar cámara automáticamente; se controla con el botón.
  }

  startScanning(): void {
    if (this.isScanning) return;
    this.isScanning = true;
    this.documentDetected = false;
    this.consecutiveDetections = 0;
    this.hasLoggedBindingError = false;
    this.waitForOpenCV();
  }

  stopScanning(): void {
    this.isScanning = false;
    this.documentDetected = false;
    this.consecutiveDetections = 0;
    this.stopCamera();
  }

  waitForOpenCV() {
    if (cv?.Mat) {
      this.initCamera();
    } else {
      setTimeout(() => this.waitForOpenCV(), 100);
    }
  }

  async initCamera() {
    if (!this.isScanning) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    const video = this.video.nativeElement;
    video.srcObject = this.stream;
    video.play();

    video.onloadedmetadata = () => {
      if (!this.isScanning) {
        this.stopCamera();
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      // VALIDACIÓN CRÍTICA
      if (!width || !height) {
        console.error('Video size inválido');
        return;
      }

      video.width = width;
      video.height = height;

      const canvas = this.canvas.nativeElement;
      canvas.width = width;
      canvas.height = height;

      this.cap = new cv.VideoCapture(video);

      // Mats creados UNA SOLA VEZ
      this.src?.delete();
      this.gray?.delete();
      this.edges?.delete();
      this.hsv?.delete();
      this.mask?.delete();

      this.src = new cv.Mat(height, width, cv.CV_8UC4);
      this.gray = new cv.Mat(height, width, cv.CV_8UC1);
      this.edges = new cv.Mat(height, width, cv.CV_8UC1);
      this.hsv = new cv.Mat(height, width, cv.CV_8UC3);
      this.mask = new cv.Mat(height, width, cv.CV_8UC1);

      this.processFrame();
    };
  }

  private detectColombianIdCard(contours: any, hierarchy: any): boolean {
    if (contours.size() === 0) return false;

    let cardsDetected = 0;
    const minArea = 30000; // Área mínima para una cédula (ajustado)
    const maxArea = 500000; // Área máxima
    const minAspectRatio = 1.3; // Cédula es más ancha que alta (aprox 85.6 x 53.98 mm)
    const maxAspectRatio = 2;

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);

      // Filtrar por área
      if (area < minArea || area > maxArea) continue;

      const rect = cv.boundingRect(cnt);
      const aspectRatio = rect.width / rect.height;

      // Validar relación de aspecto (características de cédula)
      if (aspectRatio >= minAspectRatio && aspectRatio <= maxAspectRatio) {
        // Aproximar contorno para validar que sea rectangular
        const perimeter = cv.arcLength(cnt, true);
        const approx = cv.approxPolyDP(cnt, 0.02 * perimeter, true);

        // Una cédula bien detectada debe tener 4 puntos (rectángulo)
        if (approx.rows === 4) {
          cardsDetected++;

          // Dibujar rectángulo detected
          cv.rectangle(
            this.src,
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height),
            new cv.Scalar(0, 255, 0, 255),
            3,
          );
        }

        approx.delete();
      }
    }

    this.detectionConfidence = cardsDetected;
    return cardsDetected > 0;
  }

  private async captureAndProcessDocument(): Promise<void> {
    if (!this.isScanning) return;

    const canvas = this.canvas.nativeElement;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    console.log('✓ Cédula Colombiana detectada y capturada');
    console.log('─'.repeat(50));
    console.log('📋 INFORMACIÓN DE CAPTURA');
    console.log('─'.repeat(50));
    console.log('Timestamp:', new Date().toLocaleString('es-CO'));
    console.log('Resolución:', `${canvas.width}x${canvas.height}`);
    console.log('Tamaño aprox:', `${(dataUrl.length / 1024).toFixed(2)} KB`);
    console.log('Detecciones en frame:', `${this.detectionConfidence}`);
    console.log('─'.repeat(50));

    this.documentDetected = true;
    this.isScanning = false;
    this.stopCamera();

    // Enviar a servidor para OCR y extracción de datos
    await this.sendImageToServer(dataUrl);
  }

  private async sendImageToServer(base64Data: string): Promise<void> {
    try {
      // Reemplaza esta URL con tu endpoint real
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          documentType: 'colombian_id',
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Imprimir datos extraídos en consola
        console.log('✅ DATOS EXTRAÍDOS DE LA CÉDULA');
        console.log('─'.repeat(50));
        console.log('Número de documento:', result.documentNumber || 'No detectado');
        console.log('Nombre completo:', result.fullName || 'No detectado');
        console.log('Apellido:', result.lastName || 'No detectado');
        console.log('Nombre:', result.firstName || 'No detectado');
        console.log('Fecha de nacimiento:', result.dateOfBirth || 'No detectado');
        console.log('Lugar de expedición:', result.placeOfIssue || 'No detectado');
        console.log('Fecha de expedición:', result.dateOfIssue || 'No detectado');
        console.log('Fecha de vencimiento:', result.expirationDate || 'No detectado');
        console.log('Sexo:', result.gender || 'No detectado');
        console.log('Tipo de sangre:', result.bloodType || 'No detectado');
        console.log('─'.repeat(50));

        console.log('📊 Respuesta completa del servidor:', result);
        this.isScanning = false;
      } else {
        console.warn('⚠️ El servidor respondió con estado:', response.status);
        console.log('Imagen capturada (Base64):', base64Data.substring(0, 100) + '...');
        this.isScanning = false;
      }
    } catch (error) {
      console.error('❌ Error en sendImageToServer:', error);
      console.log('Imagen capturada (Base64):', base64Data.substring(0, 100) + '...');
    }
  }

  processFrame() {
    if (
      !this.isScanning ||
      !this.cap ||
      !this.src ||
      !this.gray ||
      !this.edges ||
      !this.stream?.active ||
      this.video.nativeElement.readyState < 2
    ) {
      if (this.isScanning) {
        this.animationId = requestAnimationFrame(() => this.processFrame());
      }
      return;
    }

    try {
      this.cap.read(this.src);

      // Conversión a escala de grises
      cv.cvtColor(this.src, this.gray, cv.COLOR_RGBA2GRAY);

      // Aplicar Gaussian Blur
      cv.GaussianBlur(this.gray, this.gray, new cv.Size(5, 5), 0);

      // Aplicar Canny para detectar bordes
      cv.Canny(this.gray, this.edges, 75, 200);

      // Dilatar para conectar bordes
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.dilate(this.edges, this.edges, kernel, new cv.Point(-1, -1), 2);

      // Encontrar contornos
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      cv.findContours(
        this.edges,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
      );

      // Detectar cédula colombiana
      const cardDetected = this.detectColombianIdCard(contours, hierarchy);

      if (cardDetected) {
        this.consecutiveDetections++;
      } else {
        this.consecutiveDetections = 0;
      }

      // Si se detecta de forma consistente, capturar
      if (
        this.consecutiveDetections >= this.requiredDetections &&
        !this.documentDetected
      ) {
        this.captureAndProcessDocument();
      }

      cv.imshow(this.canvas.nativeElement, this.src);

      kernel.delete();
      contours.delete();
      hierarchy.delete();

      this.animationId = requestAnimationFrame(() => this.processFrame());
    } catch (error: any) {
      if (error?.name === 'BindingError') {
        if (!this.hasLoggedBindingError) {
          console.error('Error en processFrame BindingError', error);
          this.hasLoggedBindingError = true;
        }
        this.stopScanning();
        return;
      }

      console.error('Error en processFrame', error);
      this.animationId = requestAnimationFrame(() => this.processFrame());
    }
  }

  private stopCamera(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined as unknown as MediaStream;
    this.cap = undefined as unknown as any;
  }



  ngOnDestroy(): void {
    this.stopCamera();

    this.src?.delete();
    this.gray?.delete();
    this.edges?.delete();
    this.hsv?.delete();
    this.mask?.delete();
  }
}
