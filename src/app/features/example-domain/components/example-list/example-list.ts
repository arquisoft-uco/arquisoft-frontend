import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { ExampleDomainService } from '../../services/example-domain.service';
import { ExampleItem } from '../../models/example-item.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-example-list',
  templateUrl: './example-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatCardModule, LoadingComponent],
})
export class ExampleListComponent {
  private readonly _service = inject(ExampleDomainService);

  protected readonly displayedColumns = ['id', 'name', 'description', 'createdAt'];

  protected readonly itemsResource = resource<ExampleItem[], undefined>({
    loader: () => firstValueFrom(this._service.getAll()).then(p => p.content),
  });
}
