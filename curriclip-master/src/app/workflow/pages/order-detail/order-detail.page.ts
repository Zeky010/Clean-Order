import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EvidenceUploaderComponent } from '../../components/evidence-uploader/evidence-uploader.component';
import { OrdersService } from '../../core/orders.service';
import { Orden } from '../../core/types';
import { Reporte, ImagenesReporte } from '../../core/reporte.type';
import { AuthService } from '../../../services/auth.service';
import { ReporteService, ReporteResponse } from '../../core/Reporte.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, EvidenceUploaderComponent],
  templateUrl: './order-detail.page.html',
})
export class OrderDetailPage implements OnInit {
  id!: number;
  orden?: Orden;
  notesBefore = '';
  notesAfter = '';
  uploading = false;
  imagenesAntes: ImagenesReporte[] = [];
  imagenesDespues: ImagenesReporte[] = [];
  private user: any;
  private authService: AuthService = inject(AuthService);
  private ordersService: OrdersService = inject(OrdersService);
  private reporteService: ReporteService = inject(ReporteService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.ordersService
      .detail(this.id)
      .subscribe((d: Orden) => (this.orden = d));
    this.user = this.authService.obtenerUsuario();
  }

  // Muestra formulario ANTES solo si está AGENDADO
  shouldShowBeforeForm(): boolean {
    return this.orden?.estado === 'AGENDADO';
  }

  // Muestra formulario DESPUÉS solo si está EN PROCESO
  shouldShowAfterForm(): boolean {
    return this.orden?.estado === 'EN PROCESO';
  }

  // Muestra mensaje si está REALIZADO o SUSPENDIDO
  shouldShowCompletedMessage(): boolean {
    return (
      this.orden?.estado === 'REALIZADO' || this.orden?.estado === 'SUSPENDIDO'
    );
  }

  onBefore(e: ImagenesReporte) {
    if (this.imagenesAntes.length >= 3) {
      alert('Solo se permiten 3 imágenes antes');
      return;
    }
    else{
      this.imagenesAntes.push(e);
    }
  }

  onAfter(e: ImagenesReporte) {
    if (this.imagenesDespues.length >= 3) {
      alert('Solo se permiten 3 imágenes después');
      return;
    }
    else{
      this.imagenesDespues.push(e);
    }

  }

  upload(kind: 'before' | 'after') {
    const imagenes =
      kind === 'before' ? this.imagenesAntes : this.imagenesDespues;
    const notes = kind === 'before' ? this.notesBefore : this.notesAfter;

    if (imagenes.length === 0 || !this.user?.correo) {
      alert('Debe seleccionar al menos una imagen');
      return;
    }

    // Validar que la observación no esté vacía
    if (!notes || notes.trim() === '') {
      alert('Debe ingresar una observación');
      return;
    }

    // Construir el reporte según la interfaz
    const reporte: Reporte = {
      correoUsuario: this.user.correo,
      idOrden: this.id,
      observacion: notes,
      tipoReporte: kind === 'before' ? 1 : 2, // 1 = ANTES, 2 = DESPUÉS
      fecha: new Date(),
      imagenesReporte: imagenes,
    };

    this.uploading = true;
    this.reporteService.uploadReporte(reporte).subscribe({
      next: (response: ReporteResponse) => {
        console.log(`Reporte subido exitosamente: ${response.mensaje}`);
        console.log(
          `ID Reporte: ${response.idReporte}, Imágenes: ${response.cantidadImagenes}`
        );

        // Limpiar campos después de subir
        if (kind === 'before') {
          this.imagenesAntes = [];
          this.notesBefore = '';
        } else {
          this.imagenesDespues = [];
          this.notesAfter = '';
        }
        // Recargar la orden para actualizar el estado
        this.router.navigate(['/wf/orders']);
      },
      error: (error: HttpErrorResponse) => {
        this.uploading = false;

        this.handleError(error);
      },
      complete: () => (this.uploading = false),
    });
  }

  private handleError(error: HttpErrorResponse) {

    // Extraer el mensaje de error del servidor (siempre viene en formato ReporteResponse)

    let errorMessage = 'Error desconocido';
    if (
      error.error &&
      typeof error.error === 'object' &&
      'mensaje' in error.error
    ) 
    {
      const errorResponse = error.error as ReporteResponse;
      errorMessage = errorResponse.mensaje;
      console.error(
        `Error del servidor - ID Reporte: ${errorResponse.idReporte}, Mensaje: ${errorResponse.mensaje}`
      );
    }

    switch (error.status) {
      case 400:
        errorMessage = 'Solicitud incorrecta';
        console.error('Error 400 - Solicitud incorrecta:', errorMessage);
        alert(`Error: ${errorMessage}`);
        break;
      case 401:
        errorMessage = 'No está autorizado para realizar esta acción';
        console.error('Error 401 - No autorizado:', errorMessage);
        alert(
          `Error: ${errorMessage}`
        );
        break;
      case 403:
        errorMessage = 'No tiene permisos para subir evidencias';
        console.error('Error 403 - Prohibido:', errorMessage);
        alert(
          `Error: ${errorMessage}`
        );
        break;
      case 404:
        errorMessage = 'Recurso no encontrado';
        console.error('Error 404 - No encontrado:', errorMessage);
        alert(`Error: ${errorMessage}`);
        break;
      case 409:
        errorMessage = 'Conflicto al procesar la solicitud';
        console.error('Error 409 - Conflicto:', errorMessage);
        alert(`Error: ${errorMessage}`);
        break;
      case 413:
        errorMessage = 'Una o más imágenes son demasiado grandes';
        console.error('Error 413 - Archivo muy grande:', errorMessage);
        alert(
          `Error: ${errorMessage}`
        );
        break;
      case 415:
        errorMessage = 'Tipo de archivo no soportado';
        console.error(`Error: ${errorMessage}`);
        alert(`Error: ${errorMessage}`);
        break;
      case 500:
        errorMessage = 'Error interno del servidor';
        console.error('Error 500 - Error del servidor:', errorMessage);
        alert(`Error: ${errorMessage}`);
        break;
      case 503:
        errorMessage = 'Servicio no disponible temporalmente';
        console.error(`Error: ${errorMessage}`);
        alert(`Error: ${errorMessage}`);
        break;
      default:
        console.error(`Error: ${errorMessage}`);
        alert(`Error al subir evidencia: ${errorMessage}`);
    }
  }

  markDone() {
    this.ordersService.markDone(this.id).subscribe(() => {
      // Recargar la orden para actualizar el estado
      this.ordersService
        .detail(this.id)
        .subscribe((d: Orden) => (this.orden = d));
    });
  }

  // Método helper para crear el reporte
  private createReporte(kind: 'before' | 'after'): Reporte | null {
    const imagenes =
      kind === 'before' ? this.imagenesAntes : this.imagenesDespues;
    const notes = kind === 'before' ? this.notesBefore : this.notesAfter;

    if (imagenes.length === 0 || !this.user?.correo) return null;

    return {
      correoUsuario: this.user.correo,
      idOrden: this.id,
      observacion: notes,
      tipoReporte: kind === 'before' ? 1 : 2,
      fecha: new Date(),
      imagenesReporte: imagenes,
    };
  }
}
