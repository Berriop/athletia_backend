import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NearbyGymsUseCase } from '../../application/use-cases/gym/NearbyGymsUseCase';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';
import { Gym } from '../../domain/entities/Gym';

// RF-17 — Buscar gimnasios cercanos. V(G)=1, lineal, 1 camino básico.
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

describe('NearbyGymsUseCase', () => {
  let googleMapsService: IGoogleMapsService;
  let useCase: NearbyGymsUseCase;

  beforeEach(() => {
    googleMapsService = {
      findNearbyGyms: vi.fn(),
      searchGyms: vi.fn(),
    };
    useCase = new NearbyGymsUseCase(googleMapsService);
  });

  // Camino 1: INICIO,1,FIN
  it('Camino 1: arma los parámetros de cercanía y retorna los gimnasios encontrados', async () => {
    // Arrange
    const found = [gym(), gym({ placeId: 'place-2', name: 'Bodytech Envigado' })];
    vi.mocked(googleMapsService.findNearbyGyms).mockResolvedValue(found);

    // Act
    const result = await useCase.execute({ lat: 6.209, lng: -75.567, radius: 5000 });

    // Assert
    expect(googleMapsService.findNearbyGyms).toHaveBeenCalledWith({
      lat: 6.209,
      lng: -75.567,
      radius: 5000,
    });
    expect(result).toEqual(found);
  });

  it('Camino 1: retorna lista vacía cuando no hay gimnasios cerca', async () => {
    // Arrange
    vi.mocked(googleMapsService.findNearbyGyms).mockResolvedValue([]);

    // Act
    const result = await useCase.execute({ lat: 4.6, lng: -74.1, radius: 2000 });

    // Assert
    expect(result).toEqual([]);
  });
});
