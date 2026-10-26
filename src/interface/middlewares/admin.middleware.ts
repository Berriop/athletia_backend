import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No se envió el token de acceso' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Acceso denegado: se requieren permisos de administrador' });
  }

  next();
};
