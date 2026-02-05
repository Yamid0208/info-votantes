import { Component } from '@angular/core';
import { MatListItem, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatListModule, MatIconModule, MatListItem],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuItems = [
    { icon: 'dashboard', title: 'Dashboard' },
    { icon: 'people', title: 'Usuarios' },
    { icon: 'settings', title: 'Configuración' }
  ];

  selectItem(item: any) {
    console.log('Seleccionado:', item.title);
  }
}
