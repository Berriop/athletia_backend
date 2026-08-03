import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleMapsGymService } from '../../infrastructure/services/GoogleMapsGymService';
import { ExternalServiceError } from '../../domain/errors/AppError';

describe('GoogleMapsGymService', () => {
  let service: GoogleMapsGymService;

  beforeEach(() => {
    service = new GoogleMapsGymService();
    vi.restoreAllMocks();
  });

  it('searchGyms correctly appends location parameter to URL when lat/lng are supplied', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'p1',
            name: 'Gym Central',
            vicinity: 'Main St 123',
            geometry: { location: { lat: 40.7128, lng: -74.006 } },
            rating: 4.5,
            user_ratings_total: 100,
            types: ['gym', 'health'],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const gyms = await service.searchGyms({
      query: 'crossfit',
      lat: 40.7128,
      lng: -74.006,
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('query=gym+crossfit');
    expect(url).toContain('&location=40.7128,-74.006');
    expect(gyms).toHaveLength(1);
    expect(gyms[0].name).toBe('Gym Central');
  });

  it('throws ExternalServiceError when Google API returns non-OK status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'REQUEST_DENIED',
        error_message: 'The provided API key is invalid',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      service.findNearbyGyms({ lat: 40.7128, lng: -74.006, radius: 5000 }),
    ).rejects.toThrow(ExternalServiceError);
  });
});
