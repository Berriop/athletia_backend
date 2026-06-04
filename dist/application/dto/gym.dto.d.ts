import { z } from 'zod';
export declare const NearbyGymsSchema: z.ZodObject<{
    query: z.ZodObject<{
        lat: z.ZodCoercedNumber<unknown>;
        lng: z.ZodCoercedNumber<unknown>;
        radius: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const SearchGymsSchema: z.ZodObject<{
    query: z.ZodObject<{
        q: z.ZodString;
        lat: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        lng: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type NearbyGymsDTO = z.infer<typeof NearbyGymsSchema>['query'];
export type SearchGymsDTO = z.infer<typeof SearchGymsSchema>['query'];
