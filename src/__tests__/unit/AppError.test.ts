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
    // Arrange
    const message = 'Custom message';
    const statusCode = 418;
    const code = 'TEAPOT';
    const isOperational = true;
    const details = { foo: 'bar' };

    // Act
    const error = new AppError(message, statusCode, code, isOperational, details);

    // Assert
    expect(error.message).toBe('Custom message');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual({ foo: 'bar' });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it('ValidationError has status 400 and VALIDATION_ERROR code', () => {
    // Arrange
    const message = 'Bad input';
    const details = [{ field: 'email', message: 'invalid' }];

    // Act
    const err = new ValidationError(message, details);

    // Assert
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'email', message: 'invalid' }]);
  });

  it('UnauthorizedError has status 401', () => {
    // Act
    const err = new UnauthorizedError();

    // Assert
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError has status 403', () => {
    // Act
    const err = new ForbiddenError();

    // Assert
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('NotFoundError has status 404', () => {
    // Arrange
    const message = 'Item not found';

    // Act
    const err = new NotFoundError(message);

    // Assert
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('ConflictError has status 409', () => {
    // Arrange
    const message = 'Email in use';

    // Act
    const err = new ConflictError(message);

    // Assert
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('TooManyRequestsError has status 429', () => {
    // Act
    const err = new TooManyRequestsError();

    // Assert
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('TOO_MANY_REQUESTS');
  });

  it('ExternalServiceError has status 502', () => {
    // Arrange
    const message = 'Google Maps API down';

    // Act
    const err = new ExternalServiceError(message);

    // Assert
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('EXTERNAL_SERVICE_ERROR');
  });
});
