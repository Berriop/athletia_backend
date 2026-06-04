export interface Gym {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  userRatingsTotal: number | null;
  openNow: boolean | null;
  types: string[];
}
