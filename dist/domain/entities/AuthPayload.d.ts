export interface AuthPayload {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
}
