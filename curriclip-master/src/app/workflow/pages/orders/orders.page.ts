import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdersService } from '../../core/orders.service';
import { AuthService } from 'src/app/services/auth.service';

type OrderStatus = 'pending' | 'progress' | 'done';
interface Order { 
  id: number; 
  code: string; 
  status: OrderStatus; 
  created_at: string; 
  client?: { name?: string }; 
  company?: { name?: string }; 
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './orders.page.html'
})
export class OrdersPage implements OnInit {
  usuario: any = null;
  q = '';
  status: '' | OrderStatus = '';
  loading = false;
  data: Order[] = [];
  filtered: Order[] = [];

  constructor(
    private api: OrdersService, 
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Recuperar usuario logueado desde sessionStorage
    this.usuario = this.auth.obtenerUsuario();
    console.log('Usuario logueado:', this.usuario);

    // Si no hay sesión, redirigir al login
    if (!this.usuario) {
      this.auth.cerrarSesion();
      return;
    }

    // Cargar órdenes
    this.load();
  }

  logout() {
    this.auth.cerrarSesion();
  }

  load() {
    this.loading = true;
    this.api.list(this.status || undefined).subscribe({
      next: (rows: any) => {
        this.data = rows as Order[];
        this.apply();
      },
      complete: () => (this.loading = false)
    });
  }

  apply() {
    const q = this.q.trim().toLowerCase();
    this.filtered = this.data.filter(o => {
      const hay = (o.code + ' ' + (o.client?.name || '') + ' ' + (o.company?.name || '')).toLowerCase();
      return !q || hay.includes(q);
    });
  }

  chipColor(s: OrderStatus) {
    return s === 'pending' ? 'warning' : s === 'progress' ? 'tertiary' : 'success';
  }

  label(s: OrderStatus) {
    return s === 'pending' ? 'Pendiente' : s === 'progress' ? 'En progreso' : 'Completada';
  }

  go(o: Order) {
    this.router.navigate(['/wf', 'detail', o.id]);
  }
}
