import type { Vehicle } from './fleet';

export type CatalogFilters = {
  category: string;
  passengers: number;
  sort: string;
};
export const defaultFilters: CatalogFilters = {
  category: 'all',
  passengers: 0,
  sort: 'price-asc',
};

export function filterFleet(
  vehicles: readonly Vehicle[],
  filters: CatalogFilters,
) {
  return vehicles
    .filter(
      (car) =>
        (filters.category === 'all' || car.category === filters.category) &&
        car.passengers >= filters.passengers,
    )
    .sort((a, b) =>
      filters.sort === 'price-desc' ? b.price - a.price : a.price - b.price,
    );
}
