import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';
import { Gym } from '../../domain/entities/Gym';


function gym(overrides: Partial<Gym> = {}): Gym {
  return {
    placeId: 'place-1',
    name: 'Smart Fit Poblado',
    address: 'Cra 43A, Medellín',
    lat: 6.209,
    lng: -75.567,
    rating: 4.3,
    userRatingsTotal: 512,
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

  // Camino único: INICIO,1,FIN — con coordenadas para priorizar cercanía
  it('Camino 1: texto de búsqueda con lat/lng → delega en el servicio y retorna los gimnasios encontrados', async () => {
    // Arrange
    const found = [gym(), gym({ placeId: 'place-2', name: 'Bodytech Envigado' })];
    vi.mocked(googleMapsService.searchGyms).mockResolvedValue(found);

    // Act
    const result = await useCase.execute({ q: 'crossfit', lat: 6.209, lng: -75.567 });

    // Assert
    expect(googleMapsService.searchGyms).toHaveBeenCalledWith({
      query: 'crossfit',
      lat: 6.209,
      lng: -75.567,
    });
    expect(result).toEqual(found);
  });

  // Mismo camino único, sin coordenadas — confirma que lat/lng quedan undefined y no rompe la llamada
  it('texto de búsqueda sin coordenadas → delega en el servicio con lat/lng undefined', async () => {
    // Arrange
    vi.mocked(googleMapsService.searchGyms).mockResolvedValue([]);

    // Act
    const result = await useCase.execute({ q: 'gimnasio 24 horas' });

    // Assert
    expect(googleMapsService.searchGyms).toHaveBeenCalledWith({
      query: 'gimnasio 24 horas',
      lat: undefined,
      lng: undefined,
    });
    expect(result).toEqual([]);
  });
});
