import { IGoogleMapsService } from '../../../domain/services/IGoogleMapsService';
import { Gym } from '../../../domain/entities/Gym';
import { SearchGymsDTO } from '../../dto/gym.dto';

export class SearchGymsUseCase {
  constructor(private googleMapsService: IGoogleMapsService) {}

  async execute(params: SearchGymsDTO): Promise<Gym[]> {
    return this.googleMapsService.searchGyms({
      query: params.q,
      lat: params.lat,
      lng: params.lng,
    });
  }
}
