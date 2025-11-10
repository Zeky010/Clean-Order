import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdersService } from '../../core/orders.service';
import { AuthService } from 'src/app/services/auth.service';
import { Orden } from '../../core/types'
import { EmpleadoApp } from 'src/app/services/empleado.service';

type OrderStatus = 'pending' | 'progress' | 'done';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.css']
})
export class OrdersPage implements OnInit {
  usuario: any = null;
  empleado: EmpleadoApp | null = null;
  q = '';
  status: '' | OrderStatus = '';
  loading = false;
  data: Orden[] = [];
  filtered: Orden[] = [];
  private api: OrdersService = inject(OrdersService);
  private router: Router = inject(Router);
  private auth: AuthService = inject(AuthService);


  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    if (!this.usuario) {
      this.auth.cerrarSesion();
      return;
    }
    this.empleado = this.auth.getEmpleado() as EmpleadoApp;

    this.load();
  }

  logout() {
    this.auth.cerrarSesion();
  }

  /** 🔹 Cargar órdenes del empleado autenticado */
  load() {
    this.loading = true;

    this.api.list().subscribe({
      next: (rows: Orden[]) => {
        console.log('✅ Datos recibidos del backend:', rows);

        this.data = rows.map(o => ({
          ...o,
          code: o.folio?.toString() || '-',
          status:
            o.estado === 'AGENDADO'
              ? 'pending'
              : o.estado === 'EN PROCESO'
              ? 'progress'
              : o.estado === 'REALIZADO'
              ? 'done'
              : 'pending',
          created_at: o.fechaRegistro
            ? new Date(o.fechaRegistro).toISOString().split('T')[0]
            : '',
          client: { name: o.cliente || 'Sin cliente' },
          address: o.direccion || 'Sin dirección',
          description: o.observaciones || 'Sin observación',
          fechaAgendada: o.fechaAgendada
            ? new Date(o.fechaAgendada).toLocaleString()
            : 'No registrada',
          fechaFinalizado: o.fechaFinalizado
            ? new Date(o.fechaFinalizado).toLocaleString()
            : 'No registrada'
        }));

        this.apply();
      },
      error: err => console.error('❌ Error al obtener órdenes:', err),
      complete: () => (this.loading = false)
    });
  }

  /** 🔹 Filtro de búsqueda local */
  apply() {
    const q = this.q.trim().toLowerCase();
    this.filtered = this.data.filter(o => {
      const hay = (
        o.id +
        ' ' +
        (o.cliente) +
        ' ' +
        (o.direccion || '')
      ).toLowerCase();
      return !q || hay.includes(q);
    });
  }

  /** 🔹 Colores según estado */
  chipColor(s: string) {
    return s === 'AGENDADO'
      ? 'warning'
      : s === 'EN PROCESO'
      ? 'tertiary'
      : s === 'REALIZADO'
      ? 'success'
      : 'danger'; // SUSPENDIDO
  }

  /** 🔹 Navegar al detalle */
  go(o: Orden) {
    this.router.navigate(['/wf', 'detail', o.id]);
  }
}
