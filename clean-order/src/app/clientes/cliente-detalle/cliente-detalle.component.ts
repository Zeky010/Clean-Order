import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';  
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Cliente } from '../clientes.types';
import { DocumentoService } from './documento.service';
import { Documento, DocumentoSinArchivo } from './documento.types';
import { DocumentoUploadComponent } from "./documento-upload/documento-upload.component";

@Component({
  selector: 'app-cliente-detalle',
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.css', "../../shared/entity-table.css"],
  imports: [DocumentoUploadComponent, DatePipe]
})
export class ClienteDetalleComponent implements OnInit {
  private documentoService = inject(DocumentoService);
  private route = inject(ActivatedRoute);
  
  @Input({ required: true }) cliente!: Cliente;
  @Output() canceled = new EventEmitter<void>();
  documentos: DocumentoSinArchivo[] = [];
  isUploadingDocument = false;

  ngOnInit(): void {
    // Cargar documentos del cliente
    this.cargarDocumentos();
  }

  private cargarDocumentos(): void {
    if (this.cliente.rut) {
      this.documentoService.getDocumentosByCliente(this.cliente.rut)
        .subscribe({
          next: (documentos) => {
            this.documentos = documentos;
          },
          error: (error) => {
            console.error('Error al cargar documentos:', error);
          }
        });
    }
  }

  onDocumentoSubido(documento: Documento): void {
    this.isUploadingDocument = true;
    
    this.documentoService.createDocumento(documento)
      .subscribe({
        next: (documentoCreado) => {
          console.log('Documento subido exitosamente:', documentoCreado);
          this.cargarDocumentos(); // Recargar la lista de documentos
          this.isUploadingDocument = false;
        },
        error: (error) => {
          console.error('Error al subir documento:', error);
          this.isUploadingDocument = false;
          alert('Error al subir el documento. Por favor, inténtalo de nuevo.');
        },
      });
  }

  onCancelar(): void {
    this.canceled.emit();
  }


  verDocumento(idDocumento: number): void {
    this.documentoService.getDocumento(idDocumento)
      .subscribe({
        next: (documento) => {
          // Crear URL para mostrar el documento
          const byteCharacters = atob(documento.archivo);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: documento.tipoMime });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          console.error('Error al obtener documento:', error);
          alert('Error al cargar el documento.');
        }
      });
  }

  descargarDocumento(idDocumento: number): void {
    this.documentoService.getDocumento(idDocumento)
      .subscribe({
        next: (documento) => {
          // Crear link de descarga
          const byteCharacters = atob(documento.archivo);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: documento.tipoMime });
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = documento.nombre;
          link.click();
        },
        error: (error) => {
          console.error('Error al descargar documento:', error);
          alert('Error al descargar el documento.');
        }
      });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
