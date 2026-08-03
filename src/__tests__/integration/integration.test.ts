import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';

describe('API Integration Workflows', () => {
  const testUser = {
    id: 'user-uuid-123',
    email: 'integration@example.com',
    password: '$2b$10$mockedhashedpassword12345678901234567890',
    name: 'Integration Tester',
    birthDate: null,
    gender: 'MALE' as const,
    heightCm: 180,
    weightKg: 75,
    experienceLevel: 'INTERMEDIATE' as const,
    role: 'USER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validToken = container.jwtService.generateToken({
    id: testUser.id,
    email: testUser.email,
    role: testUser.role,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Auth Endpoints', () => {
    it('POST /api/v1/auth/register creates user and returns token', async () => {
      vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(null);
      vi.spyOn(container.userRepository, 'create').mockResolvedValue(testUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'StrongP@ss1234',
          confirmPassword: 'StrongP@ss1234',
          name: 'Integration Tester',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('GET /api/v1/auth/me returns current user profile', async () => {
      vi.spyOn(container.userRepository, 'findById').mockResolvedValue(testUser);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
    });
  });

  describe('Workout Endpoints', () => {
    const mockWorkout = {
      id: 'workout-1',
      title: 'Chest Day',
      description: 'Bench press and pushups',
      bodyPart: 'CHEST' as const,
      durationMinutes: 45,
      energyLevel: 8,
      fatigueLevel: 5,
      painLevel: 1,
      date: new Date(),
      userId: testUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('POST /api/v1/workouts creates workout for authenticated user', async () => {
      vi.spyOn(container.workoutRepository, 'create').mockResolvedValue(mockWorkout);

      const response = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Chest Day',
          bodyPart: 'CHEST',
          durationMinutes: 45,
          energyLevel: 8,
          fatigueLevel: 5,
          painLevel: 1,
          date: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Chest Day');
    });

    it('GET /api/v1/workouts returns paginated workouts', async () => {
      vi.spyOn(container.workoutRepository, 'findAll').mockResolvedValue([mockWorkout]);
      vi.spyOn(container.workoutRepository, 'count').mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/workouts?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('DELETE /api/v1/workouts/:id deletes workout (204 No Content)', async () => {
      vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(mockWorkout);
      vi.spyOn(container.workoutRepository, 'delete').mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/v1/workouts/workout-1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });
  });
});
