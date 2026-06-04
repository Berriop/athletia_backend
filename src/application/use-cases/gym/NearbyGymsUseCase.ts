import { IGoogleMapsService } from '../../../domain/services/IGoogleMapsService';
import { Gym } from '../../../domain/entities/Gym';
import { NearbyGymsDTO } from '../../dto/gym.dto';

export class NearbyGymsUseCase {
  constructor(private googleMapsService: IGoogleMapsService) {}

  async execute(params: NearbyGymsDTO): Promise<Gym[]> {
    return this.googleMapsService.findNearbyGyms({
      lat: params.lat,
      lng: params.lng,
      radius: params.radius,
    });
  }
}
