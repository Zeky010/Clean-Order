import { Component, OnInit, Output, EventEmitter, Input, forwardRef, inject, OnChanges, SimpleChanges } from '@angular/core';
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

  private onChange = (_value: number | null) => {};
  private onTouched = () => {};

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
      error: err => console.error('Error loading regions', err)
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
  writeValue(value: number | null): void {
    if (value == null) {
      this.selectedComunaId = null;
      return;
    }
    if (value === this.selectedComunaId) return;

    this.selectedComunaId = value;

    // Obtener región directamente desde la comuna
    this.regionService.getRegionByComunaId(value).subscribe({
      next: region => {
        if (!region) return;
        const regionId = region.id;
        if (regionId !== this.selectedRegionId) {
          this.selectedRegionId = regionId;
          this.loadComunasByRegion(regionId, () => {
            // asegurar selección
            if (this.comunas.some(c => c.id === value)) {
              this.selectedComunaId = value;
              this.updateValue(false);
            }
          });
        }
      },
      error: err => console.error('Error obteniendo región por comuna', err)
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