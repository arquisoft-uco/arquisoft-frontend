import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { ExampleItem } from '../models/ExampleItem';

export const exampleDomainService = {
  getAll: (page = 0, size = 10) =>
    apiClient
      .get<Page<ExampleItem>>('example-items', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ExampleItem>(`example-items/${id}`).then((r) => r.data),

  create: (item: Omit<ExampleItem, 'id' | 'createdAt'>) =>
    apiClient.post<ExampleItem>('example-items', item).then((r) => r.data),

  update: (id: number, item: Partial<Omit<ExampleItem, 'id' | 'createdAt'>>) =>
    apiClient.put<ExampleItem>(`example-items/${id}`, item).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`example-items/${id}`),
};
