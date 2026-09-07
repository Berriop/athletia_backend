import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server';

describe('Security Verification Tests', () => {
  it('includes Helmet HTTP security headers in responses', async () => {
    // Act
    const response = await request(app).get('/health');

    // Assert
    expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
  });

  it('rejects CORS requests from non-whitelisted origins', async () => {
    // Arrange
    const maliciousOrigin = 'http://unauthorized-malicious-domain.com';

    // Act
    const response = await request(app).get('/health').set('Origin', maliciousOrigin);

    // Assert
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects requests to protected endpoints without Bearer token (401)', async () => {
    // Act
    const response = await request(app).get('/api/v1/workouts');

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects requests to protected endpoints with an invalid token (401)', async () => {
    // Arrange
    const invalidToken = 'invalid_garbage_token_123';

    // Act
    const response = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', `Bearer ${invalidToken}`);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects registration with a weak password (400)', async () => {
    // Arrange
    const weakPasswordPayload = {
      email: 'security-test@example.com',
      password: '123',
      confirmPassword: '123',
    };

    // Act
    const response = await request(app).post('/api/v1/auth/register').send(weakPasswordPayload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
