import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Referido {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  estado: 'Activo' | 'Inactivo';
}

interface ColumnaTabla {
  key: keyof Referido;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  columnasTabla: ColumnaTabla[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'cedula', label: 'Cédula' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'estado', label: 'Estado' }
  ];

  referidos: Referido[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      cedula: '1,234,567',
      telefono: '+57 300 123 4567',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'María García',
      cedula: '1,234,568',
      telefono: '+57 300 234 5678',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'Carlos López',
      cedula: '1,234,569',
      telefono: '+57 300 345 6789',
      estado: 'Inactivo'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      cedula: '1,234,570',
      telefono: '+57 300 456 7890',
      estado: 'Activo'
    }
  ];

  onCrearNuevo() {
    console.log('Crear nuevo referido');
  }

  onExportar() {
    console.log('Exportar datos');
  }

  onEditar(referido: Referido) {
    console.log('Editar referido:', referido);
  }

  onEliminar(referido: Referido) {
    console.log('Eliminar referido:', referido);
  }
}
