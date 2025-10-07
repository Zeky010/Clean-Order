import { Component, OnInit, Output, EventEmitter, Input, forwardRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { noop } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Comuna, Region } from './comuna-region.types';
import { ComunaRegionService } from './comuna.service';
import { RegionService } from './region.service';

@Component({
  selector: 'app-comuna-region-selector',
  standalone: true,
  imports: [],
  templateUrl: './comuna-region-selector.component.html',
  styleUrls: ['./comuna-region-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComunaRegionSelectorComponent),
      multi: true
    }
  ]
})
export class ComunaRegionSelectorComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() disabled = false;
  @Output() comunaChange = new EventEmitter<number | null>();
  @Input() preset: { regionId: number | null; comunaId: number | null } | null = null;

  private regionService = inject(RegionService);
  private comunaService = inject(ComunaRegionService);

  public regions: Region[] = [];
  public comunas: Comuna[] = [];
  public selectedRegionId: number | null = null;
  public selectedComunaId: number | null = null;

  private onChange: (value: number | null) => void = noop; //se implementa noop para eliminar alerta de fucnion vacia
  private onTouched: () => void = noop; //se implementa noop para eliminar alerta de funcion vacia

  ngOnInit(): void {
    this.loadRegions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preset'] && this.preset) {
      this.applyPreset(this.preset);
    }
  }

  private applyPreset(p: { regionId: number | null; comunaId: number | null }): void {
    if (p.regionId == null) return;
    const needsReload = p.regionId !== this.selectedRegionId;
    this.selectedRegionId = p.regionId;
    this.selectedComunaId = null;
    if (needsReload) {
      this.loadComunasByRegion(p.regionId, () => {
        if (p.comunaId) {
          this.selectedComunaId = p.comunaId;
          this.updateValue(false);
        }
      });
    } else if (p.comunaId) {
      this.selectedComunaId = p.comunaId;
      this.updateValue(false);
    }
  }

  loadRegions(): void {
    this.regionService.getRegions().subscribe({
      next: regs => this.regions = regs,
      error: err => {
        console.error('Error loading regions', err)
      }
        
    });
  }

  onRegionChange(value: string): void {
    const regionId = value ? +value : null;
    this.selectedRegionId = regionId;
    this.selectedComunaId = null;
    this.comunas = [];
    if (regionId !== null) {
      this.loadComunasByRegion(regionId);
    }
    this.updateValue();
  }

  onComunaChange(value: string): void {
    const comunaId = value ? +value : null;
    this.selectedComunaId = comunaId;
    this.updateValue();
  }

  private loadComunasByRegion(regionId: number, after?: () => void): void {
    this.comunaService.getComunasByRegion(regionId).subscribe({
      next: comunas => {
        this.comunas = comunas;
        if (after) after();
      },
      error: (error) => {
        console.error('Error loading comunas:', error);
      }
    });
  }

  private updateValue(callOnChange = true): void {
    if (callOnChange) {
      this.onChange(this.selectedComunaId);
      this.comunaChange.emit(this.selectedComunaId);
    }
    this.onTouched();
  }

  // Simplificado: usar RegionService.getRegionByComunaId en lugar de getComunaById + deducir región
  writeValue(value: string | number | null): void {
    // Limpiar estado si no hay valor
    if (value == null || value === '' || value === 0) {
      this.selectedRegionId = null;
      this.selectedComunaId = null;
      this.comunas = [];
      return;
    }

    const comunaId = typeof value === 'string' ? Number(value) : value;
    
    // Si es el mismo valor que ya tenemos, no hacer nada
    if (comunaId === this.selectedComunaId) {
      return;
    }

    // Obtener la región que contiene esta comuna
    this.regionService.getRegionByComunaId(comunaId).subscribe({
      next: (region) => {
        if (!region) {
          console.warn(`No se encontró región para la comuna ID: ${comunaId}`);
          return;
        }

        // Establecer la región
        this.selectedRegionId = region.id;

        // Cargar las comunas de esta región
        this.loadComunasByRegion(region.id, () => {
          // Verificar que la comuna existe en la lista cargada
          const comunaExists = this.comunas.some(c => c.id === comunaId);
          
          if (comunaExists) {
            // Usar setTimeout para asegurar que el DOM se actualice
            setTimeout(() => {
            this.selectedComunaId = comunaId;            
              this.updateValue(false);
            }, 200);
          } else {
            console.warn(`Comuna ID ${comunaId} no encontrada en la región ${region.nombre}`);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener región por comuna ID:', err);
        // En caso de error, limpiar el estado
        this.selectedRegionId = null;
        this.selectedComunaId = null;
        this.comunas = [];
      }
    });
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}