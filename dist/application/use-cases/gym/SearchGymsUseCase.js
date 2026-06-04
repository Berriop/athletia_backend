"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchGymsUseCase = void 0;
class SearchGymsUseCase {
    constructor(googleMapsService) {
        this.googleMapsService = googleMapsService;
    }
    async execute(params) {
        return this.googleMapsService.searchGyms({
            query: params.q,
            lat: params.lat,
            lng: params.lng,
        });
    }
}
exports.SearchGymsUseCase = SearchGymsUseCase;
