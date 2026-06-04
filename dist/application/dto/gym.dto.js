"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchGymsSchema = exports.NearbyGymsSchema = void 0;
const zod_1 = require("zod");
exports.NearbyGymsSchema = zod_1.z.object({
    query: zod_1.z.object({
        lat: zod_1.z.coerce.number(),
        lng: zod_1.z.coerce.number(),
        radius: zod_1.z.coerce.number().positive().max(50000).optional().default(5000),
    }),
});
exports.SearchGymsSchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z.string().min(1, 'Search query is required'),
        lat: zod_1.z.coerce.number().optional(),
        lng: zod_1.z.coerce.number().optional(),
    }),
});
