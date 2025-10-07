import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Documento } from '../documento.types';
import { noop } from 'rxjs';

@Component({
  selector: 'app-documento-upload',
  templateUrl: './documento-upload.component.html',
  styleUrls: ['./documento-upload.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentoUploadComponent),
      multi: true
    }
  ]
})
export class DocumentoUploadComponent {
  @Input() rutCliente!: string;
  @Output() documentoSubido = new EventEmitter<Documento>();

  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  
  private onChange = (value: Documento | null) => { void value; };
  private onTouched = () => noop();

  // ControlValueAccessor implementation
  // writeValue(_value: Documento | null): void {
  //   // Implementar si necesitas mostrar un documento existente
  // }

  registerOnChange(fn: (value: Documento | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    this.errorMessage = '';
    
    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'El archivo es demasiado grande. Máximo 10MB.';
      window.alert(this.errorMessage);
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Tipo de archivo no permitido.';
      window.alert(this.errorMessage);
      return;
    }

    this.selectedFile = file;
    this.convertToBase64AndEmit();
  }

  private convertToBase64AndEmit(): void {
    if (!this.selectedFile || !this.rutCliente) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      this.uploadProgress = 10;
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 80) + 10;
      }
    };

    reader.onload = () => {
      this.uploadProgress = 100;
      
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remover el prefijo data:

      const documento: Documento = {
        idDocumento: 0, // Se asignará en el backend
        nombre: this.selectedFile!.name,
        fechaSubida: new Date(),
        tipoMime: this.selectedFile!.type,
        archivo: base64Data,
        tamanoBytes: this.selectedFile!.size,
        rutCliente: this.rutCliente
      };

      this.onChange(documento);
      this.documentoSubido.emit(documento);
      this.onTouched();
      
      setTimeout(() => {
        this.isUploading = false;
        this.uploadProgress = 0;
      }, 500);
    };

    reader.onerror = () => {
      this.errorMessage = 'Error al leer el archivo.';
      this.isUploading = false;
      this.uploadProgress = 0;
      window.alert(this.errorMessage);
    };

    reader.readAsDataURL(this.selectedFile);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.onChange(null);
    this.onTouched();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


}
