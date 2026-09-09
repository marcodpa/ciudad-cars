import { fleet } from './fleet';

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};

export function registerFleetReadTool(getSelected: () => number) {
  const registry = (document as Document & { modelContext?: ModelContext })
    .modelContext;
  if (!registry?.registerTool) return () => {};
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(
      registry.registerTool(
        {
          name: 'get_ciudad_cars_fleet',
          title: 'Consultar la flota de Ciudad Cars',
          description:
            'Devuelve las cinco categorías, tarifas desde, capacidades y el vehículo que se está viendo. No verifica disponibilidad ni crea reservas.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute(input: unknown) {
            if (
              !input ||
              typeof input !== 'object' ||
              Array.isArray(input) ||
              Object.keys(input).length
            )
              throw new TypeError('Se espera un objeto vacío.');
            return {
              selectedVehicleId: fleet[getSelected()].id,
              currency: 'USD',
              rateBasis:
                'Desde, por día; modelo o similar. Confirmar tarifa final y disponibilidad.',
              vehicles: fleet.map(
                ({
                  id,
                  category,
                  make,
                  model,
                  price,
                  passengers,
                  bags,
                  doors,
                }) => ({
                  id,
                  category,
                  make,
                  model,
                  price,
                  passengers,
                  bags,
                  doors,
                  transmission: 'Automático',
                }),
              ),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => lifecycle.abort());
  } catch {
    lifecycle.abort();
  }
  return () => lifecycle.abort();
}
