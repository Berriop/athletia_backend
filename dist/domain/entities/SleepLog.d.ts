export interface SleepLog {
    id: string;
    hoursSlept: number;
    sleepQuality: number;
    hadNightmares: boolean;
    stressLevel: number;
    notes: string | null;
    date: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
