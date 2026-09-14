import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../../application/dto/auth.dto';

describe('Auth DTO Validation (Password Policy & Double Verification)', () => {
  const validUser = {
    email: 'user@example.com',
    password: 'StrongP@ss1234',
    confirmPassword: 'StrongP@ss1234',
  };

  it('accepts a valid registration payload with a strong password', async () => {
    // Arrange
    const payload = { body: validUser };

    // Act
    const result = await RegisterSchema.parseAsync(payload);

    // Assert
    expect(result.body.email).toBe(validUser.email);
    expect(result.body.password).toBe(validUser.password);
  });

  it('rejects passwords under 12 characters', async () => {
    // Arrange
    const shortPasswordUser = {
      ...validUser,
      password: 'Short1!',
      confirmPassword: 'Short1!',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: shortPasswordUser })).rejects.toThrow();
  });

  it('rejects passwords missing uppercase letters', async () => {
    // Arrange
    const noUpperUser = {
      ...validUser,
      password: 'strongp@ss1234',
      confirmPassword: 'strongp@ss1234',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: noUpperUser })).rejects.toThrow();
  });

  it('rejects passwords missing lowercase letters', async () => {
    // Arrange
    const noLowerUser = {
      ...validUser,
      password: 'STRONGP@SS1234',
      confirmPassword: 'STRONGP@SS1234',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: noLowerUser })).rejects.toThrow();
  });

  it('rejects passwords missing numbers', async () => {
    // Arrange
    const noNumUser = {
      ...validUser,
      password: 'StrongP@ssword',
      confirmPassword: 'StrongP@ssword',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: noNumUser })).rejects.toThrow();
  });

  it('rejects passwords missing special characters/symbols', async () => {
    // Arrange
    const noSymbolUser = {
      ...validUser,
      password: 'StrongPass1234',
      confirmPassword: 'StrongPass1234',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: noSymbolUser })).rejects.toThrow();
  });

  it('rejects registration when confirmPassword does not match password', async () => {
    // Arrange
    const mismatchedUser = {
      ...validUser,
      password: 'StrongP@ss1234',
      confirmPassword: 'DifferentP@ss1234',
    };

    // Act & Assert
    await expect(RegisterSchema.parseAsync({ body: mismatchedUser })).rejects.toThrow();
  });
});

// RF-32 — Recuperar contraseña. Validación de los endpoints forgot-password
// y reset-password (antes sin esquema Zod: devolvían 500 en lugar de 400).
describe('ForgotPasswordSchema', () => {
  it('accepts a valid email', async () => {
    // Act
    const result = await ForgotPasswordSchema.parseAsync({ body: { email: 'user@example.com' } });

    // Assert
    expect(result.body.email).toBe('user@example.com');
  });

  it('rejects an invalid email format', async () => {
    // Act & Assert
    await expect(ForgotPasswordSchema.parseAsync({ body: { email: 'not-an-email' } })).rejects.toThrow();
  });

  it('rejects a missing email', async () => {
    // Act & Assert
    await expect(ForgotPasswordSchema.parseAsync({ body: {} })).rejects.toThrow();
  });
});

describe('ResetPasswordSchema', () => {
  const validReset = {
    token: 'abc123',
    newPassword: 'StrongP@ss1234',
  };

  it('accepts a valid token and strong new password', async () => {
    // Act
    const result = await ResetPasswordSchema.parseAsync({ body: validReset });

    // Assert
    expect(result.body.token).toBe('abc123');
    expect(result.body.newPassword).toBe('StrongP@ss1234');
  });

  it('rejects a missing token', async () => {
    // Act & Assert
    await expect(ResetPasswordSchema.parseAsync({ body: { newPassword: 'StrongP@ss1234' } })).rejects.toThrow();
  });

  it('rejects a weak new password (short)', async () => {
    // Act & Assert
    await expect(
      ResetPasswordSchema.parseAsync({ body: { token: 'abc123', newPassword: 'Short1!' } }),
    ).rejects.toThrow();
  });

  it('rejects a new password without special characters', async () => {
    // Act & Assert
    await expect(
      ResetPasswordSchema.parseAsync({ body: { token: 'abc123', newPassword: 'StrongPass1234' } }),
    ).rejects.toThrow();
  });
});
