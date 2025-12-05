import { TestBed, inject } from '@angular/core/testing';
import { VisorReportesService } from './visor-reportes.service';

describe('Service: VisorReportes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisorReportesService]
    });
  });

  it('should ...', inject([VisorReportesService], (service: VisorReportesService) => {
    expect(service).toBeTruthy();
  }));
});
