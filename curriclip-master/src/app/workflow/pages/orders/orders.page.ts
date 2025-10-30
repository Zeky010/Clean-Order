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
  address?: string;
  description?: string;
  hours?: number;
  fechaAgendada?: string;
  fechaFinalizado?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.css']
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
    this.usuario = this.auth.obtenerUsuario();
    if (!this.usuario) {
      this.auth.cerrarSesion();
      return;
    }
    this.load();
  }

  logout() {
    this.auth.cerrarSesion();
  }

  /** 🔹 Cargar órdenes del empleado autenticado */
  load() {
    this.loading = true;

    this.api.list().subscribe({
      next: (rows: any[]) => {
        console.log('✅ Datos recibidos del backend:', rows);

        this.data = rows.map(o => ({
          id: o.id,
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
          company: { name: o.region?.nombre || 'Sin región' },
          address: o.direccion || 'Sin dirección',
          description: o.observaciones || 'Sin observación',
          hours: o.horasTrabajo || 0,
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
        o.code +
        ' ' +
        (o.client?.name || '') +
        ' ' +
        (o.company?.name || '') +
        ' ' +
        (o.address || '')
      ).toLowerCase();
      return !q || hay.includes(q);
    });
  }

  /** 🔹 Colores según estado */
  chipColor(s: OrderStatus) {
    return s === 'pending'
      ? 'warning'
      : s === 'progress'
      ? 'tertiary'
      : 'success';
  }

  /** 🔹 Texto legible del estado */
  label(s: OrderStatus) {
    return s === 'pending'
      ? 'Pendiente'
      : s === 'progress'
      ? 'En progreso'
      : 'Completada';
  }

  /** 🔹 Navegar al detalle */
  go(o: Order) {
    this.router.navigate(['/wf', 'detail', o.id]);
  }
}
