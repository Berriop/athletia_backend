import { describe, it, expect } from 'vitest';
import { CreateInjurySchema, UpdateInjurySchema } from '../../application/dto/injury.dto';

// RF-18 (crear) y RF-20 (modificar) lesión. Refuerzo de validación agregado
// tras encontrar, en pruebas manuales reales contra la app, que bodyArea e
// injuryName aceptaban números/símbolos y que superar el límite de longitud
// no mostraba un mensaje controlado al usuario (ver InjuriesPage.tsx).
describe('Injury DTO Validation (solo letras + longitud máxima)', () => {
  const validPayload = {
    bodyArea: 'Rodilla derecha',
    injuryName: 'Esguince',
    severity: 6,
    isActive: true,
  };

  it('acepta un payload válido con letras, tildes y espacios', async () => {
    // Arrange
    const payload = { body: { ...validPayload, bodyArea: 'Región lumbar', injuryName: 'Contractura muscular' } };

    // Act
    const result = await CreateInjurySchema.parseAsync(payload);

    // Assert
    expect(result.body.bodyArea).toBe('Región lumbar');
    expect(result.body.injuryName).toBe('Contractura muscular');
  });

  it('rechaza bodyArea con números', async () => {
    // Arrange
    const payload = { body: { ...validPayload, bodyArea: 'Rodilla2' } };

    // Act & Assert
    await expect(CreateInjurySchema.parseAsync(payload)).rejects.toThrow();
  });

  it('rechaza injuryName con símbolos especiales', async () => {
    // Arrange
    const payload = { body: { ...validPayload, injuryName: 'Esguince!!' } };

    // Act & Assert
    await expect(CreateInjurySchema.parseAsync(payload)).rejects.toThrow();
  });

  it('rechaza injuryName de más de 250 caracteres con un mensaje controlado', async () => {
    // Arrange
    const payload = { body: { ...validPayload, injuryName: 'a'.repeat(251) } };

    // Act
    const result = await CreateInjurySchema.safeParseAsync(payload);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('injuryName'));
      expect(issue?.message).toBe('El nombre de la lesión no puede superar los 250 caracteres');
    }
  });

  it('rechaza bodyArea de más de 250 caracteres con un mensaje controlado', async () => {
    // Arrange
    const payload = { body: { ...validPayload, bodyArea: 'a'.repeat(251) } };

    // Act
    const result = await CreateInjurySchema.safeParseAsync(payload);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('bodyArea'));
      expect(issue?.message).toBe('El área del cuerpo no puede superar los 250 caracteres');
    }
  });

  it('acepta exactamente 250 caracteres (límite inclusivo)', async () => {
    // Arrange
    const payload = { body: { ...validPayload, injuryName: 'a'.repeat(250) } };

    // Act
    const result = await CreateInjurySchema.parseAsync(payload);

    // Assert
    expect(result.body.injuryName).toHaveLength(250);
  });

  it('UpdateInjurySchema: aplica las mismas reglas cuando el campo sí se envía', async () => {
    // Arrange
    const payload = { body: { injuryName: 'Torcedura9' } };

    // Act & Assert
    await expect(UpdateInjurySchema.parseAsync(payload)).rejects.toThrow();
  });

  it('UpdateInjurySchema: no exige bodyArea/injuryName cuando no se envían (son opcionales)', async () => {
    // Arrange
    const payload = { body: { severity: 8 } };

    // Act
    const result = await UpdateInjurySchema.parseAsync(payload);

    // Assert
    expect(result.body.severity).toBe(8);
    expect(result.body.bodyArea).toBeUndefined();
  });
});
