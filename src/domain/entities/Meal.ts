export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  mealType: MealType;
  proteinG: number;
  carbsG: number;
  fatG: number;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
