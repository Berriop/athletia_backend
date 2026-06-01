"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const JwtService_1 = require("../../infrastructure/security/JwtService");
const jwtService = new JwtService_1.JwtService();
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwtService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
