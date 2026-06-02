"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
// Protected by both authMiddleware and adminMiddleware
router.get('/dashboard', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the admin dashboard',
        data: {
            stats: 'Sensitive admin stats would go here'
        }
    });
});
exports.adminRouter = router;
