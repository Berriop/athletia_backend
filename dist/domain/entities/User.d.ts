export interface User {
    id: string;
    email: string;
    password?: string;
    name: string | null;
    birthDate: Date | null;
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
    experienceLevel: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}
