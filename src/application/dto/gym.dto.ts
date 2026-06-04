import { z } from 'zod';

export const NearbyGymsSchema = z.object({
  query: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radius: z.coerce.number().positive().max(50000).optional().default(5000),
  }),
});

export const SearchGymsSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  }),
});

export type NearbyGymsDTO = z.infer<typeof NearbyGymsSchema>['query'];
export type SearchGymsDTO = z.infer<typeof SearchGymsSchema>['query'];
