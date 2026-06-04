"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapsGymService = void 0;
const env_1 = require("../../config/env");
class GoogleMapsGymService {
    constructor() {
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    }
    async findNearbyGyms(params) {
        const url = `${this.baseUrl}/nearbysearch/json?location=${params.lat},${params.lng}&radius=${params.radius}&type=gym&key=${env_1.env.GOOGLE_MAPS_API_KEY}`;
        const data = await this.fetchPlaces(url);
        return this.mapResults(data.results);
    }
    async searchGyms(params) {
        let query = params.query;
        if (params.lat !== undefined && params.lng !== undefined) {
            query = `${query}&location=${params.lat},${params.lng}`;
        }
        const url = `${this.baseUrl}/textsearch/json?query=gym+${encodeURIComponent(params.query)}&type=gym&key=${env_1.env.GOOGLE_MAPS_API_KEY}`;
        const data = await this.fetchPlaces(url);
        return this.mapResults(data.results);
    }
    async fetchPlaces(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Maps API error: ${response.statusText}`);
        }
        const data = (await response.json());
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
        }
        return data;
    }
    mapResults(results) {
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
exports.GoogleMapsGymService = GoogleMapsGymService;
