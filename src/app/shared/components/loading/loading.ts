import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-wrapper" role="status" aria-live="polite" aria-label="Cargando...">
      <mat-spinner diameter="48" />
    </div>
  `,
  styles: `
    .loading-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
})
export class LoadingComponent {}
