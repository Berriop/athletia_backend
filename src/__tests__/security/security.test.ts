import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { ForbiddenError } from '../../domain/errors/AppError';

describe('Security Verification Tests', () => {
  it('includes Helmet HTTP security headers in responses', async () => {
    const response = await request(app).get('/health');
    expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
  });

  it('rejects CORS requests from non-whitelisted origins', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://unauthorized-malicious-domain.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects requests to protected endpoints without Bearer token (401)', async () => {
    const response = await request(app).get('/api/v1/workouts');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects requests to protected endpoints with an invalid token (401)', async () => {
    const response = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', 'Bearer invalid_garbage_token_123');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects registration with a weak password (400)', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'security-test@example.com',
      password: '123',
      confirmPassword: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
