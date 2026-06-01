export interface Meal {
  id: string;
  name: string;
  calories: number;
  mealType: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
