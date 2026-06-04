"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymController = void 0;
class GymController {
    constructor(nearbyGymsUseCase, searchGymsUseCase) {
        this.nearbyGymsUseCase = nearbyGymsUseCase;
        this.searchGymsUseCase = searchGymsUseCase;
    }
    async nearby(req, res, next) {
        try {
            const gyms = await this.nearbyGymsUseCase.execute(res.locals.query ?? req.query);
            res.json({ success: true, data: gyms });
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const gyms = await this.searchGymsUseCase.execute(res.locals.query ?? req.query);
            res.json({ success: true, data: gyms });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GymController = GymController;
