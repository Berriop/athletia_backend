import { Gym } from '../../domain/entities/Gym';
import { IGoogleMapsService, NearbyQuery, SearchQuery } from '../../domain/services/IGoogleMapsService';
export declare class GoogleMapsGymService implements IGoogleMapsService {
    private readonly baseUrl;
    findNearbyGyms(params: NearbyQuery): Promise<Gym[]>;
    searchGyms(params: SearchQuery): Promise<Gym[]>;
    private fetchPlaces;
    private mapResults;
}
