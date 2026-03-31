import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, University } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { RolActivoService } from '../../core/auth/rol-activo.service';
import { Rol, ETIQUETAS_ROL, ICONOS_ROL } from '../../shared/models/rol.model';

@Component({
  selector: 'app-seleccionar-rol',
  templateUrl: './seleccionar-rol.html',
  styleUrl: './seleccionar-rol.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  host: { class: 'flex min-h-full' },
})
export class SeleccionarRolComponent {
  protected readonly rolActivoService = inject(RolActivoService);
  private readonly _router = inject(Router);

  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly iconosRol = ICONOS_ROL;
  protected readonly UniversityIcon: LucideIconData = University;

  seleccionarRol(rol: Rol): void {
    this.rolActivoService.seleccionarRol(rol);
    this._router.navigate(['/dashboard']);
  }
}
