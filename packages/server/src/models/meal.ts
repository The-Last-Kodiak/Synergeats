export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  imgSrc?: string;
}
