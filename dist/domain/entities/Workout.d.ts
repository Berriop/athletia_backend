export interface Workout {
    id: string;
    title: string;
    description: string | null;
    bodyPart: string;
    durationMinutes: number;
    energyLevel: number;
    fatigueLevel: number;
    painLevel: number;
    date: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
