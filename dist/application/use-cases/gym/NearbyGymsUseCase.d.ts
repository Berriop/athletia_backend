import { IGoogleMapsService } from '../../../domain/services/IGoogleMapsService';
import { Gym } from '../../../domain/entities/Gym';
import { NearbyGymsDTO } from '../../dto/gym.dto';
export declare class NearbyGymsUseCase {
    private googleMapsService;
    constructor(googleMapsService: IGoogleMapsService);
    execute(params: NearbyGymsDTO): Promise<Gym[]>;
}
