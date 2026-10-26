import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes' });
    }

    next();
  };
};
