import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  ExternalServiceError,
} from '../../domain/errors/AppError';

describe('AppError Hierarchy', () => {
  it('AppError creates instance with correct properties', () => {
    const error = new AppError('Custom message', 418, 'TEAPOT', true, { foo: 'bar' });
    expect(error.message).toBe('Custom message');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual({ foo: 'bar' });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it('ValidationError has status 400 and VALIDATION_ERROR code', () => {
    const err = new ValidationError('Bad input', [{ field: 'email', message: 'invalid' }]);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'email', message: 'invalid' }]);
  });

  it('UnauthorizedError has status 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError has status 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('NotFoundError has status 404', () => {
    const err = new NotFoundError('Item not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('ConflictError has status 409', () => {
    const err = new ConflictError('Email in use');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('TooManyRequestsError has status 429', () => {
    const err = new TooManyRequestsError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('TOO_MANY_REQUESTS');
  });

  it('ExternalServiceError has status 502', () => {
    const err = new ExternalServiceError('Google Maps API down');
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('EXTERNAL_SERVICE_ERROR');
  });
});
