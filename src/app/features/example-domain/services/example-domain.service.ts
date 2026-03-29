import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { ExampleItem } from '../models/example-item.model';
import { Page } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ExampleDomainService extends ApiService {
  getAll(page = 0, size = 10): Observable<Page<ExampleItem>> {
    return this.get<Page<ExampleItem>>('example-items', { page, size });
  }

  getById(id: number): Observable<ExampleItem> {
    return this.get<ExampleItem>(`example-items/${id}`);
  }

  create(item: Omit<ExampleItem, 'id' | 'createdAt'>): Observable<ExampleItem> {
    return this.post<ExampleItem>('example-items', item);
  }

  update(id: number, item: Partial<ExampleItem>): Observable<ExampleItem> {
    return this.put<ExampleItem>(`example-items/${id}`, item);
  }

  remove(id: number): Observable<void> {
    return this.delete<void>(`example-items/${id}`);
  }
}
