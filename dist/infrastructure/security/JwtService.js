"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
class JwtService {
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
}
exports.JwtService = JwtService;
