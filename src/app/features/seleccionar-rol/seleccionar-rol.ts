import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RolActivoService } from '../../core/auth/rol-activo.service';
import { Rol, ETIQUETAS_ROL, ICONOS_ROL } from '../../shared/models/rol.model';

@Component({
  selector: 'app-seleccionar-rol',
  templateUrl: './seleccionar-rol.html',
  styleUrl: './seleccionar-rol.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SeleccionarRolComponent {
  protected readonly rolActivoService = inject(RolActivoService);
  private readonly _router = inject(Router);

  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly iconosRol = ICONOS_ROL;

  seleccionarRol(rol: Rol): void {
    this.rolActivoService.seleccionarRol(rol);
    this._router.navigate(['/dashboard']);
  }
}
