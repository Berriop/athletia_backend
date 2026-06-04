import { IGoogleMapsService } from '../../../domain/services/IGoogleMapsService';
import { Gym } from '../../../domain/entities/Gym';
import { SearchGymsDTO } from '../../dto/gym.dto';
export declare class SearchGymsUseCase {
    private googleMapsService;
    constructor(googleMapsService: IGoogleMapsService);
    execute(params: SearchGymsDTO): Promise<Gym[]>;
}
