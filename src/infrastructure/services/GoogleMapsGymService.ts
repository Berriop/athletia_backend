import { env } from '../../config/env';
import { Gym } from '../../domain/entities/Gym';
import { IGoogleMapsService, NearbyQuery, SearchQuery } from '../../domain/services/IGoogleMapsService';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  types?: string[];
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

export class GoogleMapsGymService implements IGoogleMapsService {
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

  async findNearbyGyms(params: NearbyQuery): Promise<Gym[]> {
    const url = `${this.baseUrl}/nearbysearch/json?location=${params.lat},${params.lng}&radius=${params.radius}&type=gym&key=${env.GOOGLE_MAPS_API_KEY}`;
    const data = await this.fetchPlaces(url);
    return this.mapResults(data.results);
  }

  async searchGyms(params: SearchQuery): Promise<Gym[]> {
    let query = params.query;
    if (params.lat !== undefined && params.lng !== undefined) {
      query = `${query}&location=${params.lat},${params.lng}`;
    }
    const url = `${this.baseUrl}/textsearch/json?query=gym+${encodeURIComponent(params.query)}&type=gym&key=${env.GOOGLE_MAPS_API_KEY}`;
    const data = await this.fetchPlaces(url);
    return this.mapResults(data.results);
  }

  private async fetchPlaces(url: string): Promise<GooglePlacesResponse> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }
    const data = (await response.json()) as GooglePlacesResponse;
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
    }
    return data;
  }

  private mapResults(results: GooglePlaceResult[]): Gym[] {
    return results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity ?? place.formatted_address ?? '',
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? null,
      openNow: place.opening_hours?.open_now ?? null,
      types: place.types ?? [],
    }));
  }
}
