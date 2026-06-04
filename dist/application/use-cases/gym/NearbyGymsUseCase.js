"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearbyGymsUseCase = void 0;
class NearbyGymsUseCase {
    constructor(googleMapsService) {
        this.googleMapsService = googleMapsService;
    }
    async execute(params) {
        return this.googleMapsService.findNearbyGyms({
            lat: params.lat,
            lng: params.lng,
            radius: params.radius,
        });
    }
}
exports.NearbyGymsUseCase = NearbyGymsUseCase;
