import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';
import { Gym } from '../../domain/entities/Gym';

// RF-18 — Búsqueda de gimnasios por texto. Basado en el diagrama
// "RF-18 Back (SearchGymsUseCase)" (Patrón A, V(G)=1, lineal, 1 camino básico).
function gym(overrides: Partial<Gym> = {}): Gym {
  return {
    placeId: 'place-1',
    name: 'PowerFit Gym',
    address: 'Calle 10 # 20-30',
    lat: 4.6, lng: -74.1,
    rating: 4.5,
    userRatingsTotal: 120,
    openNow: true,
    types: ['gym'],
    ...overrides,
  };
}

describe('SearchGymsUseCase', () => {
  let googleMapsService: IGoogleMapsService;
  let useCase: SearchGymsUseCase;

  beforeEach(() => {
    googleMapsService = {
      findNearbyGyms: vi.fn(),
      searchGyms: vi.fn(),
    };
    useCase = new SearchGymsUseCase(googleMapsService);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: arma los parámetros de búsqueda y retorna los gimnasios encontrados', async () => {
    const results = [gym()];
    vi.mocked(googleMapsService.searchGyms).mockResolvedValue(results);

    const response = await useCase.execute({ q: 'PowerFit', lat: 4.6, lng: -74.1 });

    expect(googleMapsService.searchGyms).toHaveBeenCalledWith({
      query: 'PowerFit',
      lat: 4.6,
      lng: -74.1,
    });
    expect(response).toEqual(results);
  });

  it('Camino 1: funciona sin coordenadas opcionales (solo texto)', async () => {
    vi.mocked(googleMapsService.searchGyms).mockResolvedValue([]);

    const response = await useCase.execute({ q: 'CrossFit' });

    expect(googleMapsService.searchGyms).toHaveBeenCalledWith({
      query: 'CrossFit',
      lat: undefined,
      lng: undefined,
    });
    expect(response).toEqual([]);
  });
});
