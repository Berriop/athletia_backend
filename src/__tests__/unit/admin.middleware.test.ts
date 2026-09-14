import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { adminMiddleware } from '../../interface/middlewares/admin.middleware';
import { AuthPayload } from '../../domain/entities/AuthPayload';

// RF-22 — Restricción de rutas de administración por rol. Basado en el
// diagrama "RF-22 Back (adminMiddleware)" (Patrón A, V(G)=3, 3 caminos básicos).
function mockResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('adminMiddleware', () => {
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockResponse();
    next = vi.fn();
  });

  // Camino 1: INICIO,1,2,FIN
  it('Camino 1: sin usuario autenticado → 401 y no continúa', () => {
    const req = {} as Request;

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,3,4,FIN
  it('Camino 2: usuario autenticado sin rol ADMIN → 403 y no continúa', () => {
    const req = { user: { id: 'u1', email: 'user@test.com', role: 'USER' } as AuthPayload } as Request;

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  // Camino 3: INICIO,1,3,5,FIN
  it('Camino 3: usuario autenticado con rol ADMIN → continúa a la ruta protegida', () => {
    const req = { user: { id: 'a1', email: 'admin@test.com', role: 'ADMIN' } as AuthPayload } as Request;

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
