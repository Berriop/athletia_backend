export interface IEmailService {
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendVerificationEmail(email: string, token: string): Promise<void>;
}

export class ConsoleEmailService implements IEmailService {
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`\n========================================`);
    console.log(`EMAIL SIMULADO (Recuperación de contraseña)`);
    console.log(`Para: ${email}`);
    console.log(`Asunto: Recupera tu contraseña en Athletia`);
    console.log(`Token: ${token}`);
    console.log(`Link: http://localhost:5173/reset-password?token=${token}`);
    console.log(`========================================\n`);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`\n========================================`);
    console.log(`EMAIL SIMULADO (Verificación de correo)`);
    console.log(`Para: ${email}`);
    console.log(`Asunto: Verifica tu cuenta en Athletia`);
    console.log(`Token: ${token}`);
    console.log(`Link: http://localhost:5173/verify-email?token=${token}`);
    console.log(`========================================\n`);
  }
}
