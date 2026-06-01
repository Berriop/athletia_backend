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
    async hash(plain) {
        return bcrypt_1.default.hash(plain, this.saltRounds);
    }
    async compare(plain, hashed) {
        return bcrypt_1.default.compare(plain, hashed);
    }
}
exports.BcryptService = BcryptService;
