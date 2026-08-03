import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, meta?: PaginationMeta, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, undefined, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
