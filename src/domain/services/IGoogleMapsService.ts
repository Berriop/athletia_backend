import { Gym } from '../entities/Gym';

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface SearchQuery {
  query: string;
  lat?: number;
  lng?: number;
}

export interface IGoogleMapsService {
  findNearbyGyms(params: NearbyQuery): Promise<Gym[]>;
  searchGyms(params: SearchQuery): Promise<Gym[]>;
}
