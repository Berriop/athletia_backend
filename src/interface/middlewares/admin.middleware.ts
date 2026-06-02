import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }

  next();
};
