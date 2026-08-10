export type Role = 'USER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string | null;
  birthDate: Date | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  experienceLevel: ExperienceLevel | null;
  role: Role;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
