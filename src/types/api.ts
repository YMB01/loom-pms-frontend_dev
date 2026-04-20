export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}
