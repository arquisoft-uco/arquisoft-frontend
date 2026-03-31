import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="flex items-center justify-center p-12" role="status" aria-live="polite" aria-label="Cargando...">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"
        aria-hidden="true">
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class LoadingComponent {}
