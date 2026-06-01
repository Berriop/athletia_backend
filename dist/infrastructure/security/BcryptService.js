"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptService {
    constructor() {
        this.saltRounds = 10;
    }
    async hash(password) {
        return bcrypt_1.default.hash(password, this.saltRounds);
    }
    async compare(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.BcryptService = BcryptService;
