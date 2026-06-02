"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
